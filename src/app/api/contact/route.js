// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
export const dynamic = 'force-dynamic';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_IP = 5;

// Simple in-memory store for rate limiting
// In a production app, you'd use Redis or another external store
const requestLog = new Map();

// Function to check rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  if (!requestLog.has(ip)) {
    requestLog.set(ip, []);
  }
  
  const requests = requestLog.get(ip).filter(timestamp => timestamp > windowStart);
  requestLog.set(ip, requests);
  
  // Check if rate limit is exceeded
  if (requests.length >= MAX_REQUESTS_PER_IP) {
    return false;
  }
  
  // Log this request
  requests.push(now);
  requestLog.set(ip, requests);
  return true;
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = contactSchema.parse(body);
    
    // Add some basic security measures
    const sanitizedSubject = validatedData.subject.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sanitizedMessage = validatedData.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'mmarsa2435@gmail.com', // Your email
      replyTo: validatedData.email,
      subject: `Portfolio Contact: ${sanitizedSubject}`,
      text: `
        Name: ${validatedData.name}
        Email: ${validatedData.email}
        
        Message:
        ${sanitizedMessage}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>From:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #0284c7;">
            <p style="white-space: pre-line;">${sanitizedMessage}</p>
          </div>
        </div>
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json(
      { message: 'Message sent successfully!' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}