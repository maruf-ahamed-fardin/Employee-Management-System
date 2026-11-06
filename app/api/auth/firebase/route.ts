import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { userRepository } from '@/server/repositories/user.repository';
import { verifyFirebaseToken, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { encodeSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return errorResponse('Firebase ID token is required', 400);
    }

    if (!isFirebaseAdminConfigured()) {
      return errorResponse(
        'Firebase Admin is not configured on the server. Please check your FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.',
        500
      );
    }

    // 1. Verify Firebase token
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err: any) {
      return errorResponse(`Invalid Firebase token: ${err?.message || 'Verification failed'}`, 401);
    }

    const email = decoded.email?.toLowerCase().trim();
    if (!email) {
      return errorResponse('No email found in Firebase account', 400);
    }

    const providerId = decoded.firebase?.sign_in_provider || 'firebase';

    // 2. Check email verification (required for email/password)
    // Google sign-in is already email_verified: true by Google
    if (providerId === 'password' && !decoded.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is not verified. Please check your inbox and verify your email before logging in.',
          emailVerified: false,
        },
        { status: 403 }
      );
    }

    // 3. Find existing user
    let user = await userRepository.findByFirebaseUid(decoded.uid);

    if (!user) {
      // Find by email to link legacy / pre-created accounts
      user = await userRepository.findByEmail(email);

      if (user) {
        // Link existing user account to Firebase UID
        user = await userRepository.linkFirebaseUid(user.id, decoded.uid, providerId);
      }
    }

    // 4. If no user exists, create one with role = 'employee'
    if (!user) {
      // Check if an Employee record exists with this email for auto-linking
      let linkedEmployeeId: string | null = null;
      const matchedEmployee = await prisma.employee.findUnique({
        where: { email },
      });

      if (matchedEmployee) {
        // Ensure this employee isn't already claimed by another user
        const claimed = await prisma.user.findUnique({
          where: { employeeId: matchedEmployee.id },
        });
        if (!claimed) {
          linkedEmployeeId = matchedEmployee.id;
        }
      }

      // Create new user - ALWAYS role 'employee' for self-signup
      user = await userRepository.create({
        email,
        role: 'employee',
        firebaseUid: decoded.uid,
        authProvider: providerId,
        employeeId: linkedEmployeeId,
        status: 'ACTIVE',
      });
    } else if (!user.employeeId) {
      // If user exists without linked employee, check if matching employee exists now
      const matchedEmployee = await prisma.employee.findUnique({
        where: { email },
      });
      if (matchedEmployee) {
        const claimed = await prisma.user.findUnique({
          where: { employeeId: matchedEmployee.id },
        });
        if (!claimed) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { employeeId: matchedEmployee.id },
            include: {
              employee: {
                include: {
                  department: true,
                  position: true,
                },
              },
            },
          });
        }
      }
    }

    // 5. Account status checks
    if (user.status === 'LOCKED' || user.status === 'INACTIVE') {
      return errorResponse('Your account is currently disabled. Please contact your HR administrator.', 403);
    }

    // 6. Update last login
    await userRepository.updateLastLogin(user.id);

    // 7. Prepare session payload
    const employeeFullName = user.employee
      ? `${user.employee.firstName} ${user.employee.lastName}`.trim()
      : decoded.name || email.split('@')[0];

    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: (user.role as any) || 'employee',
      employeeId: user.employeeId,
      employeeName: employeeFullName,
      employeeCode: user.employee?.employeeCode,
      departmentName: user.employee?.department?.name,
      status: (user.status as any) || 'ACTIVE',
      photoUrl: user.employee?.photoUrl || decoded.picture,
    };

    const token = await encodeSession(sessionPayload);

    // 8. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return successResponse({
      user: sessionPayload,
      message: 'Signed in successfully via Firebase',
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Authentication failed', 500);
  }
}

