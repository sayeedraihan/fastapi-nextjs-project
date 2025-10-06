import { NextResponse } from 'next/server'
 
export async function POST(request: Request) {
  try {
    const { student_id } = await request.json();
 
    const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/get-courses-and-performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id }),
    });
 
    if (!fastApiResponse.ok) {
      const errorData = await fastApiResponse.json();
      return NextResponse.json(errorData, { status: fastApiResponse.status });
    }
 
    const data = await fastApiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
  }
}