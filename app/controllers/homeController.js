const db = require("../config/database");

exports.index = async (req, res) => {
  try {
    // 1. CATAT KUNJUNGAN (Auto Increment untuk hari ini)
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    await db.query(
      `
            INSERT INTO statistik_kunjung (tanggal, jumlah_views) 
            VALUES (?, 1) 
            ON DUPLICATE KEY UPDATE jumlah_views = jumlah_views + 1
        `,
      [today]
    );

    // 2. AMBIL DATA PRODUK (Kode Lama)
    const query = `
            SELECT p.*, u.nama AS nama_penjual, u.no_hp 
            FROM produk p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.status = 'tersedia' 
            ORDER BY p.created_at DESC
        `;
    const [products] = await db.query(query);

    res.render("home", {
      products: products,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error("Error di Home Controller:", error);
    res.status(500).send("Server Error");
  }
};
