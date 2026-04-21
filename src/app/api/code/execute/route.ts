import { NextRequest, NextResponse } from "next/server";

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python3", version: "3.12.6" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language } = body as { code: string; language: string };

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      const response = await fetch(
        "https://emkc.org/api/v2/piston/execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: langConfig.language,
            version: langConfig.version,
            files: [{ content: code }],
          }),
        }
      );

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          stdout: "",
          stderr: `Execution service error: ${response.status} - ${errorText}`,
          exitCode: 1,
          executionTime,
        });
      }

      const result = await response.json();

      return NextResponse.json({
        stdout: result.run?.stdout || "",
        stderr: result.run?.stderr || "",
        exitCode: result.run?.code ?? 0,
        executionTime,
        signal: result.run?.signal || null,
      });
    } catch (fetchError) {
      const executionTime = Date.now() - startTime;
      // If Piston API is unreachable, provide a helpful error
      return NextResponse.json({
        stdout: "",
        stderr:
          "Unable to connect to execution service. Please check your internet connection and try again.\n\nNote: Code execution requires an external API service.",
        exitCode: 1,
        executionTime,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
