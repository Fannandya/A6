const db = require("../config/database");

// 1. DASHBOARD
exports.dashboard = async (req, res) => {
  try {
    const days = req.query.days || 7;
    const query = `
            SELECT DATE_FORMAT(tanggal, '%d %b') as tgl, jumlah_views 
            FROM statistik_kunjung 
            WHERE tanggal >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
            ORDER BY tanggal ASC
        `;
    const [stats] = await db.query(query, [days]);
    const labels = stats.map((s) => s.tgl);
    const data = stats.map((s) => s.jumlah_views);

    res.render("admin_dashboard", {
      user: req.session.user,
      chartLabels: JSON.stringify(labels),
      chartData: JSON.stringify(data),
      activeRange: days,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
};

// 2. KATALOG (REVISI: Ambil nama langsung dari tabel produk)
exports.katalog = async (req, res) => {
  try {
    // Kita gak perlu JOIN user lagi karena nama & hp udah ada di tabel produk
    const query = "SELECT * FROM produk ORDER BY created_at DESC";
    const [motor] = await db.query(query);

    res.render("admin_katalog", { products: motor, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }
};

// 3. UPLOAD PAGE (REVISI: Gak perlu ambil list user lagi)
exports.uploadPage = (req, res) => {
  res.render("admin_upload", { user: req.session.user });
};

// 4. PROSES UPLOAD (REVISI: Simpan nama manual & no hp manual)
exports.uploadProcess = async (req, res) => {
  const { nama_penjual, no_hp, merek, model, tahun, cc, harga, deskripsi } =
    req.body;
  const gambar = req.file ? req.file.filename : "default.jpg";

  try {
    // Masukkan data ke kolom baru (nama_penjual, no_hp)
    // user_id kita set NULL karena ini titipan manual
    const query = `
            INSERT INTO produk (nama_penjual, no_hp, merek, model, tahun, cc, harga, deskripsi, gambar, status, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'tersedia', NULL)
        `;
    await db.query(query, [
      nama_penjual,
      no_hp,
      merek,
      model,
      tahun,
      cc,
      harga,
      deskripsi,
      gambar,
    ]);
    res.redirect("/admin/katalog");
  } catch (error) {
    console.error("Gagal upload:", error);
    res.send("Gagal menyimpan data. Pastikan kolom database sudah diupdate.");
  }
};

// 5. DELETE
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM produk WHERE id = ?", [id]);
    res.redirect("/admin/katalog");
  } catch (error) {
    console.error(error);
    res.send("Gagal menghapus.");
  }
};

// 6. EDIT PAGE
exports.editPage = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM produk WHERE id = ?", [id]);
    if (rows.length === 0) return res.redirect("/admin/katalog");
    res.render("admin_edit", { motor: rows[0], user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/katalog");
  }
};

// 7. UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  // Tambahkan nama_penjual di sini kalau mau bisa diedit juga (optional)
  const { merek, model, tahun, cc, harga, deskripsi, oldGambar } = req.body;
  let gambar = oldGambar;
  if (req.file) gambar = req.file.filename;

  try {
    const query = `UPDATE produk SET merek=?, model=?, tahun=?, cc=?, harga=?, deskripsi=?, gambar=? WHERE id=?`;
    await db.query(query, [
      merek,
      model,
      tahun,
      cc,
      harga,
      deskripsi,
      gambar,
      id,
    ]);
    res.redirect("/admin/katalog");
  } catch (error) {
    console.error(error);
    res.send("Gagal update.");
  }
};

// 8. LOGS (Tetap JOIN karena ini history transaksi)
exports.getLogs = async (req, res) => {
  try {
    const query = `SELECT t.id, t.tanggal_transaksi, t.status, u.nama AS pembeli, p.merek, p.model FROM transaksi t JOIN users u ON t.pembeli_id = u.id JOIN produk p ON t.produk_id = p.id ORDER BY t.tanggal_transaksi DESC`;
    const [logs] = await db.query(query);
    res.render("admin_logs", { logs: logs, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }
};
