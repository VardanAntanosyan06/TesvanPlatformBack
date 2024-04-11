const axios = require("axios")
const {Payment} = require("../models");

const payUrl = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentWay, groupId, amount } = req.body;
    const orderNumber = Math.floor(Date.now()*Math.random());
    const data = `userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}&amount=${amount}&currency=${process.env.CURRENCY}&language=en&orderNumber='${orderNumber}'&returnUrl=${process.env.RETURNURL}&failUrl=${process.env.FAILURL}&pageView=DESKTOP`;
    let {data:paymentResponse} = await axios.post(
      `https://ipay.arca.am/payment/rest/register.do?${data}`,
    );

    if (paymentResponse.errorCode)
      return res.status(400).json({
        success: false,
        errorMessage: paymentResponse.errorMessage,
      });

    Payment.create({
      orderKey: paymentResponse.orderId,
      orderNumber,
      paymentWay,
      status: "Pending",
      groupId,
      userId,
    });
    console.log(paymentResponse);
    return res.json({ success: true, formUrl: paymentResponse.formUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = {
    payUrl
}