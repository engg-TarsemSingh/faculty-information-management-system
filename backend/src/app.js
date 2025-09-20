const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const emailVerification = require("./email_verification");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send-otp", emailVerification.sendOtp);
app.post("/verify-otp", emailVerification.verifyOtp);

app.listen(3000, () => console.log("Server running on port 3000"));