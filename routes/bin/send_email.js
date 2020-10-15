const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
require("dotenv").config();

// 매개변수로 주어진 이메일로 가입 인증 코드 이메일을 보내는 함수
// user_email: 인증 코드를 전송할 사용자 이메일
const sendVerificationEmail = function (user_email) {
  // 메일 발송 객체 생성
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.VERIFICATION_EMAIL,
      pass: process.env.VERIFICATION_EMAIL_PASSWORD,
    },
  });

  // 인증 코드
  const verification_code = 12345;

  // TODO: verification 반환하지 않고 DB에 저장할 것

  // 메일 옵션 설정
  let mailOptions = {
    from: process.env.VERIFICATION_EMAIL, // 발송 메일 주소
    to: user_email, // 수신 메일 주소
    subject: "Sending Email using Node.js", // 제목
    html: pug.renderFile(path.join("views", "email-verification.pug"), { verification_code: verification_code }),
  };

  // 메일 발송
  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
