import { successResponse } from '@/lib/api/response';

export async function GET() {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'SeloraX EMS API',
  });
}
