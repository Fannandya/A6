USE jbmotor_db;

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Ingat, di real app ini harus di-hash!
    role ENUM('admin', 'user') DEFAULT 'user',
    no_hp VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Produk 
CREATE TABLE IF NOT EXISTS produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    merek VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    tahun INT NOT NULL,
    cc INT NOT NULL,
    harga DECIMAL(15, 2) NOT NULL,
    deskripsi TEXT,
    gambar VARCHAR(255),
    status ENUM('tersedia', 'terjual') DEFAULT 'tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Transaksi 
CREATE TABLE IF NOT EXISTS transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT,
    pembeli_id INT,
    tanggal_transaksi DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'selesai', 'dibatalkan') DEFAULT 'pending',
    FOREIGN KEY (produk_id) REFERENCES produk(id),
    FOREIGN KEY (pembeli_id) REFERENCES users(id)
);

-- DUMMY DATA 

-- Insert Admin & User Dummy
INSERT INTO users (nama, email, password, role, no_hp) VALUES 
('Admin JB', 'admin@jbmotor.com', 'admin123', 'admin', '081234567890'),
('Tama User', 'tama@gmail.com', 'tama123', 'user', '089876543210');

-- Insert Motor Dummy (Milik Tama)
INSERT INTO produk (user_id, merek, model, tahun, cc, harga, deskripsi, status) VALUES 
(2, 'Honda', 'Vario 160', 2023, 160, 25000000, 'Mulus no minus, pajak hidup', 'tersedia'),
(2, 'Yamaha', 'NMAX 155', 2022, 155, 28000000, 'Surat lengkap, pemakaian pribadi', 'tersedia');