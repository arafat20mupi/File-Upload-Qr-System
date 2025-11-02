import { type NextRequest, NextResponse } from "next/server"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.slice(7)
}

// Mock files database
const mockFiles = [
  {
    id: "1",
    name: "Document.pdf",
    size: 2048576,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=file1",
    shortUrl: "https://files.local/f1",
  },
  {
    id: "2",
    name: "Image.png",
    size: 1024576,
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=file2",
    shortUrl: "https://files.local/f2",
  },
]

export async function GET(request: NextRequest) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(mockFiles)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 })
    }

    // In production, upload to storage service
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${file.name}`,
      shortUrl: `https://files.local/f${Math.random().toString(36).substr(2, 5)}`,
    }

    return NextResponse.json(newFile, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
