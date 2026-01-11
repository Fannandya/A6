const db = require("../config/database");

// 1. HOMEPAGE (PUBLIK) - Tetap sama seperti sebelumnya
exports.index = async (req, res) => {
  try {
    const { searchMerek, searchCC } = req.query;

    let query = `
      SELECT p.*, 
             COALESCE(p.nama_penjual, u.nama) AS nama_penjual, 
             COALESCE(p.no_hp, u.no_hp) AS no_hp 
      FROM produk p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE p.status = 'tersedia'
    `;
    let params = [];

    if (searchMerek) {
      query += " AND p.merek LIKE ?";
      params.push(`%${searchMerek}%`);
    }
    if (searchCC) {
      query += " AND p.cc LIKE ?";
      params.push(`%${searchCC}%`);
    }

    query += " ORDER BY p.created_at DESC";

    const [products] = await db.query(query, params);

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
    console.error("Error Home:", error);
    res.status(500).send("Server Error");
  }
};

// 2. DASHBOARD USER (REVISI TOTAL: Menambahkan Fitur Search & Filter)
exports.dashboardUser = async (req, res) => {
  // Cek Login
  if (!req.session.user) return res.redirect("/login");

  try {
    // --- LOGIKA PENCARIAN (Sama persis dengan Homepage) ---
    const { searchMerek, searchCC } = req.query;

    let query = `
          SELECT p.*, 
                 COALESCE(p.nama_penjual, u.nama) AS nama_penjual, 
                 COALESCE(p.no_hp, u.no_hp) AS no_hp 
          FROM produk p 
          LEFT JOIN users u ON p.user_id = u.id 
          WHERE p.status = 'tersedia'
        `;
    let params = [];

    if (searchMerek) {
      query += " AND p.merek LIKE ?";
      params.push(`%${searchMerek}%`);
    }
    if (searchCC) {
      query += " AND p.cc LIKE ?";
      params.push(`%${searchCC}%`);
    }

    query += " ORDER BY p.created_at DESC";

    const [products] = await db.query(query, params);

    // Cek Not Found
    const isSearching = searchMerek || searchCC;
    const notFound = isSearching && products.length === 0;

    // Render ke halaman DASHBOARD dengan data lengkap
    res.render("user_dashboard", {
      user: req.session.user,
      products: products,
      searchMerek: searchMerek || "",
      searchCC: searchCC || "",
      notFound: notFound,
    });
  } catch (error) {
    console.error("Error Dashboard:", error);
    res.redirect("/");
  }
};
