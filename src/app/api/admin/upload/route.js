// File: /app/api/admin/upload/route.js (Next.js App Router API)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get file data
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename with more precision
    const originalName = file.name;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    let fileName = `${timestamp}-${randomStr}`;
    
    // Handle file extensions
    const fileType = file.type;
    let fileExtension;
    
    if (fileType === 'image/svg+xml') {
      fileExtension = '.svg';
    } else {
      fileExtension = path.extname(originalName);
      if (!fileExtension) {
        fileExtension = `.${fileType.split('/')[1]}`;
      }
    }
    
    fileName = fileName + fileExtension;
    
    // Determine folder based on referer
    const referer = request.headers.get('referer') || '';
    let uploadSubDir = 'skills';
    
    if (referer.includes('/projects')) {
      uploadSubDir = 'projects';
    } else if (referer.includes('/organizations') || referer.includes('/speaking')) {
      uploadSubDir = 'activities';
    }
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubDir);
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    
    // Write file to disk with verification
    fs.writeFileSync(filePath, buffer);
    
    // Verify file was actually written
    let retries = 3;
    while (retries > 0 && !fs.existsSync(filePath)) {
      console.log(`Retry ${4 - retries}: File not found, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      retries--;
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File verification failed: ${filePath}`);
    }
    
    // Verify file size matches
    const writtenStats = fs.statSync(filePath);
    if (writtenStats.size !== buffer.length) {
      throw new Error(`File size mismatch: expected ${buffer.length}, got ${writtenStats.size}`);
    }
    
    const imageUrl = `/uploads/${uploadSubDir}/${fileName}`;
    
    console.log(`File successfully uploaded and verified: ${filePath}`);
    console.log(`Image URL: ${imageUrl}, Size: ${writtenStats.size} bytes`);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      fileName: fileName,
      size: writtenStats.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
