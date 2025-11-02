import { type NextRequest, NextResponse } from "next/server"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.slice(7)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // In production, delete from storage and database
    return NextResponse.json({
      message: "File deleted successfully",
      id,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
