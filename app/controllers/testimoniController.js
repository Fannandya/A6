const db = require("../config/database");

// 1. Tampilkan Halaman Testimoni
exports.index = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM testimoni ORDER BY created_at DESC"
    );
    res.render("testimoni", {
      testimonials: rows,
      user: req.session.user || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// 2. Simpan Testimoni Baru (UPDATE: Simpan User ID)
exports.create = async (req, res) => {
  const { nama, isi } = req.body;
  // Cek kalau user login, ambil ID-nya. Kalau enggak, null.
  const userId = req.session.user ? req.session.user.id : null;

  try {
    await db.query(
      "INSERT INTO testimoni (nama, isi, user_id) VALUES (?, ?, ?)",
      [nama, isi, userId]
    );
    res.redirect("/testimoni");
  } catch (error) {
    console.error(error);
    res.send("Gagal mengirim testimoni.");
  }
};

// 3. Handle Like / Dislike
exports.react = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  try {
    if (type === "like")
      await db.query("UPDATE testimoni SET likes = likes + 1 WHERE id = ?", [
        id,
      ]);
    else if (type === "dislike")
      await db.query(
        "UPDATE testimoni SET dislikes = dislikes + 1 WHERE id = ?",
        [id]
      );
    res.redirect("/testimoni");
  } catch (error) {
    console.error(error);
    res.redirect("/testimoni");
  }
};

// === FITUR BARU: UPDATE & DELETE ===

// 4. Hapus Testimoni (Cek kepemilikan)
exports.delete = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  if (!user) return res.redirect("/login");

  try {
    // Logika: Admin boleh hapus semua, User biasa cuma boleh hapus punya sendiri
    let query = "DELETE FROM testimoni WHERE id = ?";
    let params = [id];

    if (user.role !== "admin") {
      query += " AND user_id = ?";
      params.push(user.id);
    }

    await db.query(query, params);
    res.redirect("/testimoni");
  } catch (error) {
    console.error(error);
    res.redirect("/testimoni");
  }
};

// 5. Halaman Edit Testimoni
exports.editPage = async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  if (!user) return res.redirect("/login");

  try {
    // Cek dulu datanya ada gak & punya dia bukan
    let query = "SELECT * FROM testimoni WHERE id = ?";
    let params = [id];

    if (user.role !== "admin") {
      query += " AND user_id = ?";
      params.push(user.id);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) return res.redirect("/testimoni");

    res.render("testimoni_edit", { t: rows[0], user: user });
  } catch (error) {
    console.error(error);
    res.redirect("/testimoni");
  }
};

// 6. Proses Update
exports.update = async (req, res) => {
  const { id } = req.params;
  const { isi } = req.body; // Biasanya nama gak diedit, cuma isinya
  const user = req.session.user;

  try {
    let query = "UPDATE testimoni SET isi = ? WHERE id = ?";
    let params = [isi, id];

    if (user.role !== "admin") {
      query += " AND user_id = ?";
      params.push(user.id);
    }

    await db.query(query, params);
    res.redirect("/testimoni");
  } catch (error) {
    console.error(error);
    res.send("Gagal update.");
  }
};
