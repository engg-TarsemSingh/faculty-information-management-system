const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const emailVerification = require("./email_verification");
const registration = require("./Registration"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send-otp", emailVerification.sendOtp);
app.post("/verify-otp", emailVerification.verifyOtp);

app.get("/waiting-users", async (req, res) => {
  try {
    const users = await registration.waiting_users(); 
    res.json(users);
  } catch (err) {
    console.error("Error in /waiting-users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/approve", async (req,res) => {
  const { status, email } = req.body;
  try {
    const result = await registration.approved_rejected(status, email);
    res.json(result);
  } catch (err) {
    console.error("Error in /approve:", err);
    res.status(500).json({ error: "Failed to process approval" });
  }
})

app.post("/personal_information_update", async (req, res) => {
  const { email, data } = req.body; 
  console.log("personal_information_updatecalled");
  console.log("email = ",email);
  console.log("data = ",data)

  try {
    const result = await registration.updatePersonalInfo(email, data);
    console.log("output of the function :: ",result);
    res.json(result);
  } catch (err) {
    console.error("Error in /update-info:", err);
    res.status(500).json({ error: "Failed to update personal information" });
  }
});

app.post("/login",async (req,res) => {
  const {email,password} = req.body;

  try{
    const ans = await emailVerification.login_user(email,password);
    console.log("ans = ",ans);
    res.json(ans);
  }
  catch{
    res.json(ans);  
  }
})

app.post("/getPersonalInfo", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userInfo = await registration.getPersonalInfo(email);
    res.json(userInfo); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));