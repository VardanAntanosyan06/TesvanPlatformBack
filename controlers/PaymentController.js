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
  HomeworkPerLesson,
  PaymentWays,
} = require('../models');
var CryptoJS = require('crypto-js');
const { Op } = require('sequelize');

const sequelize = require('sequelize');
const paymentUrlArca = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentWay, groupId, type } = req.body;
    const thisCourse = await PaymentWays.findOne({
      where: {
        groupId,
        type,
      },
    });
    if (!thisCourse) {
      return res.status(409).json({ success: false });
    }
    const thisCoursePrice = thisCourse.price * (1 - thisCourse.discount / 100);
    const orderNumber = Math.floor(Date.now() * Math.random());
    let amount = +thisCoursePrice * 100;
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
      amount: thisCoursePrice
    });

    return res.json({
      success: true,
      formUrl: paymentResponse.formUrl,
      id: orderNumber,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const paymentArca = async (req, res) => {
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

    if (req.body.monthlyPayment === true) {
      return res.json({
        success: true,
      });
    }

    if (payment.type == 'Group') {
      const user = await Users.findOne({ where: { id: payment.userId } });
      const group = await Groups.findByPk(payment.groupId);
      if (!group) {
        return res.json({ success: false, message: 'Group not found' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { role } = await Users.findByPk(payment.userId);
      await GroupsPerUsers.findOrCreate({
        where: {
          groupId: payment.groupId,
          userId: payment.userId,
        },
        defaults: {
          groupId: payment.groupId,
          userId: payment.userId,
          userRole: role,
        },
      });

      await UserCourses.create({
        GroupCourseId: group.assignCourseId,

        UserId: payment.userId,
      });
      const lessons = await CoursesPerLessons.findAll({
        where: { courseId: group.assignCourseId },
      });
      // await UserPoints.findOrCreate({
      //   where: {
      //     userId: payment.userId,
      //   },
      //   defaults: {
      //     userId: payment.userId,
      //     lesson: 0,
      //     quizz: 0,
      //     finalInterview: 0,
      //   },
      // });
      lessons.map((e) => {
        UserLesson.create({
          GroupCourseId: group.assignCourseId,
          UserId: payment.userId,
          LessonId: e.lessonId,
        });
      });

      const Course = await GroupCourses.findOne({
        where: { id: group.assignCourseId },
        include: [
          {
            model: Lesson,
            include: [
              {
                model: Homework,
                as: 'homework',
              },
            ],
            required: true,
          },
        ],
      });

      Course.Lessons.forEach(async (lesson) => {
        if (lesson.homework.length > 0) {
          await UserHomework.create({
            GroupCourseId: group.assignCourseId,
            UserId: payment.userId,
            HomeworkId: lesson.homework[0].id,
            points: 0,
            LessonId: lesson.id,
          });
        }
      });

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
      // const uniqueUsers = [...new Set(newMembers)];
      groupChats.members = newMembers;

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
      // await UserPoints.findOrCreate({
      //   where: {
      //     userId: payment.userId,
      //   },
      //   defaults: {
      //     userId: payment.userId,
      //     lesson: 0,
      //     quizz: 0,
      //     finalInterview: 0,
      //   },
      // });
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

const ConfirmIdram = async (req, res) => {
  const SECRET_KEY = process.env.IDRAM_PASSWORD;
  const EDP_REC_ACCOUNT = process.env.IDRAM_ID;
  const request = req.body;

  try {
    if (
      typeof request.EDP_PRECHECK !== 'undefined' &&
      typeof request.EDP_BILL_NO !== 'undefined' &&
      typeof request.EDP_REC_ACCOUNT !== 'undefined' &&
      typeof request.EDP_AMOUNT !== 'undefined'
    ) {
      if (request.EDP_PRECHECK === 'YES') {
        if (request.EDP_REC_ACCOUNT === EDP_REC_ACCOUNT) {
          const bill_no = request.EDP_BILL_NO;
          res.send('OK');
        }
      }
    }

    if (
      typeof request.EDP_PAYER_ACCOUNT !== 'undefined' &&
      typeof request.EDP_BILL_NO !== 'undefined' &&
      typeof request.EDP_REC_ACCOUNT !== 'undefined' &&
      typeof request.EDP_AMOUNT !== 'undefined' &&
      typeof request.EDP_TRANS_ID !== 'undefined' &&
      typeof request.EDP_CHECKSUM !== 'undefined'
    ) {
      const txtToHash =
        EDP_REC_ACCOUNT +
        ':' +
        request.EDP_AMOUNT +
        ':' +
        SECRET_KEY +
        ':' +
        request.EDP_BILL_NO +
        ':' +
        request.EDP_PAYER_ACCOUNT +
        ':' +
        request.EDP_TRANS_ID +
        ':' +
        request.EDP_TRANS_DATE;

      if (request.EDP_CHECKSUM.toUpperCase() !== CryptoJS.MD5(txtToHash).toString().toUpperCase()) {
        res.send('Error');
      } else {
        const amount = request.EDP_AMOUNT;
        console.log(request.EDP_BILL_NO);
        if (amount > 0) {
          let currentDate = new Date();
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          currentDate = currentDate.toISOString();
          let payment = await Payment.findOne({
            where: { orderNumber: request.EDP_BILL_NO },
          });
          if (!payment) {
            return res.status(400).json({ success: false, message: 'Payment does not exist' });
          }

          payment.status = 'Success';
          await payment.save();

          if (req.body.monthlyPayment === true) {
            return res.json({
              success: true,
            });
          };

          if (payment.type === 'Group') {
            const user = await Users.findOne({ where: { id: payment.userId } });
            const group = await Groups.findByPk(payment.groupId);
            if (!group) {
              return res.json({ success: false, message: 'Group not found' });
            }

            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
            const { role } = await Users.findByPk(payment.userId);
            await GroupsPerUsers.findOrCreate({
              where: {
                groupId: payment.groupId,
                userId: payment.userId,
              },
              defaults: {
                groupId: payment.groupId,
                userId: payment.userId,
                userRole: role,
              },
            });

            await UserCourses.create({
              GroupCourseId: group.assignCourseId,
              UserId: payment.userId,
            });
            const lessons = await CoursesPerLessons.findAll({
              where: { courseId: group.assignCourseId },
            });
            // await UserPoints.findOrCreate({
            //   where: {
            //     userId: payment.userId,
            //   },
            //   defaults: {
            //     userId: payment.userId,
            //     lesson: 0,
            //     quizz: 0,
            //     finalInterview: 0,
            //   },
            // });
            lessons.forEach(async (e) => {
              await UserLesson.create({
                GroupCourseId: group.assignCourseId,
                UserId: payment.userId,
                LessonId: e.lessonId,
              });
            });

            const Course = await GroupCourses.findOne({
              where: { id: group.assignCourseId },
              include: [
                {
                  model: Lesson,
                  include: [
                    {
                      model: Homework,
                      as: 'homework',
                    },
                  ],
                  required: true,
                },
              ],
            });

            Course.Lessons.forEach(async (lesson) => {
              if (lesson.homework.length > 0) {
                await UserHomework.create({
                  GroupCourseId: group.assignCourseId,
                  UserId: payment.userId,
                  HomeworkId: lesson.homework[0].id,
                  points: 0,
                  LessonId: lesson.id,
                });
              }
            });

            const boughtTests = await Tests.findAll({
              where: {
                [sequelize.Op.or]: [{ courseId: group.assignCourseId }, { courseId: null }],
              },
            });

            boughtTests.forEach(async (test) => {
              await UserTests.findOrCreate({
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
          } else if (payment.type === 'Individual') {
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
            // await UserPoints.findOrCreate({
            //   where: {
            //     userId: payment.userId,
            //   },
            //   defaults: {
            //     userId: payment.userId,
            //     lesson: 0,
            //     quizz: 0,
            //     finalInterview: 0,
            //   },
            // });
            lessons.forEach(async (e) => {
              await UserLesson.create({
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

            boughtTests.forEach(async (test) => {
              await UserTests.findOrCreate({
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
          }
        }
      }
      return res.send('OK');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const getUserPayment = async (req, res) => {
  try {
    // const { user_id: userId } = req.user;
    const { groupId } = req.query
    const type = "monthly";
    const userId = 3

    const paymentWays = await PaymentWays.findOne({
      where: {
        groupId,
        type
      },
      include: [
        {
          model: Groups,
          as: "group"
        }
      ]
    });

    // function getMonthAndDayCount(startDate, endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   // Calculate the difference in years and months
    //   const yearsDifference = end.getFullYear() - start.getFullYear();
    //   const monthsDifference = end.getMonth() - start.getMonth();

    //   // Total months count
    //   const totalMonths = (yearsDifference * 12) + monthsDifference;

    //   // Calculate the difference in days
    //   const startDay = start.getDate();
    //   const endDay = end.getDate();

    //   // Handle case where the end day is before the start day in the month
    //   let totalDays = endDay - startDay;
    //   if (totalDays < 0) {
    //     // Go back one month and calculate the correct number of days
    //     const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    //     totalDays += previousMonth.getDate();
    //   }

    //   return { months: totalMonths, days: totalDays };
    // }

    // // Example usage:
    // const startDate = '2023-01-15';
    // const endDate = '2024-09-10';
    // const result = getMonthAndDayCount(startDate, endDate);
    // console.log(`Months: ${result.months}, Days: ${result.days}`);

    function getMonthCount(startDate, endDate) {
      const nowDate = new Date()
      const start = new Date(startDate);
      const end = new Date(endDate);

      const yearsDifference = end.getFullYear() - start.getFullYear();
      const monthsDifference = end.getMonth() - start.getMonth();
      const yearsDifferenceNow = end.getFullYear() - nowDate.getFullYear();
      const monthsDifferenceNow = end.getMonth() - nowDate.getMonth();

      // Total number of months between the two dates
      const totalMonths = (yearsDifference * 12) + monthsDifference;
      const totalMonthsNow = (yearsDifferenceNow * 12) + monthsDifferenceNow;

      return totalMonths - totalMonthsNow
    }

    const durationMonths = getMonthCount(paymentWays.group.startDate, paymentWays.group.endDate)

    let nextPaymentDate = new Date(paymentWays.group.startDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + (durationMonths * 30));

    const priceCourse = paymentWays.price * (1 - paymentWays.discount / 100) * paymentWays.durationMonths

    const payments = await Payment.findAll({
      where: {
        userId,
        groupId,
        status: {
          [Op.not]: "Pending"
        }
      },
      attributes: ['paymentWay', 'status', 'type', 'amount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    if (payments.length === 0) {
      return res.status(400).json({ success: false, message: 'Bad request1.' });
    };
    const fullPaid = payments.find(value => value.type === "full");

    if (fullPaid) {
      const responsData = {
        payments,
        nextPayment: false
      };

      return res.status(200).json({
        success: true,
        responsData
      });
    };

    const userPaidSum = payments.reduce((aggr, value) => {
      if (value.status === "Success") {
        return aggr = aggr + +value.amount
      };
    }, 0);
    const userUnpaidSum = priceCourse - userPaidSum;

    if (+priceCourse === +userPaidSum) {
      const responsData = {
        payments,
        nextPayment: false
      };

      return res.status(200).json({
        success: true,
        responsData
      });
    };

    const responsData = {
      payments,
      nextPayment: true,
      userPaidSum,
      userUnpaidSum,
      nextPaymentDate
    };

    return res.status(200).json({
      success: true,
      responsData
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const monthlyPayment = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { groupId } = req.query;
    const { paymentWay } = req.body;
    const type = "monthly";

    const paymentWays = PaymentWays.findOne({
      where: {
        groupId,
        type
      }
    });

    const priceCourse = paymentWays.price * (1 - paymentWays.discount / 100) * paymentWays.durationMonths

    const payment = Payment.findAll({
      where: {
        userId,
        groupId,
        status: "Success",
        type
      },
      attributes: ['paymentWay', 'status', 'type', 'amount', 'createdAt'],
    });

    const userPaymentSum = payment.reduce((aggr, value) => {
      return aggr = aggr + value.amount
    })

    if (userPaymentSum <= priceCourse && paymentWay === ARCA) {
      req.body.paymentWay = paymentWay;
      req.body.groupId = groupId;
      req.body.type = type;
      paymentUrlArca(req, res);
    } else if (userPaymentSum <= priceCourse && paymentWay === IDRAM) {
      req.body.monthlyPayment = true;
      ConfirmIdram(req, res);
    };
    return res.status(400).json({ success: false, message: 'Bad request.' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const monthlyPaymentArca = (req, res) => {
  try {
    const { orderKey } = req.body;
    if (!orderKey) {
      return res.status(400).json({ success: false, message: 'Bad request.' });
    };
    req.body.monthlyPayment = true;
    req.body.orderKey = orderKey;
    paymentArca(req, res)
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  paymentUrlArca,
  paymentArca,
  ConfirmIdram,
  getUserPayment,
  monthlyPayment,
  monthlyPaymentArca
};
