import nodemailer from "nodemailer";

export const sendEmailOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"KhammaGhani" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Login",
    text: `Your OTP is ${otp}`,
  });
};
