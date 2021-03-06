const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn } = require("./middlewares");

try {
  fs.readdirSync("public/uploads");
} catch (error) {
  console.error("public/uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("public/uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "public/uploads/");
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
  const images = [];
  for (let i = 0; i < req.files.length; i++) {
    const destination = req.files[i].destination.slice(6); // "public/"을 경로명에서 삭제
    const filename = req.files[i].filename;
    const url = destination + filename;
    const image = { destination, filename, url };
    images.push(image);
  }

  return res.json({
    success: true,
    message: "이미지 업로드에 성공했습니다",
    images,
  });
});

module.exports = router;
