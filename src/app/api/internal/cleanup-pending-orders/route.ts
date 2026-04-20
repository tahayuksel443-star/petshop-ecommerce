import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPendingOrders, getPaymentReservationTtlMs } from '@/lib/orderReservations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const headerSecret = req.headers.get('x-cron-secret');

  return bearerToken === secret || headerSecret === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 });
  }

  const result = await cleanupExpiredPendingOrders();

  return NextResponse.json({
    success: true,
    reservationTtlMs: getPaymentReservationTtlMs(),
    ...result,
  });
}
