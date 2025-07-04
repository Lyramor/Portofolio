// File: /pages/api/admin/upload.js (Next.js Pages Router API)
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
export const dynamic = 'force-dynamic';

// Setup upload directory
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Fix SVG extension issue
    let extension = path.extname(file.originalname);
    
    // Explicitly handle SVG files
    if (file.mimetype === 'image/svg+xml') {
      extension = '.svg'; // Always use .svg extension for SVG files
    } else if (!extension) {
      // If no extension, derive from mimetype
      extension = `.${file.mimetype.split('/')[1]}`;
    }
    
    cb(null, uniqueFilename + extension);
  }
});

// Multer file filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: fileFilter,
});

// Create API handler
const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Upload failed: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Add multer middleware
apiRoute.use(upload.single('image'));

// Handle POST request
apiRoute.post((req, res) => {
  // File uploaded successfully
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return the URL path to access the file
  const imageUrl = `/uploads/${file.filename}`;
  
  res.status(200).json({ 
    success: true, 
    imageUrl 
  });
});

// Disable body parser as multer will handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;