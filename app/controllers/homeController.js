const db = require("../config/database");

exports.index = async (req, res) => {
  try {
    // 1. Ambil input dari pencarian
    const { searchMerek, searchCC } = req.query;

    // 2. Siapkan Query Dasar (PAKAI LEFT JOIN & COALESCE)
    // Penjelasan:
    // - LEFT JOIN: Biar motor yang gak punya user_id (upload manual) TETAP MUNCUL.
    // - COALESCE: Prioritaskan nama_penjual di tabel produk. Kalau kosong, baru ambil nama user.
    let query = `
      SELECT p.*, 
             COALESCE(p.nama_penjual, u.nama) AS nama_penjual, 
             COALESCE(p.no_hp, u.no_hp) AS no_hp 
      FROM produk p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE p.status = 'tersedia'
    `;
    let params = [];

    // 3. Tambahkan Filter jika user mencari sesuatu
    if (searchMerek) {
      query += " AND p.merek LIKE ?";
      params.push(`%${searchMerek}%`);
    }
    if (searchCC) {
      query += " AND p.cc LIKE ?";
      params.push(`%${searchCC}%`);
    }

    query += " ORDER BY p.created_at DESC";

    // 4. Jalankan Query
    const [products] = await db.query(query, params);

    // 5. Cek hasil pencarian
    const isSearching = searchMerek || searchCC;
    const notFound = isSearching && products.length === 0;

    res.render("home", {
      products: products,
      user: req.session.user || null,
      searchMerek: searchMerek || "",
      searchCC: searchCC || "",
      notFound: notFound,
    });
  } catch (error) {
    console.error("Error di Home Controller:", error);
    res.status(500).send("Server Error");
  }
};

// ... (Fungsi dashboardUser di bawahnya JANGAN DIHAPUS, biarkan tetap ada)
exports.dashboardUser = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  try {
    // Dashboard user juga sebaiknya pakai query yang sama kalau mau menampilkan info penjual
    const [products] = await db.query(
      "SELECT * FROM produk WHERE status = 'tersedia' ORDER BY created_at DESC"
    );
    res.render("user_dashboard", {
      user: req.session.user,
      products: products,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};
