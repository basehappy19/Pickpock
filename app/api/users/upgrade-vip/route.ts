/**
 * VIP Upgrade API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import usersJson from '@/lib/users.json';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // In a real app, this would process payment and update database
    // For now, we'll calculate expiry date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Find user and update (in real implementation, use database)
    const userIndex = usersJson.findIndex((u: any) => u.user_id === userId || u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString(),
      message: 'VIP upgraded successfully'
    });
  } catch (error) {
    console.error('VIP upgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check VIP status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const user = usersJson.find((u: any) => u.user_id === userId || u.id === userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    isVip: user.isVip,
    expiresAt: (user as any).vipExpiresAt || null,
    discountPercent: user.isVip ? 10 : 0
  });
}
