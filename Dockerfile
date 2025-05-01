# Gunakan image Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy file konfigurasi
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Build project
RUN npm run build

# Expose port
EXPOSE 3000

# Jalankan Next.js
CMD ["npm", "run", "start"]
