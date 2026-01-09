const db = require('../config/database');

exports.index = async (req, res) => {
    try {
        // 1. CATAT KUNJUNGAN (Statistik)
        const today = new Date().toISOString().slice(0, 10);
        await db.query(`
            INSERT INTO statistik_kunjung (tanggal, jumlah_views) 
            VALUES (?, 1) 
            ON DUPLICATE KEY UPDATE jumlah_views = jumlah_views + 1
        `, [today]);

        // 2. AMBIL DATA PRODUK (REVISI LOGIKA)
        // Hapus JOIN users. Ambil langsung nama_penjual & no_hp dari tabel produk.
        const query = `
            SELECT * FROM produk 
            WHERE status = 'tersedia' 
            ORDER BY created_at DESC
        `;
        
        const [products] = await db.query(query);

        res.render('home', { 
            products: products,
            user: req.session.user || null 
        });

    } catch (error) {
        console.error("Error di Home Controller:", error);
        res.status(500).send("Server Error");
    }
};