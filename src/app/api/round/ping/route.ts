import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { round_id, units } = body;

    if (round_id) {
      try {
        await updateDoc(doc(db, 'rounds', round_id), {
          units: Number(units) || 0,
          lastPing: new Date().toISOString()
        });
      } catch (e) {}
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: true });
  }
}
