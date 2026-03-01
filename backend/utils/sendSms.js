import axios from "axios";

export const sendSms = async (mobile, message) => {
  try {
    const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY, // ✅ API KEY
        route: "q",                                  // ✅ Quick SMS
        message: message,                            // text message
        numbers: mobile,                             // 10 digit number
        flash: 0,
      },
    });

    console.log("FAST2SMS SUCCESS 👉", res.data);
  } catch (err) {
    console.error(
      "FAST2SMS ERROR 👉",
      err.response?.data || err.message
    );
  }
};
