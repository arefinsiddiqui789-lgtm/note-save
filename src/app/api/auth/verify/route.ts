import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/?auth=verify-failed&reason=no-token", req.url)
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/?auth=verify-failed&reason=invalid-token", req.url)
      );
    }

    // Check if token expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await db.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/?auth=verify-failed&reason=token-expired", req.url)
      );
    }

    // Find user by email (identifier)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/?auth=verify-failed&reason=user-not-found", req.url)
      );
    }

    if (user.emailVerified) {
      // Already verified, just clean up token
      await db.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/?auth=already-verified", req.url)
      );
    }

    // Verify the user
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Clean up used token
    await db.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/?auth=verify-success", req.url)
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL("/?auth=verify-failed&reason=server-error", req.url)
    );
  }
}
