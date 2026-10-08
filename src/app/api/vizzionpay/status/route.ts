import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get('txId');

  if (!txId) {
    return NextResponse.json({ success: false, message: 'txId is required' }, { status: 400 });
  }

  // Returns pending or status
  return NextResponse.json({
    success: true,
    transactionId: txId,
    status: 'pending'
  });
}
