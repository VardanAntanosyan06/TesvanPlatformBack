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
  CoursesContents,
  HomeworkPerLesson,
  PaymentWays,
  UserStatus,
  continuingGroups,
  HomeWorkFiles,
  UserAnswersOption,
  UserAnswersQuizz
} = require('../models');
var CryptoJS = require('crypto-js');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sequelize = require('sequelize');
const { atob } = require('buffer');

const paymentUrlForAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentWay, creatorId: adminId, type } = req.body;

    // if (paymentWay === "ARCA" || paymentWay === "IDRAM") return res.status(400).json({ success: false });

    const paymentWayAdmin = await PaymentWays.findOne({
      where: {
        adminId,
        type,
      },
    });
    if (!paymentWayAdmin) return res.status(404).json({ success: false });

    const thisCoursePrice = paymentWayAdmin.price * (1 - paymentWayAdmin.discount / 100);
    const orderNumber = Math.floor(Date.now() * Math.random());
    let amount = Math.ceil(+Math.round(thisCoursePrice) * 100);

    let paymentResponse

    const data = `userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}&amount=${amount}&currency=${process.env.CURRENCY}&language=en&orderNumber=${orderNumber}&returnUrl=${process.env.RETURNURL}&failUrl=${process.env.FAILURL}&pageView=DESKTOP&description='Payment Tesvan Platform'`;
    const response = await axios.post(
      `https://ipay.arca.am/payment/rest/register.do?${data}`,
    );
    paymentResponse = response.data;

    if (paymentResponse.errorCode)
      return res.status(400).json({
        success: false,
        errorMessage: paymentResponse.errorMessage,
      });


    const { id } = Payment.create({
      orderKey: paymentResponse ? paymentResponse.orderId : null,
      orderNumber,
      paymentWay,
      status: 'Pending',
      groupId: null,
      userId,
      type,
      amount: Math.round(thisCoursePrice),
      adminId
    });

    return res.json({
      success: true,
      formUrl: paymentResponse ? paymentResponse.formUrl : null,
      id: orderNumber,
      amount: Math.round(thisCoursePrice),
      invoiceId: id
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const paymentArcaForAdmin = async (req, res) => {
  try {
    const { orderKey } = req.body;
    const data = `orderId=${orderKey}&language=en&userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}`;

    const { data: paymentResponse } = await axios.post(
      `https://ipay.arca.am/payment/rest/getOrderStatus.do?${data}`,
    );

    const payment = await Payment.findOne({
      where: { orderKey },
    });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment does not exist' });
    payment.status = paymentResponse.errorMessage;
    payment.save();

    if (paymentResponse.error && paymentResponse.orderStatus !== 2) {
      return res.json({
        success: false,
        errorMessage: paymentResponse.errorMessage,
        adminId: payment.adminId,
      });
    };

    const adminStatus = await UserStatus.findOne({
      where: {
        userId: payment.userId,
      }
    });

    if (!adminStatus.isActive) {
      if (payment.type === "monthly") {
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        adminStatus.endDate = oneMonthLater;
      } else if (payment.type === "full") {
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        adminStatus.endDate = oneYearLater;
      }
    } else {
      if (payment.type === "monthly") {
        const oneMonthLater = new Date(adminStatus.endDate);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        adminStatus.endDate = oneMonthLater;
      } else if (payment.type === "full") {
        const oneYearLater = new Date(adminStatus.endDate);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        adminStatus.endDate = oneYearLater;
      }
    }
    adminStatus.isActive = true;
    await adminStatus.save()

    return res.status(200).json({ success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
}

const getAdminPayment = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const adminPayments = await Payment.findAll({
      where: {
        userId,
        status: {
          [Op.or]: ["Success", "Payment is declined"]
        }
      },
      attributes: ['id', 'paymentWay', 'status', 'type', 'amount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    return res.status(200).json({ success: true, adminPayments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
}

const nextPaymentAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    // const adminPayments = await Payment.findAll({
    //   where: {
    //     userId
    //   },
    //   order: [['updatedAt', 'DESC']]
    // })

    // let nextPaymentDate

    // function dateDifferenceInDays(date1, date2) {
    //   const diffInTime = date1.getTime() - date2.getTime();
    //   const diffInDays = diffInTime / (1000 * 3600 * 24); // Convert milliseconds to days
    //   return diffInDays;
    // }

    // if (adminPayments[0].type === "monthly") {
    //   if (adminPayments[1].type === "monthly") {
    //     const daysOlder = dateDifferenceInDays(adminPayments[0].updatedAt, adminPayments[1].updatedAt)
    //     if (daysOlder >= 30) {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setMonth(paymentDate.getMonth() + 1);
    //       nextPaymentDate = paymentDate
    //     } else {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setDate(paymentDate.getDate() + (30 - daysOlder));
    //       paymentDate.setMonth(paymentDate.getMonth() + 1);
    //       nextPaymentDate = paymentDate
    //     }
    //   } else if (adminPayments[1].type === "full") {
    //     const daysOlder = dateDifferenceInDays(adminPayments[0].updatedAt, adminPayments[1].updatedAt)
    //     if (daysOlder >= 365) {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setMonth(paymentDate.getMonth() + 1);
    //       nextPaymentDate = paymentDate
    //     } else {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setDate(paymentDate.getDate() + (365 - daysOlder));
    //       paymentDate.setMonth(paymentDate.getMonth() + 1);
    //       nextPaymentDate = paymentDate
    //     }
    //   }
    // } else if (adminPayments[0].type === "full") {
    //   if (adminPayments[1].type === "monthly") {
    //     const daysOlder = dateDifferenceInDays(adminPayments[0].updatedAt, adminPayments[1].updatedAt)
    //     if (daysOlder >= 30) {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setFullYear(paymentDate.getFullYear() + 1);
    //       nextPaymentDate = paymentDate
    //     } else {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setDate(paymentDate.getDate() + (30 - daysOlder));
    //       paymentDate.setFullYear(paymentDate.getFullYear() + 1);
    //       nextPaymentDate = paymentDate
    //     }
    //   } else if (adminPayments[1].type === "full") {
    //     const daysOlder = dateDifferenceInDays(adminPayments[0].updatedAt, adminPayments[1].updatedAt);
    //     if (daysOlder >= 365) {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setFullYear(paymentDate.getFullYear() + 1);
    //       nextPaymentDate = paymentDate
    //     } else {
    //       const paymentDate = new Date(adminPayments[0].updatedAt);
    //       paymentDate.setDate(paymentDate.getDate() + (365 - daysOlder));
    //       paymentDate.setFullYear(paymentDate.getFullYear() + 1);
    //       nextPaymentDate = paymentDate
    //     }
    //   }
    // };

    // let paymentActive = true

    // if (adminPayments[1].type === "monthly") {
    //   const oneMonthLater = new Date(adminPayments[1].updatedAt);
    //   oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    //   paymentActive = oneMonthLater <= new Date()
    // } else if (adminPayments[1].type === "monthly") {
    //   const oneYearLater = new Date(adminPayments[1].updatedAt);
    //   oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    //   paymentActive = oneMonthLater <= new Date()
    // }

    const admin = await Users.findOne({
      where: { id: userId },
      include: [
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive", "endDate"],
        }
      ],
    });

    const nextPaymentDate = new Date() <= new Date(admin.userStatus?.dataValues.endDate) ? admin.userStatus?.dataValues.endDate : new Date()

    const paymentData = await PaymentWays.findAll({
      where: {
        adminId: admin.creatorId
      },
      attributes: ["price", "discount", "type"]
    });

    return res.status(200).json({ success: true, nextPaymentDate, paymentData });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const paymentUrl = async (req, res) => {
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
    let amount = Math.ceil(+Math.round(thisCoursePrice) * 100);

    const data = `userName=${process.env.PAYMENT_USERNAME}&password=${process.env.PAYMENT_PASSWORD}&amount=${amount}&currency=${process.env.CURRENCY}&language=en&orderNumber=${orderNumber}&returnUrl=${process.env.RETURNURL}&failUrl=${process.env.FAILURL}&pageView=DESKTOP&description='Payment Tesvan Platform'`;
    let { data: paymentResponse } = await axios.post(
      `https://ipay.arca.am/payment/rest/register.do?${data}`,
    );

    if (paymentResponse.errorCode)
      return res.status(400).json({
        success: false,
        errorMessage: paymentResponse.errorMessage,
      });

    const { id } = Payment.create({
      orderKey: paymentResponse.orderId,
      orderNumber,
      paymentWay,
      status: 'Pending',
      groupId,
      userId,
      type,
      amount: Math.round(thisCoursePrice)
    });

    return res.json({
      success: true,
      formUrl: paymentResponse.formUrl,
      id: orderNumber,
      amount: Math.round(thisCoursePrice),
      invoiceId: id
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

    const user = await Users.findOne({ where: { id: payment.userId } });

    const group = await Groups.findOne({
      where: {
        id: payment.groupId
      },
      include: [
        {
          model: continuingGroups,
          as: "lastGroup",
          require: false
        }
      ]
    });

    if (!group) {
      return res.json({ success: false, message: 'Group not found' });
    }

    const lastGroup = await Groups.findByPk(group.lastGroup?.lastGroupId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const course = await UserCourses.findOne({
      where: {
        GroupCourseId: group.assignCourseId,
        UserId: user.id,
      }
    });

    if (course) {
      return res.send({ success: true, id: payment.groupId });
    };

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

    const userCours = await UserCourses.create({
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

    // Course.Lessons.forEach(async (lesson) => {
    //   if (lesson.homework.length > 0) {
    //     await UserHomework.create({
    //       GroupCourseId: group.assignCourseId,
    //       UserId: payment.userId,
    //       HomeworkId: lesson.homework[0].id,
    //       LessonId: lesson.id,
    //     });
    //   }
    // });

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

    if (group.lastGroup) {
      const userLastGroup = await GroupsPerUsers.findOne({
        where: {
          groupId: group.lastGroup.groupId,
          userId: payment.userId
        }
      });

      if (userLastGroup) {
        const lastGroupQuizPoint = await UserPoints.findAll({
          attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("point")), 0), "totalQuizPoints"]],
          where: {
            userId: payment.userId,
            courseId: lastGroup?.assignCourseId,
            lessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          },
          raw: true,
        });

        const lastGroupHomeworkPoint = await UserHomework.findAll({
          attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("points")), 0), "totalHomeworkPoints"]],
          where: {
            UserId: payment.userId,
            GroupCourseId: lastGroup?.assignCourseId,
            LessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          },
          raw: true,
        });

        const lastQuizzPoint = await UserPoints.findAll({
          where: {
            userId: payment.userId,
            courseId: lastGroup?.assignCourseId,
            lessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          }
        })

        const copyQuizzPoint = lastQuizzPoint.reduce((aggr, value) => {
          value = value.toJSON();
          delete value.id
          value.courseId = group.assignCourseId;
          aggr.push(value);
          return aggr;
        }, []);

        await UserPoints.bulkCreate(copyQuizzPoint);

        const lastGroupHomework = await UserHomework.findAll({
          where: {
            UserId: payment.userId,
            GroupCourseId: lastGroup?.assignCourseId,
            LessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          },
        });

        const copyHomework = lastGroupHomework.reduce((aggr, value) => {
          value = value.toJSON()
          delete value.id
          value.GroupCourseId = group.assignCourseId
          aggr.push(value)
          return aggr
        }, [])

        await UserHomework.bulkCreate(copyHomework);

        const copyHomeworkIds = copyHomework.reduce((aggr, value) => {
          aggr.push(value.HomeworkId)
          return aggr
        }, [])

        const lastGroupHomeworkFile = await HomeWorkFiles.findAll({
          where: {
            userId: payment.userId,
            courseId: lastGroup?.assignCourseId,
            homeWorkId: {
              [Sequelize.Op.in]: copyHomeworkIds || [],
            },
          }
        })

        const copyHomeworkFile = lastGroupHomeworkFile.reduce((aggr, value) => {
          value = value.toJSON()
          value.courseId = group.assignCourseId
          return aggr.push(value)
        }, [])

        await HomeWorkFiles.bulkCreate(copyHomeworkFile);

        const userAnswersQuizz = await UserAnswersQuizz.findAll({
          where: {
            lessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
            userId: payment.userId,
            courseId: lastGroup?.assignCourseId,
          },
          include: [
            {
              model: UserAnswersOption,
              as: 'userAnswersOption',
            },
          ],
          order: [
            ['id', 'ASC'],
            [{ model: UserAnswersOption, as: 'userAnswersOption' }, 'id', 'ASC'],
          ],
        });

        // Create new entries based on the fetched data
        for (const quizz of userAnswersQuizz) {
          const newQuizz = await UserAnswersQuizz.create({
            userId: quizz.userId,
            testId: quizz.testId,
            questionId: quizz.questionId,
            optionId: quizz.optionId,
            courseId: group.assignCourseId,
            lessonId: quizz.lessonId,
            questionTitle_am: quizz.questionTitle_am,
            questionTitle_en: quizz.questionTitle_en,
            questionTitle_ru: quizz.questionTitle_ru,
            point: quizz.point
          });

          const quizzId = newQuizz.id;
          // Create associated UserAnswersOption for the new quiz
          const userAnswersOptions = quizz.userAnswersOption || [];
          for (const option of userAnswersOptions) {
            await UserAnswersOption.create({
              userAnswerQuizzId: quizzId,
              title_am: option.title_am,
              title_en: option.title_en,
              title_ru: option.title_ru,
              isCorrect: option.isCorrect,
              userAnswer: option.userAnswer,
            });
          }
        }

        const userCours = await UserCourses.findOne({
          where: {
            GroupCourseId: group.assignCourseId,
            UserId: payment.userId,
          }
        });

        userCours.takenHomework = +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
        userCours.takenQuizzes = +lastGroupQuizPoint[0]?.totalQuizPoints;
        userCours.totalPoints = +lastGroupQuizPoint[0]?.totalQuizPoints + +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
        await userCours.save()

        await Payment.create({
          orderKey: "last cours payment",
          orderNumber: "last cours payment",
          paymentWay: "ARCA",
          status: "Success",
          userId: payment.userId,
          groupId: payment.groupId,
          type: "monthly",
          amount: payment.amount
        })
      }
    }

    res.send({ success: true, count: 1, id: payment.groupId });
    //////////////
    if (payment.type == 'Individual') {
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
      res.send({ success: true, count: 1 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

const paymentIdram = async (req, res) => {
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
        let payment = await Payment.findOne({
          where: { orderNumber: request.EDP_BILL_NO },
        });
        if (!payment) {
          return res.send('Error');
        };
        payment.status = 'Payment is declined';
        await payment.save();
        return res.send('Error');
      } else {
        const amount = request.EDP_AMOUNT;
        let payment = await Payment.findOne({
          where: { orderNumber: request.EDP_BILL_NO },
        });
        if (+amount >= +payment.amount - 1 && +amount <= +payment.amount + 1) {
          let currentDate = new Date();
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          currentDate = currentDate.toISOString();
          let payment = await Payment.findOne({
            where: { orderNumber: request.EDP_BILL_NO },
          });
          if (!payment) {
            console.log(100);

            return res.send('Error');
          }

          // For Admin subscription to a service
          if (payment.adminId) {

            const admin = await Users.findOne({ where: { id: payment.userId, role: "ADMIN" } });
            if (!admin) {
              return res.send('Error');
            }

            const adminStatus = await UserStatus.findOne({
              where: {
                userId: payment.userId,
              }
            });

            if (!adminStatus.isActive) {
              if (payment.type === "monthly") {
                const oneMonthLater = new Date();
                oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                adminStatus.endDate = oneMonthLater;
              } else if (payment.type === "full") {
                const oneYearLater = new Date();
                oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
                adminStatus.endDate = oneYearLater;
              }
            } else {
              if (payment.type === "monthly") {
                const oneMonthLater = new Date(adminStatus.endDate);
                oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                adminStatus.endDate = oneMonthLater;
              } else if (payment.type === "full") {
                const oneYearLater = new Date(adminStatus.endDate);
                oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
                adminStatus.endDate = oneYearLater;
              }
            }
            adminStatus.isActive = true;
            await adminStatus.save()

            payment.status = 'Success';
            await payment.save();

            return res.send('OK');
          }

          const user = await Users.findOne({ where: { id: payment.userId } });
          if (!user) {
            return res.send('Error');
          };

          const group = await Groups.findOne({
            where: {
              id: payment.groupId
            },
            include: [
              {
                model: continuingGroups,
                as: "lastGroup",
                require: false
              }
            ],
          });
          if (!group) {
            return res.send('Error');
          };

          const lastGroup = await Groups.findByPk(group.lastGroup?.lastGroupId)

          payment.status = 'Success';
          await payment.save();

          const course = await UserCourses.findOne({
            where: {
              GroupCourseId: group.assignCourseId,
              UserId: user.id,
            }
          });

          if (course) {
            return res.send('OK');
          };

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

          const userCours = await UserCourses.create({
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

          if (group.lastGroup) {
            const userLastGroup = await GroupsPerUsers.findOne({
              where: {
                groupId: group.lastGroup.groupId,
                userId: payment.userId
              }
            });

            if (userLastGroup) {
              const lastGroupQuizPoint = await UserPoints.findAll({
                attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("point")), 0), "totalQuizPoints"]],
                where: {
                  userId: payment.userId,
                  courseId: lastGroup?.assignCourseId,
                  lessonId: {
                    [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
                  },
                },
                raw: true,
              });

              const lastGroupHomeworkPoint = await UserHomework.findAll({
                attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("points")), 0), "totalHomeworkPoints"]],
                where: {
                  UserId: payment.userId,
                  GroupCourseId: lastGroup?.assignCourseId,
                  LessonId: {
                    [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
                  },
                },
                raw: true,
              });

              const lastQuizzPoint = await UserPoints.findAll({
                where: {
                  userId: payment.userId,
                  courseId: lastGroup?.assignCourseId,
                  lessonId: {
                    [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
                  },
                }
              })

              const copyQuizzPoint = lastQuizzPoint.reduce((aggr, value) => {
                value = value.toJSON();
                delete value.id
                value.courseId = group.assignCourseId;
                aggr.push(value);
                return aggr;
              }, []);

              await UserPoints.bulkCreate(copyQuizzPoint);

              const lastGroupHomework = await UserHomework.findAll({
                where: {
                  UserId: payment.userId,
                  GroupCourseId: lastGroup?.assignCourseId,
                  LessonId: {
                    [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
                  },
                },
              });

              const copyHomework = lastGroupHomework.reduce((aggr, value) => {
                value = value.toJSON()
                delete value.id
                value.GroupCourseId = group.assignCourseId
                aggr.push(value)
                return aggr
              }, [])

              await UserHomework.bulkCreate(copyHomework);

              const copyHomeworkIds = copyHomework.reduce((aggr, value) => {
                aggr.push(value.HomeworkId)
                return aggr
              }, [])

              const lastGroupHomeworkFile = await HomeWorkFiles.findAll({
                where: {
                  userId: payment.userId,
                  courseId: lastGroup?.assignCourseId,
                  homeWorkId: {
                    [Sequelize.Op.in]: copyHomeworkIds || [],
                  },
                }
              })

              const copyHomeworkFile = lastGroupHomeworkFile.reduce((aggr, value) => {
                value = value.toJSON()
                value.courseId = group.assignCourseId
                return aggr.push(value)
              }, [])

              await HomeWorkFiles.bulkCreate(copyHomeworkFile);

              const userAnswersQuizz = await UserAnswersQuizz.findAll({
                where: {
                  lessonId: {
                    [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
                  },
                  userId: payment.userId,
                  courseId: lastGroup?.assignCourseId,
                },
                include: [
                  {
                    model: UserAnswersOption,
                    as: 'userAnswersOption',
                  },
                ],
                order: [
                  ['id', 'ASC'],
                  [{ model: UserAnswersOption, as: 'userAnswersOption' }, 'id', 'ASC'],
                ],
              });

              // Create new entries based on the fetched data
              for (const quizz of userAnswersQuizz) {
                const newQuizz = await UserAnswersQuizz.create({
                  userId: quizz.userId,
                  testId: quizz.testId,
                  questionId: quizz.questionId,
                  optionId: quizz.optionId,
                  courseId: group.assignCourseId,
                  lessonId: quizz.lessonId,
                  questionTitle_am: quizz.questionTitle_am,
                  questionTitle_en: quizz.questionTitle_en,
                  questionTitle_ru: quizz.questionTitle_ru,
                  point: quizz.point
                });

                const quizzId = newQuizz.id;
                // Create associated UserAnswersOption for the new quiz
                const userAnswersOptions = quizz.userAnswersOption || [];
                for (const option of userAnswersOptions) {
                  await UserAnswersOption.create({
                    userAnswerQuizzId: quizzId,
                    title_am: option.title_am,
                    title_en: option.title_en,
                    title_ru: option.title_ru,
                    isCorrect: option.isCorrect,
                    userAnswer: option.userAnswer,
                  });
                }
              }

              const userCours = await UserCourses.findOne({
                where: {
                  GroupCourseId: group.assignCourseId,
                  UserId: payment.userId,
                }
              });

              userCours.takenHomework = +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
              userCours.takenQuizzes = +lastGroupQuizPoint[0]?.totalQuizPoints;
              userCours.totalPoints = +lastGroupQuizPoint[0]?.totalQuizPoints + +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
              await userCours.save()

              await Payment.create({
                orderKey: "last cours payment",
                orderNumber: "last cours payment",
                paymentWay: "ARCA",
                status: "Success",
                userId: payment.userId,
                groupId: payment.groupId,
                type: "monthly",
                amount: payment.amount
              })
            }
          };

          ////////////
          if (payment.type === 'Individual') {
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
        } else {
          let payment = await Payment.findOne({
            where: { orderNumber: request.EDP_BILL_NO },
          });
          if (!payment) {
            return res.send('Error');
          };
          payment.status = 'Payment is declined';
          await payment.save();
          return res.send('Error');
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
    const { user_id: userId } = req.user;
    const { groupId } = req.query
    const type = "monthly";

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

    function getMonthCount(startDate, endDate, paymentCount) {
      const nowDate = new Date()
      const start = new Date(startDate);
      const end = new Date(endDate);

      const yearsDifference = end.getFullYear() - start.getFullYear();
      const monthsDifference = end.getMonth() - start.getMonth();
      const yearsDifferenceNow = end.getFullYear() - nowDate.getFullYear();
      const monthsDifferenceNow = end.getMonth() - nowDate.getMonth();

      // Total number of months between the two dates
      const totalMonths = (yearsDifference * 12) + monthsDifference;
      return totalMonths - (totalMonths - paymentCount)
    }
    const payments = await Payment.findAll({
      where: {
        userId,
        groupId,
        status: {
          [Op.not]: "Pending"
        }
      },
      attributes: ['id', 'paymentWay', 'status', 'type', 'amount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });


    const paymentCount = payments.filter((payment) => payment.status === "Success")
    const durationMonths = getMonthCount(paymentWays.group.startDate, paymentWays.group.endDate, paymentCount.length)

    let nextPaymentDate = new Date(paymentWays.group.startDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + (durationMonths * 30));

    const priceCourse = paymentWays.price * (1 - paymentWays.discount / 100) * paymentWays.durationMonths
    const userUnpaidSum = priceCourse / paymentWays.durationMonths



    const userPaidSum = payments.reduce((aggr, value) => {
      if (value.status === "Success") {
        return aggr = aggr + +value.amount
      };
    }, 0);

    if (payments.length === 0) {
      const responsData = {
        payments,
        nextPayment: true,
        userPaidSum,
        userUnpaidSum,
        nextPaymentDate: paymentWays.group.startDate
      };
      return res.status(200).json({
        success: true,
        responsData
      });
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

// in next() 
const monthlyPaymentUrl = async (req, res, next) => {
  try {
    const { user_id: userId } = req.user;
    const { groupId } = req.query;
    const { paymentWay } = req.body;
    const type = "monthly";

    const paymentWays = await PaymentWays.findOne({
      where: {
        groupId,
        type
      }
    });

    const priceCourse = paymentWays.price * (1 - paymentWays.discount / 100) * paymentWays.durationMonths

    const payment = await Payment.findAll({
      where: {
        userId,
        groupId,
        status: "Success",
        type
      },
      attributes: ['paymentWay', 'status', 'type', 'amount', 'createdAt'],
    });

    const userPaymentSum = payment.reduce((aggr, value) => {
      return aggr = aggr + +value.amount
    }, 0)

    if (userPaymentSum <= priceCourse) {
      req.body.paymentWay = paymentWay;
      req.body.groupId = groupId;
      req.body.type = type;
      next()
    } else {
      return res.status(500).send('Bad request.');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const getAllPayment = async (req, res) => {
  try {
    const { groupId, userName, order = "DESC" } = req.query;

    // Validate required parameters
    if (!groupId) {
      return res.status(400).json({ success: false, message: "groupId is required" });
    }

    const group = await Groups.findByPk(groupId)

    function getMonthCount(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const yearsDifference = end.getFullYear() - start.getFullYear();
      const monthsDifference = end.getMonth() - start.getMonth();
      const totalMonths = (yearsDifference * 12) + monthsDifference;

      return totalMonths
    };

    const month = getMonthCount(group.startDate, group.endDate)

    const searchTerms = userName ? userName.trim().split(" ") : [];
    const whereCondition = searchTerms.length
      ? {
        [Op.or]: [
          // Single search term: match either first or last name
          ...(searchTerms.length === 1
            ? [
              { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
              { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
            ]
            : [
              // Two terms: assume firstName and lastName separately
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[1]}%` } }
                ]
              },
              // Try the reverse case in case they typed last name first
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[1]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
                ]
              }
            ])
        ]
      }
      : null;

    // Define the order option, allowing ASC, DESC, or additional options in the future
    const orderOption = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Execute query
    const payments = await Payment.findAll({
      where: {
        groupId,
        status: {
          [Op.or]: ["Success", "Payment is declined"]
        }
      },
      include: [
        {
          model: Users,
          as: "user",
          where: whereCondition,
          attributes: ["id", "firstName", "lastName", "image"],
        }
      ],
      attributes: { exclude: ["orderKey", "orderNumber", "createdAt"] },
      order: [["id", "ASC"]]
    });

    const orders = payments.reduce((aggr, value) => {
      value = value.toJSON()
      if (!aggr[value.userId]) {
        value.orderStatus = []
        value.paymentIds = [+value.id];
        aggr[value.userId] = value
        aggr[value.userId].updatedAt = value.updatedAt;
        if (value.status === "Success") {
          value.orderStatus.push("Success")
        } else {
          aggr[value.userId].amount = 0
          value.orderStatus.push("Failed")
        }
      } else {
        aggr[value.userId].paymentIds.push(+value.id)
        if (value.status === "Success") {
          aggr[value.userId].amount = +aggr[value.userId].amount + +value.amount
          if (aggr[value.userId].orderStatus[aggr[value.userId].orderStatus.length - 1] === "Failed") {
            aggr[value.userId].orderStatus[aggr[value.userId].orderStatus.length - 1] = "Success"
          } else {
            aggr[value.userId].orderStatus.push("Success")
          }
          aggr[value.userId].updatedAt = value.updatedAt;
        } else {
          if (aggr[value.userId].orderStatus[aggr[value.userId].orderStatus.length - 1] === "Failed") {
            aggr[value.userId].updatedAt = value.updatedAt;
          } else {
            aggr[value.userId].orderStatus.push("Failed")
            aggr[value.userId].updatedAt = value.updatedAt;
          }
        }
      }
      aggr[value.userId].type = value.type
      return aggr;
    }, {});

    const userOrders = orderOption === "DESC"
      ? Object.values(orders).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : Object.values(orders).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).reverse()

    // Respond with the query result
    return res.status(200).json({
      success: true,
      payments: userOrders,
      paymentCount: +month
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const paymentCount = async (req, res) => {
  try {
    const { groupId } = req.query;
    const { user_id: userId } = req.user;

    const count = await Payment.findAll({
      where: {
        userId,
        groupId,
        status: "Success"
      }
    })

    return res.status(200).json({
      success: true,
      count: count.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }

}

const downloadInvoice = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { paymentId, orderId, paymentIds } = req.query;
    if (paymentIds) {
      const paymentIdsArray = Array.isArray(paymentIds)
        ? paymentIds
        : JSON.parse(paymentIds);
      const payments = await Payment.findAll({
        where: {
          id: {
            [Op.in]: paymentIdsArray,
          }
        },
        order: [["id", "ASC"]]
      });

      if (!paymentIdsArray.length) {
        return res.status(404).send('Payment not found');
      };
      const user = await Users.findByPk(payments[0].userId);
      const group = await Groups.findOne({
        where: { id: payments[0].groupId },
        attributes: [[`name_en`, 'name']]
      });

      const doc = new PDFDocument({
        size: [498, 639], // Custom size in points
      });

      // Set headers for PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payment-${payments[0].userId}.pdf`);

      // Pipe the PDF output to the response
      doc.pipe(res);

      for (const payment of payments) {
        const userName = `${user.firstName} ${user.lastName}`;
        const dateOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
        const formattedDate = payment.updatedAt.toLocaleDateString('hy-AM', dateOptions);
        const courseName = group?.dataValues.name;
        const status = payment.status === "Success" ? payment.status : payment.status = "Fail"
        const paymentMethod = payment.paymentWay
        const type = payment.type === "full" ? payment.type = "Full" : payment.type = "Monthly"

        // Add a new page for each payment, except for the first iteration
        if (payment !== payments[0]) {
          doc.addPage({
            size: [498, 639], // Optional: custom size for new pages
          });
        }
        // Image path and check if it exists
        const imagePath = path.resolve(__dirname, '../documents/PaymentInvoice.png');
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, 0, 0, {
            width: doc.page.width,
            height: doc.page.height,
          });
        } else {
          console.error('Image file does not exist:', imagePath);
        }

        // Custom bold font path
        const teko = path.resolve(__dirname, '../documents/Teko-Medium.ttf');
        const firaSans = path.resolve(__dirname, '../documents/FiraSans-Regular.ttf');
        if (fs.existsSync(teko)) {
          doc.font(teko);
        } else {
          console.error('Custom bold font file does not exist, using Helvetica-Bold');
          doc.font('Helvetica-Bold');
        }

        // Add content to the PDF (example text, payment details, etc.)


        doc.fillColor('#FFC038').fontSize(30).text(type, 308, 30, { align: 'left' });
        doc.fillColor('#FFC038').fontSize(11).text(courseName, 372, 106, { align: 'left' });
        if (fs.existsSync(firaSans)) {
          doc.font(firaSans);
        } else {
          console.error('Custom bold font file does not exist, using Helvetica-Bold');
          doc.font('Helvetica-Bold');
        };
        doc.fillColor('#12222D');
        doc.fontSize(12);
        if (userName.split("").length <= 18) {
          doc.text(userName, 28, 335);
        } else {
          const Name = userName.split(" ");
          doc.text(Name[0], 28, 329);
          doc.text(Name[2], 28, 342);
        };
        doc.text(paymentMethod, 185, 335, { align: 'left' });
        doc.text(formattedDate, 280, 335, { align: 'left' });
        doc.text(payment.amount, 355, 335, { align: 'left' });
        if (status === "Success") {
          doc.fillColor('green')
          doc.text(status, 426, 335, { align: 'left' });
        } else {
          doc.fillColor('red')
          doc.text(status, 435, 335, { align: 'left' });
        }
      }
      // Finalize the PDF and send it
      doc.end();
    } else {
      let payment;
      if (paymentId) {
        payment = await Payment.findByPk(paymentId);
      } else {
        payment = await Payment.findOne({
          where: {
            orderKey: orderId
          }
        });
      };

      if (!payment) {
        return res.status(404).send('Payment not found');
      };

      const user = await Users.findByPk(payment.userId);

      const group = await Groups.findOne({
        where: { id: payment.groupId },
        attributes: [[`name_en`, 'name']]
      });

      const userName = `${user.firstName} ${user.lastName}`;
      const dateOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
      const formattedDate = payment.updatedAt.toLocaleDateString('hy-AM', dateOptions);
      const courseName = payment.groupId ? group?.dataValues.name : false;
      const status = payment.status === "Success" ? payment.status : payment.status = "Fail"
      const paymentMethod = payment.paymentWay
      const type = payment.type === "full" ? payment.type = "Full" : payment.type = "Monthly"

      const doc = new PDFDocument({
        size: [498, 639], // Custom size in points
      });

      // Set headers for PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payment-${paymentId}.pdf`);

      // Pipe the PDF output to the response
      doc.pipe(res);

      // Image path and check if it exists
      const imagePath = path.resolve(__dirname, '../documents/PaymentInvoice.png');
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, 0, 0, {
          width: doc.page.width,
          height: doc.page.height,
        });
      } else {
        console.error('Image file does not exist:', imagePath);
      }

      // Custom bold font path
      const teko = path.resolve(__dirname, '../documents/Teko-Medium.ttf');
      const firaSans = path.resolve(__dirname, '../documents/FiraSans-Regular.ttf');
      if (fs.existsSync(teko)) {
        doc.font(teko);
      } else {
        console.error('Custom bold font file does not exist, using Helvetica-Bold');
        doc.font('Helvetica-Bold');
      }

      // Add content to the PDF (example text, payment details, etc.)


      doc.fillColor('#FFC038').fontSize(30).text(type, 308, 30, { align: 'left' });
      payment.groupId ? doc.fillColor('#FFC038').fontSize(11).text(courseName, 372, 106, { align: 'left' }) : false;
      if (fs.existsSync(firaSans)) {
        doc.font(firaSans);
      } else {
        console.error('Custom bold font file does not exist, using Helvetica-Bold');
        doc.font('Helvetica-Bold');
      }
      doc.fillColor('#12222D')
      doc.fontSize(12)
      if (userName.split("").length <= 18) {
        doc.text(userName, 28, 335);
      } else {
        const Name = userName.split(" ");
        doc.text(Name[0], 28, 329);
        doc.text(Name[2], 28, 342);
      };
      doc.text(paymentMethod, 185, 335, { align: 'left' });
      doc.text(formattedDate, 280, 335, { align: 'left' });
      doc.text(payment.amount, 355, 335, { align: 'left' });
      if (status === "Success") {
        doc.fillColor('green')
        doc.text(status, 426, 335, { align: 'left' });
      } else {
        doc.fillColor('red')
        doc.text(status, 435, 335, { align: 'left' });
      }

      // Finalize the PDF and send it
      doc.end();
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}; const { fn, col } = require("sequelize");

const getAllSubscriptionsForSuperAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { userName, order = "DESC" } = req.query;

    const searchTerms = userName ? userName.trim().split(" ") : [];

    const whereCondition = searchTerms.length
      ? {
        creatorId: userId,
        role: "ADMIN",
        [Op.or]: [
          // Single search term: match either first or last name
          ...(searchTerms.length === 1
            ? [
              { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
              { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
            ]
            : [
              // Two terms: assume firstName and lastName separately
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[0]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[1]}%` } }
                ]
              },
              // Try the reverse case in case they typed last name first
              {
                [Op.and]: [
                  { firstName: { [Op.iLike]: `%${searchTerms[1]}%` } },
                  { lastName: { [Op.iLike]: `%${searchTerms[0]}%` } }
                ]
              }
            ])
        ]
      }
      : {
        creatorId: userId,
        role: "ADMIN",
      };
    // const subscriptions = await Payment.findAll({
    //   where: {
    //     adminId: userId,
    //     status: "Success"
    //   },
    //   include: [
    //     {
    //       model: Users,
    //       as: "user",
    //       where: whereCondition,
    //       include: [
    //         {
    //           model: UserStatus,
    //           as: "userStatus",
    //           attributes: ["isActive", "endDate"],
    //         }
    //       ],
    //       attributes: ["id", "firstName", "lastName", "image"],
    //     }
    //   ],
    //   attributes: ['id', 'paymentWay', 'status', 'type', 'amount', 'createdAt'],
    //   order: [['createdAt', 'ASC']]
    // });

    let subscriptions = await Users.findAll({
      where: whereCondition,
      include: [
        {
          model: UserStatus,
          as: "userStatus",
          attributes: ["isActive", "endDate"],
        },
        {
          model: Payment,
          where: {
            status: "Success"
          },
          attributes: ["amount"],
        },
      ],
      attributes: ["id", "firstName", "lastName", "image"],
      group: [
        "Users.id", // Include all User attributes in the group
        "userStatus.id", // Include UserStatus attributes in the group
        "Payments.id", // Include Payment attributes in the group
      ],

    });

    subscriptions = Array.from(
      subscriptions.reduce((aggr, sub) => {
        const resSub = {
          id: sub.id,
          firstName: sub.firstName,
          lastName: sub.lastName,
          image: sub.image,
          amount: sub.Payments?.reduce((sum, value) => sum + (+value.amount), 0) || 0,
          endDate: sub.userStatus?.dataValues.endDate
        };
        aggr.add(resSub);
        return aggr;
      }, new Set()))

    return res.status(200).json({
      success: true,
      subscriptions
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAdminPaymentsForSuperAdmin = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { id } = req.params

    const payments = await Payment.findAll({
      where: {
        adminId: userId,
        userId: id,
        status: {
          [Op.or]: ["Success", "Payment is declined"]
        }
      },
      attributes: { exclude: ["orderKey", "orderNumber", "createdAt"] },
      order: [["id", "DESC"]]
    })

    return res.status(200).json({
      success: true,
      payments
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}


module.exports = {
  paymentUrl,
  paymentArca,
  paymentIdram,
  getUserPayment,
  monthlyPaymentUrl,
  getAllPayment,
  paymentCount,
  downloadInvoice,
  paymentUrlForAdmin,
  paymentArcaForAdmin,
  getAdminPayment,
  nextPaymentAdmin,
  getAllSubscriptionsForSuperAdmin,
  getAdminPaymentsForSuperAdmin
};
