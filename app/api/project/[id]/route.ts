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

// Convert buffer to stream
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

// Get project data by ID
export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "Error retrieving project");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

// Update an existing project by ID
export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json({ error: "Project ID is required for update" }, { status: 400 });
    }

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

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload error'));
          } else {
            resolve(result?.secure_url || '');
          }
        });

        bufferToStream(logoBuffer).pipe(uploadStream);
      });

      logoPath = uploadResult as string;
    }

    if (thumbnailFile) {
      const thumbnailByteData = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailByteData);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload error'));
          } else {
            resolve(result?.secure_url || '');
          }
        });

        bufferToStream(thumbnailBuffer).pipe(uploadStream);
      });

      thumbnailPath = uploadResult as string;
    }

    await connectDB();
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Prepare updated data
    const updatedData = {
      title: title || project.title,
      description: description || project.description,
      techUsed: techUsed || project.techUsed,
      logo: logoPath || project.logo, // Preserve existing logo if not updated
      thumbnail: thumbnailPath || project.thumbnail, // Preserve existing thumbnail if not updated
      githubLink: githubLink || project.githubLink,
      demoLink: demoLink || project.demoLink,
      tag: tag || project.tag,
    };

    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, { new: true });
    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "Error updating project");
    const status = error instanceof Error && error.name === "ValidationError" ? 422 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status });
  }
};

// Delete an existing project by ID
export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json({ error: "Project ID is required for delete" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    if (project.logo) {
      const publicId = project.logo.split('/').pop()?.split('.')[0] || '';
      await cloudinary.uploader.destroy(publicId);
    }

    if (project.thumbnail) {
      const publicId = project.thumbnail.split('/').pop()?.split('.')[0] || '';
      await cloudinary.uploader.destroy(publicId);
    }

    await Project.findByIdAndDelete(id);
    return NextResponse.json({ message: `Project with ID: ${id} has been deleted successfully` }, { status: 200 });
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "Error deleting project");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
