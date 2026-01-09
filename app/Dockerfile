# Pakai base image Node.js yang ringan
FROM node:18-alpine

# Bikin folder kerja di dalam container
WORKDIR /usr/src/app

# Copy file resep (package.json) dulu biar cache-nya optimal
COPY package*.json ./

# Install bahan-bahan (dependencies)
RUN npm install

# Copy semua sisa kodingan ke dalam container
COPY . .

# Buka port 3000 (Port internal aplikasi)
EXPOSE 3000

# Perintah buat menyalakan server
CMD ["npm", "start"]