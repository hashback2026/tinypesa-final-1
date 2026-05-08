const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

async function sendStkPush(amountKes, phone, transactionCode) {

  let msisdn = phone
    .replace(/\s+/g, "")
    .replace(/[^0-9]/g, "");

  if (msisdn.startsWith("0")) {
    msisdn = "254" + msisdn.slice(1);
  } else if (msisdn.length === 9) {
    msisdn = "254" + msisdn;
  }

  if (!/^254\d{9}$/.test(msisdn)) {
    return {
      success: false,
      data: {
        message: "Invalid phone number format"
      }
    };
  }

  const url =
    "https://tinypesa.com/api/v1/express/initialize";

  const payload = {
    amount: amountKes,
    msisdn,
    account_no: transactionCode,
    callback_url: process.env.TINYPESA_WEBHOOK_URL,
  };

  try {

    const response = await fetch(
      `${url}?${new URLSearchParams({
        username: process.env.TINYPESA_USERNAME || "",
      })}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Apikey: process.env.TINYPESA_LINK_API_KEY || "",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      data,
    };

  } catch (error) {

    return {
      success: false,
      data: {
        message: error.message || "STK push failed",
      },
    };
  }
}

app.post("/bulk-stk", async (req, res) => {
  try {
    const { amount, numbers } = req.body;

    if (!amount || !numbers || numbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Amount and numbers are required",
      });
    }

    const results = [];

    for (const phone of numbers) {

      const result = await sendStkPush(
        amount,
        phone,
        `TX-${Date.now()}`
      );

      results.push({
        phone,
        ...result,
      });

      await new Promise(resolve =>
        setTimeout(resolve, 1000)
      );
    }

    res.json({
      success: true,
      results,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/callback", (req, res) => {

  console.log("TinyPesa Callback:", req.body);

  res.json({
    success: true,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
