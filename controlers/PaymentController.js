const axios = require("axios");
const {
  Tests,
  UserTests,
  CoursesPerLessons,
  Groups,
  GroupsPerUsers,
  UserCourses,
  UserLesson,
  Payment,
  Users,
} = require("../models");

const sequelize = require("sequelize")
const payUrl = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentWay, groupId, amount } = req.body;
    const orderNumber = Math.floor(Date.now() * Math.random());
    const data = `userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}&amount=${amount}&currency=${process.env.CURRENCY}&language=en&orderNumber=${orderNumber}&returnUrl=${process.env.RETURNURL}&failUrl=${process.env.FAILURL}&pageView=DESKTOP`;
    let { data: paymentResponse } = await axios.post(
      `https://ipay.arca.am/payment/rest/register.do?${data}`
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

const buy = async (req, res) => {
  try {
    const { orderKey } = req.body;

  
    const data  = `orderId=${orderKey}&language=en&userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}`

    const {data:paymentResponse} = await axios.post(`https://ipay.arca.am/payment/rest/getOrderStatus.do?${data}`)

    const payment = await Payment.findOne({
      where: { orderKey },
    });
    if(!payment) return res.status(400).json({success:false,message:"Payment does not exist"})
    payment.status = paymentResponse.errorMessage

    payment.save();
    
    if(paymentResponse.error && paymentResponse.orderStatus!==2) return res.json({success:false,errorMessage:paymentResponse.errorMessage,groupId:payment.groupId})

    const user = await Users.findOne({ where: { id: payment.userId } });
    const group = await Groups.findByPk(payment.groupId);
    if (!group) {
      return res.json({ success: false, message: "Group not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await GroupsPerUsers.create({
      groupId: payment.groupId,
      userId: payment.userId,
    });
    await UserCourses.create({
      GroupCourseId: group.assignCourseId,

      UserId: payment.userId,
    });
    const lessons = await CoursesPerLessons.findAll({
      where: { courseId: group.assignCourseId },
    });

    lessons.map((e) => {
      UserLesson.create({
        GroupCourseId: group.assignCourseId,
        UserId: payment.userId,
        LessonId: e.lessonId,
      });
    });
    const boughtTests = await Tests.findAll({
      where: {
        [sequelize.Op.or]: [
          { courseId: group.assignCourseId },
          { courseId: null },
        ],
      },
    });

    console.log(boughtTests,"+++++++++++++++++++++++++++");
    boughtTests.map((test) => {
      UserTests.findOrCreate({
        where: {
          testId: test.id,
          userId: payment.userId,
          courseId: test.courseId,
          language: test.language,
        },
        defaults: {
          testId: test.id,
          userId: payment.userId,
        },
      });
    });

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
module.exports = {
  payUrl,
  buy
};