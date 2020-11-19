const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn } = require("./middlewares");
const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 이미지 크기 제한
});

// 이미지 업로드 및 경로 반환
router.post("/upload", isLoggedIn, upload.array("img"), (req, res, next) => {

  return res.json({
    success: true,
    message: "이미지 업로드에 성공했습니다",
    url: `/img/${req.files.filename}`,
  });
});

module.exports = router;
