const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// --- 1. IMPORT SEMUA CONTROLLER ---
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const homeController = require("../controllers/homeController");
// Pastikan file testimoniController.js sudah ada di folder controllers!
const testimoniController = require("../controllers/testimoniController");

// --- 2. CONFIG UPLOAD GAMBAR ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage: storage });

// --- 3. MIDDLEWARE CEK ADMIN ---
const verifyAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

// =========================================
// DEFINISI RUTE (JALUR APLIKASI)
// =========================================

// A. HOMEPAGE & PUBLIK
router.get("/", homeController.index);

// B. AUTHENTICATION (Login/Register)
router.get("/login", authController.loginPage);
router.post("/login", authController.loginProcess);
router.get("/register", authController.registerPage);
router.post("/register", authController.registerProcess);
router.get("/logout", authController.logout);
router.get("/admin/dashboard", verifyAdmin, adminController.dashboard);
router.get("/admin/katalog", verifyAdmin, adminController.katalog);
router.post("/admin/delete/:id", verifyAdmin, adminController.deleteProduct);
router.get("/admin/edit/:id", verifyAdmin, adminController.editPage);
router.post(
  "/admin/edit/:id",
  verifyAdmin,
  upload.single("gambar"),
  adminController.updateProduct
);

// C. DASHBOARD USER BIASA
router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("user_dashboard", { user: req.session.user });
});

// D. ADMIN PANEL (Perlu verifyAdmin)
router.get("/admin/dashboard", verifyAdmin, (req, res) => {
  res.render("admin_dashboard", { user: req.session.user });
});
router.get("/admin/upload", verifyAdmin, adminController.uploadPage);
router.post(
  "/admin/upload",
  verifyAdmin,
  upload.single("gambar"),
  adminController.uploadProcess
);
router.get("/admin/logs", verifyAdmin, adminController.getLogs);

// E. TESTIMONI (FITUR BARU)
// Pastikan testimoniController punya fungsi index, create, dan react
router.get("/testimoni", testimoniController.index);
router.post("/testimoni", testimoniController.create);
router.post("/testimoni/:id/react", testimoniController.react);

module.exports = router;
