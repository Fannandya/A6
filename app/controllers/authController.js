const db = require("../config/database");

exports.loginPage = (req, res) => {
  // Kalau sudah login, langsung lempar ke dashboard
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", { error: null });
};

exports.loginProcess = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Cari user berdasarkan email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.render("login", { error: "Email tidak ditemukan!" });
    }

    const user = users[0];

    // 2. Cek Password (Sederhana dulu sesuai dummy data)
    // Note: Di real project harusnya pakai bcrypt (hash), tapi karena dummy datanya plain text, kita pakai ini dulu.
    if (password !== user.password) {
      return res.render("login", { error: "Password salah!" });
    }

    // 3. Simpan data user di session (biar server ingat siapa yg login)
    req.session.user = {
      id: user.id,
      nama: user.nama,
      role: user.role,
    };

    // 4. Redirect sesuai Role
    if (user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/dashboard"); // Halaman User biasa
    }
  } catch (error) {
    console.error(error);
    res.render("login", { error: "Terjadi kesalahan pada server." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.registerPage = (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("register", { error: null });
};

exports.registerProcess = async (req, res) => {
  const { nama, email, password, no_hp } = req.body;

  try {
    // Cek dulu email udah kepake belum
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.render("register", { error: "Email sudah terdaftar!" });
    }

    // Simpan User Baru
    // Note: Password masih plain text (Survival Mode). Di real apps WAJIB di-hash.
    await db.query(
      "INSERT INTO users (nama, email, password, role, no_hp) VALUES (?, ?, ?, ?, ?)",
      [nama, email, password, "user", no_hp]
    );

    res.render("login", {
      error: null,
      success: "Registrasi berhasil! Silakan login.",
    });
  } catch (error) {
    console.error(error);
    res.render("register", { error: "Gagal mendaftar. Coba lagi." });
  }
};
