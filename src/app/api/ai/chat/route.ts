import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    // Build conversation messages
    const systemMessage = {
      role: "assistant" as const,
      content:
        "You are a helpful AI assistant specialized in Computer Science and Engineering. You provide clear, beginner-friendly explanations for CSE concepts like data structures, algorithms, operating systems, databases, networking, and programming. Keep your answers concise but thorough. Use examples when helpful. Format your responses with markdown for readability. If asked non-CSE questions, gently redirect to CS topics while still being helpful.",
    };

    const conversationHistory = (history || [])
      .slice(-10) // Keep last 10 messages for context
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
