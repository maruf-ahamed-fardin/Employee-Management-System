import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { userRepository } from '@/server/repositories/user.repository';
import { encodeSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check DB user
    let user = await userRepository.findByEmail(cleanEmail);

    // If no user found in DB, check demo credentials
    if (!user) {
      // Create user on-the-fly for seamless zero-setup demo
      let role: any = 'employee';
      let name = 'Demo Employee';

      if (cleanEmail.includes('superadmin')) {
        role = 'superadmin';
        name = 'Super Admin';
      } else if (cleanEmail.includes('admin') || cleanEmail.includes('hr')) {
        role = 'admin';
        name = 'HR Administrator';
      } else if (cleanEmail.includes('manager')) {
        role = 'manager';
        name = 'Department Manager';
      }

      user = (await userRepository.create({
        email: cleanEmail,
        password: password,
        passwordHash: 'demo_hashed_pass',
        role,
      })) as any;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User could not be loaded' }, { status: 404 });
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: (user.role as any) || 'employee',
      employeeId: user.employeeId,
      employeeName: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email.split('@')[0],
      employeeCode: user.employee?.employeeCode,
      departmentName: user.employee?.department?.name,
      status: (user.status as any) || 'ACTIVE',
    };

    const token = await encodeSession(sessionPayload);

    // Set secure cookie
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
      message: 'Signed in successfully',
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Login failed', 500);
  }
}
