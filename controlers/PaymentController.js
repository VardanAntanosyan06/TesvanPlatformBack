const axios = require('axios');
const {
  Tests,
  UserTests,
  CoursesPerLessons,
  Groups,
  GroupsPerUsers,
  UserCourses,
  UserLesson,
  UserHomework,
  Payment,
  GroupCourses,
  UserPoints,
  GroupChats,
  Lesson,
  Homework,
  Users,
  HomeworkPerLesson
} = require('../models');

const sequelize = require('sequelize');
const payUrl = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentWay, groupId, amount, type } = req.body;
    const orderNumber = Math.floor(Date.now() * Math.random());
    const data = `userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}&amount=${amount}&currency=${process.env.CURRENCY}&language=en&orderNumber=${orderNumber}&returnUrl=${process.env.RETURNURL}&failUrl=${process.env.FAILURL}&pageView=DESKTOP&description='Payment Tesvan Platform'`;
    let { data: paymentResponse } = await axios.post(
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
      status: 'Pending',
      groupId,
      userId,
      type,
    });
    console.log(paymentResponse);
    return res.json({ success: true, formUrl: paymentResponse.formUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const buy = async (req, res) => {
  try {
    const { orderKey } = req.body;

    const data = `orderId=${orderKey}&language=en&userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}`;

    const { data: paymentResponse } = await axios.post(
      `https://ipay.arca.am/payment/rest/getOrderStatus.do?${data}`,
    );

    const payment = await Payment.findOne({
      where: { orderKey },
    });
    console.log(payment);
    if (!payment)
      return res.status(400).json({ success: false, message: 'Payment does not exist' });
    payment.status = paymentResponse.errorMessage;

    payment.save();

    if (paymentResponse.error && paymentResponse.orderStatus !== 2)
      return res.json({
        success: false,
        errorMessage: paymentResponse.errorMessage,
        groupId: payment.groupId,
      });

    if (payment.type == 'Group') {
      const user = await Users.findOne({ where: { id: payment.userId } });
      const group = await Groups.findByPk(payment.groupId);
      if (!group) {
        return res.json({ success: false, message: 'Group not found' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const {role} = await Users.findByPk(payment.userId)
      await GroupsPerUsers.findOrCreate({
        where:{  
          groupId: payment.groupId,
          userId: payment.userId,
        },
        defaults:{
          groupId: payment.groupId,
          userId: payment.userId,
          userRole: role,
        }
      });

      await UserCourses.create({
        GroupCourseId: group.assignCourseId,

        UserId: payment.userId,
      });
      const lessons = await CoursesPerLessons.findAll({
        where: { courseId: group.assignCourseId },
      });
      await UserPoints.findOrCreate({
        where: {
          userId: payment.userId,
        },
        defaults: {
          userId: payment.userId,
          lesson: 0,
          quizz: 0,
          finalInterview: 0,
        },
      });
      lessons.map((e) => {
        UserLesson.create({
          GroupCourseId: group.assignCourseId,
          UserId: payment.userId,
          LessonId: e.lessonId,
        });
      });

      const Course = await GroupCourses.findOne({
        where:{id:group.assignCourseId},
        include: [
          {
            model: Lesson,
            include: [
              {
                model: Homework,
                as: "homework",
              },
            ],
            required: true,
          },
        ],
      })  

      Course.Lessons.map((lesson)=>{
        UserHomework.create({
          GroupCourseId: group.assignCourseId,
          UserId:payment.userId,
          HomeworkId: lesson.homework[0].id,
          points: 0,
        })
      })
      const boughtTests = await Tests.findAll({
        where: {
          [sequelize.Op.or]: [{ courseId: group.assignCourseId }, { courseId: null }],
        },
      });

      boughtTests.map((test) => {
        UserTests.findOrCreate({
          where: {
            testId: test.id,
            userId: payment.userId,
            courseId: test.courseId,
            language: test.language,
            type: 'Group',
          },
          defaults: {
            testId: test.id,
            userId: payment.userId,
          },
        });
      });

      const groupChats = await GroupChats.findOne({
        where: { groupId: payment.groupId },
      });
      const newMembers = [payment.userId, ...groupChats.members];
      const uniqueUsers = [...new Set(newMembers)];
      groupChats.members = uniqueUsers;

      await groupChats.save();

      res.send({ success: true });
    } else if (payment.type == 'Individual') {
      const user = await Users.findOne({ where: { id: payment.userId } });
      const course = await GroupCourses.findByPk(payment.groupId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await UserCourses.create({
        GroupCourseId: payment.groupId,
        UserId: payment.userId,
      });
      const lessons = await CoursesPerLessons.findAll({
        where: { courseId: payment.groupId },
      });
      await UserPoints.findOrCreate({
        where: {
          userId: payment.userId,
        },
        defaults: {
          userId: payment.userId,
          lesson: 0,
          quizz: 0,
          finalInterview: 0,
        },
      });
      lessons.map((e) => {
        UserLesson.create({
          GroupCourseId: payment.groupId,
          UserId: payment.userId,
          LessonId: e.lessonId,
        });
      });

      const boughtTests = await Tests.findAll({
        where: {
          [sequelize.Op.or]: [{ courseId: payment.groupId }, { courseId: null }],
        },
      });

      boughtTests.map((test) => {
        UserTests.findOrCreate({
          where: {
            testId: test.id,
            userId: payment.userId,
            courseId: test.courseId,
            language: test.language,
            type: 'Group',
          },
          defaults: {
            testId: test.id,
            userId: payment.userId,
          },
        });
      });
      res.send({ success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};
module.exports = {
  payUrl,
  buy,
};
