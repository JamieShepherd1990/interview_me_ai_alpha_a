import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'API test endpoint is working'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      status: 'working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to parse request',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}
