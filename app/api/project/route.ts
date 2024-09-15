import { NextRequest, NextResponse } from "next/server";
import connectDB from "@utils/db";
import Project from "@models/Project";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Convert buffer to readable stream
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.getAll("search");
    const tag = req.nextUrl.searchParams.get("tag");

    await connectDB();

    let projects;

    if (searchQuery.length) {
      projects = await Project.find({
        title: { $in: searchQuery },
      });
    } else if (tag) {
      projects = await Project.find({
        tag: tag,
      });
    } else {
      projects = await Project.find();
    }

    return NextResponse.json(projects, { status: 200 });

  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.startsWith('multipart/form-data')) {
      return NextResponse.json({ message: "Invalid content type", success: false }, { status: 400 });
    }

    // Parse form data
    const formData = await req.formData();

    // Extract fields from form data
    const {
      title,
      description,
      techUsed,
      githubLink,
      demoLink,
      tag,
    } = Object.fromEntries(formData.entries());

    // Handle file uploads
    const logoFile = formData.get('logo') as any;
    const thumbnailFile = formData.get('thumbnail') as any;

    let logoPath = '';
    let thumbnailPath = '';

    if (logoFile) {
      const logoByteData = await logoFile.arrayBuffer();
      const logoBuffer = Buffer.from(logoByteData);

      const uploadResult = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload error'));
          } else {
            resolve(result?.secure_url || '');
          }
        });

        bufferToStream(logoBuffer).pipe(uploadStream);
      });

      logoPath = uploadResult;
    }

    if (thumbnailFile) {
      const thumbnailByteData = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailByteData);

      const uploadResult = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload error'));
          } else {
            resolve(result?.secure_url || '');
          }
        });

        bufferToStream(thumbnailBuffer).pipe(uploadStream);
      });

      thumbnailPath = uploadResult;
    }

    await connectDB();

    const project = new Project({
      title,
      description,
      techUsed,
      logo: logoPath,
      thumbnail: thumbnailPath,
      githubLink,
      demoLink,
      tag,
    });

    const addProject = await project.save();
    return NextResponse.json(addProject, { status: 201 });

  } catch (error: unknown) {
    console.error("Error processing request:", error);
    const status = error instanceof Error && error.name === "ValidationError" ? 422 : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status });
  }
}
