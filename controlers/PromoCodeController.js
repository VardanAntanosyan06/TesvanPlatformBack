const {
  Groups,
  UserCourses,
  Users,
  GroupsPerUsers,
  CoursesPerLessons,
  PaymentWays,
  Lesson,
  UserLesson,
  UserTests,
  Tests,
  GroupChats,
  Homework,
  UserPoints,
  UserHomework,
  continuingGroups,
  Payment,
  HomeWorkFiles,
  UserAnswersOption,
  UserAnswersQuizz,
  PromoCode
} = require('../models');

const createPromoCodeGroup = async (req, res) => {
  try {
    const { groupId, count, endDate } = req.body;

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    let promoCode
    if (count) {
      promoCode = await PromoCode.create({
        groupId,
        code,
        count
      });
      return res.send({ success: true });
    } else {
      promoCode = await PromoCode.create({
        groupId,
        code,
        endDate
      });
      return res.send({ success: true, promoCode: promoCode.code });
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getPromoCodeGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const promoCodes = await PromoCode.findAll({
      where: {
        groupId
      }
    });

    return res.send({ success: true, promoCodes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

const addMemberGroup = async (req, res) => {
  try {
    const { groupId, promoCode } = req.body;
    const { user_id: userId } = req.user;

    const groupPromoCode = await PromoCode.findOne({
      where: { groupId, code: promoCode }
    });

    if (!groupPromoCode) {
      return res.json({ success: false, message: 'Promo code not found' });
    };

    if (groupPromoCode.count) {
      if (+groupPromoCode.count <= +groupPromoCode.userCount) {
        return res.json({ success: false, message: 'Promo code not active' });
      };
      groupPromoCode.userCount = +groupPromoCode.userCount + 1;
      await groupPromoCode.save()
    };

    if (groupPromoCode.endDate) {
      if (groupPromoCode.endDate < new Date()) {
        return res.json({ success: false, message: 'Promo code not active' });
      };
      groupPromoCode.userCount = +groupPromoCode.userCount + 1;
      await groupPromoCode.save()
    };

    const group = await Groups.findOne({
      where: {
        id: groupId
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
      return res.json({ success: false, message: 'Group not found' });
    };

    const lastGroup = await Groups.findByPk(group.lastGroup?.lastGroupId)



    const user = await Users.findOne({ where: { id: userId } });

    const userLastGroup = await GroupsPerUsers.findOrCreate({
      where: {
        groupId: group.id,
        userId: user.id,
      },
      defaults: {
        groupId: group.id,
        userId: user.id,
        userRole: user.role,
      },
    });

    await UserCourses.create({
      GroupCourseId: group.assignCourseId,
      UserId: user.id,
    });

    const lessons = await CoursesPerLessons.findAll({
      where: { courseId: group.assignCourseId },
      include: {
        model: Lesson,
        include: {
          model: Homework,
          as: 'homework',
          attributes: ['id']
        },
        required: false,
      }
    });

    lessons.map((lesson) => {

      UserLesson.create({
        GroupCourseId: group.assignCourseId,
        UserId: user.id,
        LessonId: lesson.lessonId,
      });

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
          userId: user.id,
          courseId: test.courseId,
          language: test.language,
          type: 'Group',
        },
        defaults: {
          testId: test.id,
          userId: user.id,
        },
      });
    });

    const groupChats = await GroupChats.findOne({
      where: { groupId: group.id },
    });
    const newMembers = [user.id, ...groupChats.members];
    const uniqueUsers = [...new Set(newMembers)];
    groupChats.members = uniqueUsers;

    await groupChats.save();

    if (group.lastGroup) {
      const userLastGroupMember = await GroupsPerUsers.findOne({
        where: {
          groupId: group.lastGroup.groupId,
          userId
        }
      });
      if (userLastGroupMember) {
        const lastGroupQuizPoint = await UserPoints.findAll({
          attributes: [[Sequelize.fn("COALESCE", Sequelize.fn("SUM", Sequelize.col("point")), 0), "totalQuizPoints"]],
          where: {
            userId,
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
            UserId: userId,
            GroupCourseId: lastGroup?.assignCourseId,
            LessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          },
          raw: true,
        });

        const lastQuizzPoint = await UserPoints.findAll({
          where: {
            userId: user.id,
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
            UserId: userId,
            GroupCourseId: lastGroup?.assignCourseId,
            LessonId: {
              [Sequelize.Op.in]: group.lastGroup?.lessnIds || [],
            },
          },
        });

        const copyHomework = lastGroupHomework.reduce((aggr, value) => {
          value = value.toJSON();
          delete value.id
          value.GroupCourseId = group.assignCourseId;
          aggr.push(value);
          return aggr;
        }, []);

        await UserHomework.bulkCreate(copyHomework);

        const copyHomeworkIds = copyHomework.reduce((aggr, value) => {
          aggr.push(value.HomeworkId)
          return aggr
        }, [])

        const lastGroupHomeworkFile = await HomeWorkFiles.findAll({
          where: {
            userId,
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
            userId,
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
            UserId: user.id,
          }
        });

        userCours.takenHomework = +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
        userCours.takenQuizzes = +lastGroupQuizPoint[0]?.totalQuizPoints;
        userCours.totalPoints = +lastGroupQuizPoint[0]?.totalQuizPoints + +lastGroupHomeworkPoint[0]?.totalHomeworkPoints;
        await userCours.save()

        const payment = await PaymentWays.findOne({
          where: {
            groupId: group.id,
            type: "monthly"
          }
        })
        const thisCoursePrice = payment.price * (1 - payment.discount / 100);
        await Payment.create({
          orderKey: "last cours payment",
          orderNumber: "last cours payment",
          paymentWay: "ARCA",
          status: "Success",
          userId,
          groupId: group.id,
          type: "monthly",
          amount: Math.round(thisCoursePrice)
        })
      }
    };

    return res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  createPromoCodeGroup,
  getPromoCodeGroup,
  addMemberGroup
}
