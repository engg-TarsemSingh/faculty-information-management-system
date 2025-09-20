const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const pool = require("./database");

let otpStore = {}; // { email: ["123456", "..." ] }

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_PASSWORD,
  },
});

const sendOtp = async (req, res) => {
  console.log("sendotp is called.");
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = await bcrypt.hash(password, 10);

  // Save OTP + hash temporarily
  otpStore[email] = [otp, passwordHash];

  // Send OTP via email
  try {
    await transporter.sendMail({
      from: process.env.MY_EMAIL,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP is: ${otp}`,
    });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

const verifyOtp = async (req, res) => {
  console.log("verifyotp-called");
  const { email, otp } = req.body;

  console.log("email = ",email);
  console.log("otp = ",otp);

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const data = otpStore[email];
  if (!data) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }

  if (data[0] === otp) {                    //otp=0   password=1
    await pool.query("INSERT INTO registration_verification (email_id, password) VALUES ($1, $2)", [email, data[1]]).then(()=>{
      console.log("data is stored");
    })

    delete otpStore[email]; // remove from temp store
    return res.json({ message: "Email verified and password set successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};