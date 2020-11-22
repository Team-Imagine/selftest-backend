const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");
const crypto = require("crypto");
const { VerificationCode, PasswordResetRequest, User } = require("../../models");
require("dotenv").config();

// 매개변수로 주어진 이메일로 가입 인증 코드 이메일을 보내는 함수
// user_email: 인증 코드를 전송할 사용자 이메일
module.exports.sendVerificationEmail = async function (user_email) {
  // 메일 발송 객체 생성
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.VERIFICATION_EMAIL,
      pass: process.env.VERIFICATION_EMAIL_PASSWORD,
    },
  });

  // 해당 이메일을 가진 사용자가 존재하는지 확인
  const user = await User.findOne({
    where: { email: user_email },
  });

  if (!user) {
    throw new Error("해당 이메일을 가진 사용자가 존재하지 않습니다");
  }

  // 인증 코드가 이미 존재하는지 확인
  const existingVerificationCode = await VerificationCode.findOne({
    where: { user_id: user.id },
  });

  // 인증코드 이미 존재한다면 삭제
  if (existingVerificationCode) {
    await VerificationCode.destroy({
      where: { id: existingVerificationCode.id },
    });
  }

  // 인증코드 발급
  const key_one = crypto.randomBytes(256).toString("hex").substr(100, 5);
  const key_two = crypto.randomBytes(256).toString("base64").substr(50, 5);
  const verification_code = key_one + key_two;

  // 발급받은 인증코드는 나중에 대조하기 위해 DB에 저장
  await VerificationCode.create({
    user_id: user.id,
    code: verification_code,
  });

  // 메일 옵션 설정
  let mailOptions = {
    from: process.env.VERIFICATION_EMAIL, // 발송 메일 주소
    to: user_email, // 수신 메일 주소
    subject: "SelfTest 회원가입 인증 메일", // 제목
    html: pug.renderFile(path.join("views", "email-verification.pug"), { verification_code: verification_code }),
  };

  // 메일 발송
  return transporter.sendMail(mailOptions);
};

// 비밀번호 리셋 이메일 전송
module.exports.sendPasswordResetEmail = async function (user_email) {
  // 메일 발송 객체 생성
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.VERIFICATION_EMAIL,
      pass: process.env.VERIFICATION_EMAIL_PASSWORD,
    },
  });

  // 해당 이메일을 가진 사용자가 존재하는지 확인
  const user = await User.findOne({
    where: { email: user_email },
  });

  if (!user) {
    throw new Error("해당 이메일을 가진 사용자가 존재하지 않습니다");
  }

  // 인증 코드가 이미 존재하는지 확인
  const existingRequest = await PasswordResetRequest.findOne({
    where: { user_id: user.id },
  });

  // 인증코드 이미 존재한다면 삭제
  if (existingRequest) {
    await existingRequest.destroy({
      where: { id: existingRequest.id },
    });
  }

  // 인증코드 발급
  const key_one = crypto.randomBytes(256).toString("hex").substr(100, 5);
  const key_two = crypto.randomBytes(256).toString("base64").substr(50, 5);
  const verification_code = key_one + key_two;

  // 발급받은 인증코드는 나중에 대조하기 위해 DB에 저장
  await PasswordResetRequest.create({
    user_id: user.id,
    code: verification_code,
  });

  // 메일 옵션 설정
  let mailOptions = {
    from: process.env.VERIFICATION_EMAIL, // 발송 메일 주소
    to: user_email, // 수신 메일 주소
    subject: "SelfTest 사용자 비밀번호 초기화 인증 코드 이메일", // 제목
    html: pug.renderFile(path.join("views", "email-password-reset.pug"), { verification_code: verification_code }),
  };

  // 메일 발송
  return transporter.sendMail(mailOptions);
};
