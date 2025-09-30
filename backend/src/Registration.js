const pool = require("./database");

async function waiting_users(){
  try {
    const result = await pool.query(
      "SELECT email_id FROM registration_verification"
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching waiting users:", err);
    throw err; 
  }   
}

async function approved_rejected(status , email ){
  try{
    if(status==0){
      await pool.query("delete from registration_verification where email_id=($1)",[email]);
      return "email rejected";
    }
    else{
      let passw = await pool.query("select password from registration_verification where email_id = ($1)",[email]);
      passw = passw.rows[0].password;
      await pool.query("insert into personal_information(email_id,password) values ($1,$2) ",[email,passw]);
      await pool.query("delete from registration_verification where email_id=($1)",[email]);
      return "email accepted";
    }
  }
  catch (err){
    console.error("Error in approved_rejected:", err);
    throw err;
  }
}

async function updatePersonalInfo(email, data) {
  console.log("updatePersonalInfo is called");
  try {
    const keys = Object.keys(data).filter(k => k !== "email_id" && k !== "password"); 
    const values = [];

    if (keys.length === 0) {
      throw new Error("No fields provided for update");
    }

    const setClause = keys.map((key, index) => {
      let value = data[key];

      // normalize dateofbirth
      if (key === "dateofbirth" && value) {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
          throw new Error(`Invalid date format for ${key}: ${value}`);
        }
        value = d.toISOString().split("T")[0];
      }

      values.push(value);
      return `${key} = $${index + 2}`;
    }).join(", ");

    const query = `UPDATE personal_information SET ${setClause} WHERE email_id = $1`;

    const result = await pool.query(query, [email, ...values]);

    if (result.rowCount === 0) {
      return "No matching user found, nothing updated";
    }

    return "Personal information updated successfully";
  } catch (err) {
    console.error("Error in updatePersonalInfo:", err);
    throw err;
  }
}


async function getPersonalInfo(email) {
  try {
    const query = `
      SELECT email_id, faculty_id, name, gender, dateofbirth, 
             contactno, address, photograph_url
      FROM personal_information
      WHERE email_id = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0]; // returns key-value pairs
  } catch (err) {
    console.error("Error in getPersonalInfo:", err);
    throw err;
  }
}

module.exports = {
  waiting_users,
  approved_rejected,
  updatePersonalInfo,
  getPersonalInfo
};