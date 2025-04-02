import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/src/6shared/db';

export async function GET(req: NextRequest) {
  try {
    const client = await connectDB;
    const db = client.db('bim');

    return NextResponse.json({ message: 'MongoDB connected successfully' }, { status: 200 });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ message: 'MongoDB connection error' }, { status: 500 });
  }
}
