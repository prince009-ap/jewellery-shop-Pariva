import axios from "axios";

const run = async () => {
  try {
    const resp = await axios.post("http://localhost:5000/api/auth/login-password-otp", {
      email: "prince@test.com",
      password: "Test1234!"
    }, { withCredentials: true });

    console.log("status", resp.status);
    console.log(resp.data);
  } catch (err) {
    if (err.response) {
      console.error("status", err.response.status);
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  }
};

run();