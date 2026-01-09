const db = require("../config/database");

// 1. Tampilkan Halaman Testimoni
exports.index = async (req, res) => {
  try {
    // Ambil semua testimoni diurutkan dari yang terbaru
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

// 2. Simpan Testimoni Baru
exports.create = async (req, res) => {
  const { nama, isi } = req.body;
  try {
    await db.query("INSERT INTO testimoni (nama, isi) VALUES (?, ?)", [
      nama,
      isi,
    ]);
    res.redirect("/testimoni"); // Refresh halaman biar muncul
  } catch (error) {
    console.error(error);
    res.send("Gagal mengirim testimoni.");
  }
};

// 3. Handle Like / Dislike
exports.react = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'like' atau 'dislike'

  try {
    if (type === "like") {
      await db.query("UPDATE testimoni SET likes = likes + 1 WHERE id = ?", [
        id,
      ]);
    } else if (type === "dislike") {
      await db.query(
        "UPDATE testimoni SET dislikes = dislikes + 1 WHERE id = ?",
        [id]
      );
    }
    res.redirect("/testimoni");
  } catch (error) {
    console.error(error);
    res.redirect("/testimoni");
  }
};
