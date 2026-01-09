const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const mainRoutes = require("./routes/index");

// 1. Setup View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Pastikan folder namanya 'views'

// 2. Middleware (Pembantu)
app.use(bodyParser.urlencoded({ extended: true })); // Biar bisa baca input form
app.use(express.static(path.join(__dirname, "public"))); // Buat file CSS/Gambar nanti

// 3. Setup Session (Wajib buat Login)
app.use(
  session({
    secret: "rahasia_kelompok_a6", // Kunci rahasia dapur
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // False karena kita belum pakai HTTPS
  })
);

// 4. Gunakan Router
app.use("/", mainRoutes);

// 5. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server JB Motor (Real Mode) jalan di port ${PORT}`);
});
