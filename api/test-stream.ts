import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test streaming endpoint called');
    
    // Create a simple streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send test chunks
          for (let i = 0; i < 5; i++) {
            const data = JSON.stringify({ 
              type: 'chunk', 
              content: `Test chunk ${i + 1} `,
              fullResponse: `Test chunk ${i + 1} `
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            
            // Small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Test streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Test streaming interrupted' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Test streaming API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test streaming response' },
      { status: 500 }
    );
  }
}