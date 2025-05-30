const {
  Groups,
  UserCourses,
  Users,
  JoinCart,
  GroupsPerUsers,
  Certificates,
  GroupCourses,
  CoursesPerLessons,
  PaymentWays,
  CoursesContents,
  Lesson,
  UserLesson,
  UserTests,
  Tests,
  PaymentBlocks,
  GroupChats,
  Homework,
  UserPoints,
  UserHomework,
  LessonTime,
  HomeworkPerLesson,
  continuingGroups,
  Payment,
  HomeWorkFiles,
  UserAnswersOption,
  UserAnswersQuizz,
  IndividualGroupParams
} = require('../models');
const { v4 } = require('uuid');
const sequelize = require('sequelize'); // Make sure the path is correct
const { Op } = require('sequelize');
const { finished } = require('nodemailer/lib/xoauth2');
const Sequelize = require('sequelize')

const CreateGroup = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { name_en, name_am, name_ru, assignCourseId, users, startDate, endDate, payment, type } =
      req.body;

    let groupeKey = `${process.env.HOST}-joinLink-${v4()}`;

    let { price, discount } = payment.reduce(
      (min, item) => (item.price_en < min.price_en ? item : min),
      payment[0],
    );

    const task = await Groups.create({
      name_am,
      name_ru,
      name_en,
      groupeKey,
      assignCourseId,
      startDate,
      endDate,
      price: price,
      sale: discount,
      creatorId: userId,
      type: type.toLowerCase()
    });

    function getMonthAndDayCount(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Calculate the difference in years and months
      const yearsDifference = end.getFullYear() - start.getFullYear();
      const monthsDifference = end.getMonth() - start.getMonth();

      // Total months count
      const totalMonths = (yearsDifference * 12) + monthsDifference;

      // Calculate the difference in days
      const startDay = start.getDate();
      const endDay = end.getDate();

      // Handle case where the end day is before the start day in the month
      let totalDays = endDay - startDay;
      if (totalDays < 0) {
        // Go back one month and calculate the correct number of days
        const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        totalDays += previousMonth.getDate();
      }

      return { months: totalMonths, days: totalDays };
    }

    const durationMonths = getMonthAndDayCount(startDate, endDate)

    payment.map((e) => {
      PaymentWays.create({
        title_en: e.title,
        title_ru: e.title,
        title_am: e.title,
        description_en: e.description_en,
        description_ru: e.description_ru,
        description_am: e.description_am,
        price: e.price,
        discount: e.discount,
        groupId: task.id,
        durationMonths: durationMonths.months,
        type: e.title.toLowerCase()
      });
    });

    await Promise.all(
      users.map(async (userId) => {
        // console.log(userId);
        const user = await Users.findByPk(userId);
        await UserCourses.create({
          GroupCourseId: task.assignCourseId,
          UserId: userId,
        });
        const lessons = await CoursesPerLessons.findAll({
          where: { courseId: task.assignCourseId },
        });

        await Promise.all(
          lessons.map(async (e) => {
            await UserLesson.create({
              GroupCourseId: task.assignCourseId,
              UserId: userId,
              LessonId: e.lessonId,
            });
          }),
        );
        await GroupsPerUsers.findOrCreate({
          where: {
            groupId: task.id,
            userId,
            userRole: user.role,
          },
          defaults: {
            groupId: task.id,
            userId,
            userRole: user.role,
          },
        });
      }),
    );
    const { img } = await GroupCourses.findOne({
      where: { id: task.assignCourseId },
    });
    const admin = await Users.findOne({
      where: {
        role: "ADMIN"
      }
    })

    await GroupChats.create({
      adminId: admin.id,
      image: img,
      groupId: task.id,
      name: name_en,
      members: users,
    });
    res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const group = await Groups.findOne({
      where: { id },
      include: [
        {
          model: GroupsPerUsers,
          attributes: ['id', 'userId'],
          include: {
            model: Users,
            attributes: ['id', 'firstName', 'lastName', 'role', 'image'],
          },
        },
        {
          model: PaymentWays,
          as: 'payment',
          // attributes: ['title', 'description', 'price', 'discount'],
        },
      ],
    });

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const course = await CoursesContents.findOne({
      where: { courseId: group.assignCourseId },
      attributes: [['courseId', 'id'], 'title'],
    });

    const groupedUsers = {
      id: group.id,
      name_en: group.name_en,
      name_ru: group.name_ru,
      name_am: group.name_am,
      finished: group.finished,
      startDate: group.startDate,
      endDate: group.endDate,
      price: group.price,
      sale: group.sale,
      payment: group.payment,
      course: course,
      TEACHER: [],
      STUDENT: [],
    };
    group.GroupsPerUsers.forEach((userCourse) => {
      const user = userCourse.User;
      if (user) {
        if (!groupedUsers[user.role]) {
          groupedUsers[user.role] = [];
        }
        groupedUsers[user.role].push({
          id: user.id,
          image: user.image,
          title: user.firstName + ' ' + user.lastName,
        });
      }
    });

    return res.status(200).json({ success: true, group: groupedUsers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findOneTeacherAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let { language, order = "DESC", orderName = "totalPoints" } = req.query;
    const { user_id: userId } = req.user;

    if (orderName === "quizz") {
      orderName = "takenQuizzes"
    } else if (orderName === "homework") {
      orderName = "takenHomework"
    } else if (orderName === "interview") {
      orderName = "takenInterview"
    } else if (orderName === "total") {
      orderName = "totalPoints"
    };

    const group = await Groups.findOne({
      where: { id },
      attributes: [
        [`name_${language}`, "name"],
        "finished",
        "startDate",
        "endDate",
        "assignCourseId"
      ]
    });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const user = await Users.findOne({
      where: {
        id: userId
      },
      include: [
        {
          model: UserCourses,
          attributes: ["id"],
          where: {
            GroupCourseId: group.assignCourseId
          },
          require: false
        },
      ]
    });

    if (!user) return res.status(404).json({ message: 'Group not found' });

    const course = await CoursesContents.findOne({
      where: {
        courseId: group.assignCourseId
      }
    });

    // Convert the Sequelize instance to a plain JavaScript object
    let groupData = group.toJSON();
    groupData = {
      ...groupData,
      maxHomeworkPoint: +course.maxHomeworkPoint || 0,
      maxQuizzPoint: +course.maxQuizzPoint || 0,
      maxInterviewPoint: +course.maxInterviewPoint || 0,
      maxTotalPoint: +course?.maxInterviewPoint || 0 + +course?.maxQuizzPoint || 0 + +course?.maxHomeworkPoint || 0
    };
    delete groupData.CoursesContent;
    const users = await Users.findAll({
      where: {
        role: "STUDENT"
      },
      include: [
        {
          model: UserCourses,
          attributes: ["takenQuizzes", "takenHomework", "takenInterview", "totalPoints"],
          where: {
            GroupCourseId: group.assignCourseId
          }
        },
        {
          model: LessonTime,
          as: "lessonTime",
          attributes: [
            "time"
          ]
        }
      ],
      attributes: [
        'id',
        'firstName',
        'lastName',
        'role',
        'image',
      ],
      order: [
        orderName === "name"
          ? ["lastName", order]
          : orderName === "time"
            ? [{ model: LessonTime, as: "lessonTime", }, orderName, order]
            : [UserCourses, orderName, order]
      ]
    });


    const usersWithPoints = users.reduce((aggr, value) => {
      value = value.toJSON(); // Convert Sequelize instance to plain object
      const totalTime = value.lessonTime.reduce((aggr, value) => {
        return aggr = aggr + +value.time
      }, 0)
      // Create the transformed user object
      const userObj = {
        ...value, // Spread the original user object
        quizPoint: +(Number(value.UserCourses[0]?.takenQuizzes).toFixed(2)) || 0, // Optional chaining to avoid errors if UserCourses is empty
        homeworkPoint: +(Number(value.UserCourses[0]?.takenHomework).toFixed(2)) || 0,
        interviewPoint: +(Number(value.UserCourses[0]?.takenInterview).toFixed(2)) || 0,
        totalPoints: +(Number(value.UserCourses[0]?.totalPoints).toFixed(2)) || 0,
        totalTime: +(Number(totalTime).toFixed(2))
      };
      // Delete the UserCourses property after creating the object
      delete userObj.lessonTime;
      delete userObj.UserCourses;
      aggr.push(userObj); // Push the transformed object to the accumulator
      return aggr; // Return the accumulator
    }, []);

    return res.status(200).json({ success: true, users: usersWithPoints, group: groupData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getGroupesForTeacher = async (req, res) => {
  try {
    const { user_id: userId } = req.user;

    const groups = await UserCourses.findAll({
      where: {
        UserId: userId,
      },
      attributes: ['GroupCourseId'],
      include: [
        {
          model: Groups,
          attributes: ['name', 'finished', 'createdAt'],
        },
      ],
    });
    if (groups.length == 0)
      return res.status(403).json({
        success: false,
        message: "The teacher doesn't have groups yet.",
      });
    Users.count()
      .then((totalUsers) => {
        console.log('Total Users:', totalUsers);

        // Fetch 3 random users
        return Users.findAll({
          order: [[sequelize.literal('RAND()')]],
          limit: 1,
        });
      })
      .then((randomUsers) => {
        console.log(
          'Random Users:',
          randomUsers.map((user) => user.username),
        );
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return res.status(200).json({ success: true, groups });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findAll = async (req, res) => {
  try {
    const group = await Groups.findAll({
      include: {
        model: UserCourses,
        attributes: ['id', 'UserId'],
        include: {
          model: Users,
          attributes: ['firstName', 'lastName', 'role'],
        },
      },
    });

    if (group.length === 0)
      return res.status(404).json({ success: false, message: 'Group not found' });

    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const update = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { user_id: userId } = req.user;

    const {
      name_en,
      name_am,
      name_ru,
      assignCourseId,
      startDate,
      endDate,
      payment,
      // payment_ru,
      // payment_am,
      sale,
    } = req.body;

    let groupeKey = `${process.env.HOST}-joinLink-${v4()}`;

    let { price, discount } = payment.reduce(
      (min, item) => (item.price_en < min.price_en ? item : min),
      payment[0],
    );
    const group = await Groups.findOne({
      where: {
        id: groupId,
        creatorId: userId
      },
      include: [
        {
          model: Users,
          where: { role: 'STUDENT' },
          attributes: ["id"],
          required: false
        },
      ],
    })

    if (!group) return res.status(400).json({ success: false, message: "You do not have permission to update this groupe." })

    function getMonthCount(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const yearsDifference = end.getFullYear() - start.getFullYear();
      const monthsDifference = end.getMonth() - start.getMonth();
      const totalMonths = (yearsDifference * 12) + monthsDifference;

      return totalMonths
    };
    const month = getMonthCount(startDate, endDate)
    await Groups.update(
      {
        name_am,
        name_ru,
        name_en,
        groupeKey,
        startDate,
        endDate,
        price,
        sale: discount,
      },
      { where: { id: groupId } },
    );

    await PaymentWays.destroy({
      where: { groupId },
    });
    payment.map((e) => {
      PaymentWays.create({
        title_en: e.title,
        title_ru: e.title,
        title_am: e.title,
        description_en: e.description_en,
        description_ru: e.description_ru,
        description_am: e.description_am,
        price: e.price,
        discount: e.discount,
        groupId,
        durationMonths: month,
        type: e.title.toLowerCase()
      });
    });

    // await UserCourses.destroy({
    //   where: {
    //     GroupCourseId: group.assignCourseId
    //   }
    // })

    // await UserLesson.destroy({
    //   where: {
    //     GroupCourseId: group.assignCourseId
    //   }
    // })

    // await GroupsPerUsers.destroy({ where: { groupId } });

    // await Promise.all(
    //   [...studentIds, ...users].map(async (userId) => {

    //     const user = await Users.findByPk(userId);
    // await UserCourses.create({
    //   GroupCourseId: assignCourseId,
    //   UserId: userId,
    // });
    // const lessons = await CoursesPerLessons.findAll({
    //   where: { courseId: assignCourseId },
    // });
    // await Promise.all(
    // lessons.map(async (e) => {
    //   await UserLesson.findOrCreate({
    //     where: {
    //       GroupCourseId: assignCourseId,
    //       UserId: userId,
    //       LessonId: e.lessonId
    //     },
    //     default: {
    //       GroupCourseId: assignCourseId,
    //       UserId: userId,
    //       LessonId: e.lessonId
    //     }
    //   });
    // }),
    // );
    // await GroupsPerUsers.findOrCreate({
    //   where: {
    //     groupId,
    //     userId,
    //     userRole: user.role,
    //   },
    //   defaults: {
    //     groupId,
    //     userId,
    //     userRole: user.role,
    //   },
    // });
    //   }),
    // );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, users } = req.body;
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

    await Promise.all(
      users.map(async (userId) => {
        const user = await Users.findOne({ where: { id: userId } });

        /// for individual groupes
        if (group.type = "individual" && user.role === "STUDENT") {
          await IndividualGroupParams.create({
            userId,
            groupId: group.id,
            courseId: group.assignCourseId,
            lessonCount: 1
          })
        };

        const groupChats = await GroupChats.findOne({
          where: { groupId: group.id },
        });
        const newMembers = [user.id, ...groupChats.members];
        const uniqueUsers = [...new Set(newMembers)];
        groupChats.members = uniqueUsers;
        await groupChats.save();

        await GroupsPerUsers.findOrCreate({
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

        if (group.lastGroup) {
          const userLastGroupMember = await GroupsPerUsers.findOne({
            where: {
              groupId: group.lastGroup.lastGroupId,
              userId,
              userRole: "STUDENT"
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
              delete value.id
              value.courseId = group.assignCourseId
              aggr.push(value)
              return aggr
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
            await userCours.save();
            console.log(+lastGroupHomeworkPoint[0]?.totalHomeworkPoints, +lastGroupQuizPoint[0]?.totalQuizPoints, +lastGroupQuizPoint[0]?.totalQuizPoints + +lastGroupHomeworkPoint[0]?.totalHomeworkPoints, 55);

          }
        }
      }),
    );

    return res.send({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const SingleUserStatics = async (req, res) => {
  try {
    const { id, userId } = req.query;

    // const group = await Groups.findOne({
    //   where: {
    //     id,
    //   },
    // });

    // const userInfo = await UserCourses.findOne({
    //   where: { GroupCourseId: group.assignCourseId, UserId: userId },
    //   include: {
    //     model: Users,
    //     attributes: ['firstName', 'lastName', 'image']
    //   },
    // });

    // if (!userInfo) return res.status(404).json({ success: false, message: 'Invalid id or userId' });

    // return res.status(200).json({ success: true, userInfo });
    let course = await Groups.findByPk(id, {
      include: [
        {
          model: GroupCourses,
          include: {
            model: CoursesContents,
          },
        },
      ],
    });

    const isIndividual = await UserCourses.findOne({
      where: {
        UserId: userId,
        GroupCourseId: course.assignCourseId,
      },
      include: [CoursesContents],
    });
    const userCoursPoints = +isIndividual.totalPoints
    const userCoursQuizzPoints = +isIndividual.takenQuizzes
    const userCoursHomeworkPoints = +isIndividual.takenHomework

    const group = await GroupsPerUsers.findOne({
      where: {
        userId,
        groupId: id,
      },
    });
    const students = await GroupsPerUsers.count({
      where: { groupId: id, userRole: 'STUDENT' },
    });

    const lessons = await CoursesPerLessons.count({
      where: {
        courseId: course.assignCourseId ? course.assignCourseId : 1,
      },
    });

    const maxPoint = await CoursesContents.findOne({
      where: {
        courseId: course.assignCourseId
      }
    })
    console.log(maxPoint.maxQuizzPoint, maxPoint.maxInterviewPoint, maxPoint.maxHomeworkPoint);



    if (!group) {
      return res.status(403).json({
        success: false,
        message: "Group not found or user doesn't in group",
      });
    }
    // const mySkils = await Skills.findAll({
    //   where: { userId },
    // });

    // let charts = await LessonTime.findAll({
    //   where: {
    //     userId,
    //   },
    // });

    // charts = charts.map((e) => e.time);

    const response = {
      lesson: 0,
      homework: {
        maxHomevorkPoint: +maxPoint.maxHomeworkPoint,
        userCoursHomeworkPoints: parseFloat(userCoursHomeworkPoints.toFixed(2)),
      },
      quizzes: {
        maxQuizzPoint: +maxPoint.maxQuizzPoint,
        userCoursQuizzPoints: parseFloat(userCoursQuizzPoints.toFixed(2)),
      },
      interview: {
        maxInterviewPoint: +maxPoint.maxInterviewPoint,
        userCoursInterviewPoint: 0
      },

      totalPoints: parseFloat(userCoursPoints.toFixed(2)),
      maxTotalPoints: +maxPoint.maxInterviewPoint + +maxPoint.maxQuizzPoint + +maxPoint.maxHomeworkPoint,
      // mySkils,
      // charts,
      course: {
        students,
        lessons: lessons,
        lessonType: course.GroupCourse.CoursesContents[0].level,
      },
    };
    return res.json(response);
  } catch (error) {
    console.log(error.message, error.name);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const recordUserStatics = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId)
      return res.status(403).json({ success: false, message: 'groupId cannot be null' });

    const group = await Groups.findByPk(groupId);
    if (!group) return res.status(403).json({ success: false, message: 'Wrong groupId' });
    const month = new Date().getMonth() + 1;
    await JoinCart.create({ groupId, month });

    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUserStaticChart = async (req, res) => {
  try {
    const { groupId } = req.params;

    // const statics = await JoinCart.findAll({ where: { groupId } });

    let statics = await JoinCart.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { groupId },
      group: ['month'],
      order: [['month', 'ASC']],
    });
    const UserCount = await Users.count();
    statics = statics.map((e) => (+e.dataValues.count / UserCount) * 100);
    return res.json({ statics, UserCount });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const finishGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;
    const Group = await Groups.findOne({
      where: {
        id,
      },
      include: [
        {
          model: UserCourses,
        },
        {
          model: Users,
          through: {
            model: GroupsPerUsers,
            where: {
              userRole: "STUDENT"
            }
          },
        }
      ],
    });

    if (!Group)
      return res.json({
        success: false,
        message: `Group with ID ${id} not defined`,
      });

    if (Group.finished) {
      return res.json({
        success: false,
        message: `Group finished`,
      });
    }

    const { title: courseName } = await CoursesContents.findOne({
      where: { courseId: Group.assignCourseId, language },
    });

    const userPoints = Group.UserCourses.reduce((aggr, value) => {
      aggr[`${value.UserId}`] = value.totalPoints
      return aggr
    }, {});

    let status = 1;
    Group.Users.forEach(async (user) => {
      if (userPoints[user.id]) {
        if (+userPoints[user.id] > 90) {
          status = 3;
        } else if (+userPoints[user.id] >= 40) {
          status = 2;
        } else {
          status = 1
        }
      }

      const date = Group.endDate.toISOString()
      Certificates.create({
        userId: user.id,
        courseName,
        status,
        giveDate: date,
        point: +userPoints[user.id],
        groupId: Group.id
      });
      return;
    });

    Group.finished = true;
    Group.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findGroups = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { creatorId } = await Users.findByPk(userId)
    const teacher = await Users.findAll({
      where: {
        role: "TEACHER",
        creatorId: +userId
      },
      attributes: ["id", "firstName", "lastName", "image", "role"]
    });

    const teacherIds = teacher.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);
    let group = await Groups.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
      attributes: ['id', ['name_en', 'name'], 'assignCourseId', "finished", "startDate"],
      order: [['id', 'DESC']],
      include: [
        {
          model: GroupsPerUsers,
          required: false,
          include: {
            model: Users,
            attributes: ['firstName', 'lastName', 'image', 'role'],
            where: { role: { [Op.in]: ['TEACHER', 'STUDENT'] } },
          },
          attributes: ['userId'],
          limit: 3
        },
      ],
    });

    group = await Promise.all(
      group.map(async (grp) => {
        const group = grp.toJSON();
        const date = new Date(group.startDate);
        const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
        const year = date.getFullYear();
        const a = await Promise.all(
          grp.GroupsPerUsers.map(async (e) => {
            let user = e.toJSON();
            delete user.dataValues;
            user.firstName = user.User.firstName;
            user.lastName = user.User.lastName;
            user.image = user.User.image;
            user.role = user.User.role;
            delete user.User;
            return user;
          }),
        );

        const usersCount = await GroupsPerUsers.count({
          where: { groupId: grp.id, userRole: "STUDENT" },
        });

        return {
          ...grp.dataValues,
          name: `${group.name} - ${monthName} ${year}`,
          usersCount,
          GroupsPerUsers: a,
        };
      }),
    );
    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getStudents = async (req, res) => {
  try {
    const users = await Users.findAll({
      where: { role: 'STUDENT' },
      attributes: ['id', 'firstName', 'lastName', 'image'],
    });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getTeachers = async (req, res) => {
  try {
    let users = await Users.findAll({
      where: { role: 'TEACHER' },
      attributes: ['id', 'firstName', 'lastName'],
    });

    users = users.map((e) => {
      e = e.toJSON();
      delete e.dataValues;

      e['title'] = e.firstName + ' ' + e.lastName;
      delete e.firstName;
      delete e.lastName;

      return e;
    });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { user_id: userId } = req.user
    const { id } = req.params;

    const group = await Groups.findOne({ where: { id, creatorId: userId } });
    if (!group) {
      return res.status(400).json({
        success: false,
        message: "You do not have permission to delete this group."
      });
    };

    await PaymentWays.destroy({
      where: { groupId: id }
    })

    await Certificates.destroy({ where: { groupId: id } });

    await Groups.destroy({ where: { id } });

    await UserCourses.destroy({ where: { GroupCourseId: id } });

    GroupsPerUsers.destroy({
      where: { groupId: id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.query;

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

    const users = await Users.findAll({
      where: {
        ...whereCondition,
        role: {
          [Op.or]: ['STUDENT', 'TEACHER'],
        },
      },
      include: [
        {
          model: GroupsPerUsers,
          where: { groupId: id },
          required: false,
        },
      ],
      // where: {
      //   role: {
      //     [Op.or]: ['STUDENT', 'TEACHER'],
      //   },
      // },
      attributes: ['id', 'firstName', 'lastName', 'role'],
      order: [["createdAt", "DESC"]]
    });

    const teacherUsers = [];
    const studentUsers = [];

    users.forEach((user) => {
      if (user.role === 'TEACHER' && user.GroupsPerUsers.length === 0) {
        teacherUsers.push({
          id: user.id,
          title: `${user.firstName} ${user.lastName}`,
        });
      } else if (user.role === 'STUDENT' && user.GroupsPerUsers.length === 0) {
        studentUsers.push({
          id: user.id,
          title: `${user.firstName} ${user.lastName}`,
        });
      }
    });

    return res.status(200).json({ teacher: teacherUsers, student: studentUsers });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { groupId, userId } = req.query;
    const { assignCourseId, finished, type } = await Groups.findOne({
      where: {
        id: groupId
      },
    });

    if (finished) {
      return res.status(400).json({ message: 'You cannot remove members from a finished group.' });
    }

    await GroupsPerUsers.destroy({
      where: {
        groupId,
        userId,
      },
    });

    await UserCourses.destroy({
      where: {
        GroupCourseId: assignCourseId,
        UserId: userId,
      },
    });

    // Delete entries from UserLesson based on GroupCourseId and UserId
    await UserLesson.destroy({
      where: {
        GroupCourseId: assignCourseId,
        UserId: userId,
      },
    });
    await UserPoints.destroy({
      where: {
        userId,
        courseId: assignCourseId
      },
    });

    await UserTests.destroy({
      where: {
        userId: userId,
        courseId: {
          [sequelize.Op.or]: [assignCourseId, null],
        },
      },
    });

    await UserHomework.destroy({
      where: {
        UserId: userId,
        GroupCourseId: assignCourseId
      }
    })

    const groupChats = await GroupChats.findOne({
      where: { groupId: groupId },
    });

    await UserAnswersQuizz.destroy({
      where: {
        userId,
        courseId: assignCourseId
      }
    })

    if (type === "individual") {
      await IndividualGroupParams.destroy({
        where: {
          userId,
          groupId,
          courseId: assignCourseId,
        }
      })
    }

    if (groupChats) {

      const newMembers = groupChats.members;
      groupChats.members = []
      const index = newMembers.indexOf(+userId);
      if (index !== -1) {
        newMembers.splice(index, 1);
        groupChats.members = [...newMembers];
        await groupChats.save();
      } else {
        return res.status(400).json({ message: 'User not found in group members.' });
      }
    } else {
      return res.status(400).json({ message: 'Group not found.' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const groupInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    const groupName = await Groups.findOne({
      where: { id },
      attributes: [[`name_${language}`, 'name']],
      include: [
        { model: Users },
        {
          model: GroupCourses,
          include: [
            {
              model: CoursesContents,
              where: { language },
            },
            {
              model: Lesson,
            },
          ],
        },
      ],
    });
    const respone = {
      name: groupName.dataValues.name,
      userCount: groupName.Users.length,
      level: groupName.GroupCourse.CoursesContents[0].level,
      lessonCount: groupName.GroupCourse.Lessons.length,
    };
    return res.status(200).json(respone);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong !' });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const { language } = req.query;
    const { user_id: userId } = req.user;

    const teacher = await Users.findAll({
      where: {
        role: "TEACHER",
        creatorId: +userId
      },
      attributes: ["id"]
    });

    const teacherIds = teacher.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, [])

    const groups = await Groups.findAll({
      where: {
        creatorId: [+userId, ...teacherIds]
      },

      include: [
        {
          model: GroupsPerUsers,
          required: false,
          attributes: ['id'],
        },
      ],
      attributes: ['id', [`name_${language}`, 'name'], "createdAt"],
      order: [['id', 'DESC']],
    });

    const resGroups = groups.reduce((aggr, value) => {
      value = value.toJSON()
      value.studentCount = value.GroupsPerUsers.length
      delete value.GroupsPerUsers
      aggr.push(value)
      return aggr
    }, [])

    return res.status(200).json({ success: true, groups: resGroups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong !' });
  }
};

const getAllGroupForTeacher = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { language } = req.query;
    let group = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: Groups,
              include: [
                {
                  model: Users,
                  where: { role: 'STUDENT' },
                  attributes: ['firstName', 'lastName', 'image', 'role'],
                },
              ],
              attributes: ["id", [`name_${language}`, 'name'], "assignCourseId", "finished", "createdAt", "startDate"]
            }
          ],
        },
      ],
    });

    let creatorGroup = await Groups.findAll({
      where: {
        creatorId: userId,
      },
      include: [
        {
          model: Users,
          where: { role: 'STUDENT' },
          attributes: ['firstName', 'lastName', 'image', 'role'],
          required: false,
        },
      ],
      attributes: ["id", [`name_${language}`, 'name'], "assignCourseId", "finished", "createdAt", "startDate"]
    });
    console.log(creatorGroup);


    creatorGroup = creatorGroup.reduce((aggr, value) => {
      const firstGroup = value;
      if (!firstGroup) return aggr;

      const group = firstGroup.toJSON();
      const users = group?.Users || [];

      const date = group.startDate
      const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
      const year = new Date(group.startDate).getFullYear();
      group.name = group.name + " - " + monthName + " " + year

      group.usersCount = users.length;
      group.GroupsPerUsers = users.slice(0, 3);
      delete group?.Users;

      aggr.push(group);
      return aggr;
    }, [])

    group = group.reduce((aggr, value) => {
      const firstGroup = value?.GroupCourse?.Groups?.[0];
      if (!firstGroup) return aggr; // Skip if no group exists
      const group = firstGroup.toJSON();
      const date = group.startDate
      const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
      const year = new Date(group.startDate).getFullYear();

      const users = group?.Users || []; // Default to empty array if Users is undefined
      group.name = group.name + " - " + monthName + " " + year
      group.usersCount = users.length; // Count the number of users
      group.GroupsPerUsers = users.slice(0, 3); // Get first 3 users
      delete group?.Users; // Remove Users from dataValues

      aggr.push(group);
      return aggr;
    }, []);

    const resData = Array.from(
      new Map([...creatorGroup, ...group].map(e => [e.id, e])).values()
    );

    return res.status(200).json({ success: true, group: resData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong !' });
  }
}


const getAllGroupForTeacherDashbord = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { language } = req.query;
    let group = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: Groups,
              where: {
                finished: false
              },
              include: [
                {
                  model: Users,
                  where: { role: 'STUDENT' },
                  attributes: ['firstName', 'lastName', 'image', 'role'],
                },
              ],
              attributes: ["id", [`name_${language}`, 'name'], "assignCourseId", "finished", "createdAt", "startDate"]
            }
          ],
        },
      ],
    });

    let creatorGroup = await Groups.findAll({
      where: {
        creatorId: userId,
        finished: false
      },
      include: [
        {
          model: Users,
          where: { role: 'STUDENT' },
          attributes: ['firstName', 'lastName', 'image', 'role'],
        },
      ],
      attributes: ["id", [`name_${language}`, 'name'], "assignCourseId", "finished", "createdAt", "startDate"]
    });

    creatorGroup = creatorGroup.reduce((aggr, value) => {
      const firstGroup = value;
      if (!firstGroup) return aggr;

      const group = firstGroup.toJSON();
      const users = group?.Users || [];

      const date = group.startDate
      const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
      const year = new Date(group.startDate).getFullYear();
      group.name = group.name + " - " + monthName + " " + year
      group.usersCount = users.length;
      group.GroupsPerUsers = users.slice(0, 3);
      delete group?.Users;

      aggr.push(group);
      return aggr;
    }, [])

    group = group.reduce((aggr, value) => {
      const firstGroup = value?.GroupCourse?.Groups?.[0];
      if (!firstGroup) return aggr; // Skip if no group exists

      const group = firstGroup.toJSON();
      const date = group.startDate
      const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
      const year = new Date(group.startDate).getFullYear();
      const users = group?.Users || []; // Default to empty array if Users is undefined

      group.name = group.name + " - " + monthName + " " + year
      group.usersCount = users.length; // Count the number of users
      group.GroupsPerUsers = users.slice(0, 3); // Get first 3 users
      delete group?.Users; // Remove Users from dataValues

      aggr.push(group);
      return aggr;
    }, []);

    const resData = Array.from(
      new Map([...creatorGroup, ...group].map(e => [e.id, e])).values()
    );

    return res.status(200).json({ success: true, group: resData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something Went Wrong !' });
  }
}

const getAllGroupForAdminDashbord = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { language } = req.query;
    const { creatorId } = await Users.findByPk(userId)
    const teacher = await Users.findAll({
      where: {
        role: "TEACHER",
        creatorId: +userId
      },
      attributes: ["id", "firstName", "lastName", "image", "role"]
    });

    const teacherIds = teacher.reduce((aggr, value) => {
      aggr.push(value.id)
      return aggr;
    }, []);
    let group = await Groups.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds],
        finished: false
      },
      attributes: ['id', [`name_${language}`, 'name'], 'assignCourseId', "startDate"],
      order: [['id', 'DESC']],
      include: [
        {
          model: GroupsPerUsers,
          required: false,
          include: {
            model: Users,
            attributes: ['firstName', 'lastName', 'image', 'role'],
            where: { role: { [Op.in]: ['TEACHER', 'STUDENT'] } },
          },
          attributes: ['userId'],
          limit: 3
        },
      ],
    });

    group = await Promise.all(
      group.map(async (grp) => {
        const group = grp.toJSON();
        const date = new Date(group.startDate);
        const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
        const year = date.getFullYear();
        const a = await Promise.all(
          grp.GroupsPerUsers.map(async (e) => {
            let user = e.toJSON();
            delete user.dataValues;
            user.firstName = user.User.firstName;
            user.lastName = user.User.lastName;
            user.image = user.User.image;
            user.role = user.User.role;
            delete user.User;
            return user;
          }),
        );

        const usersCount = await GroupsPerUsers.count({
          where: { groupId: grp.id, userRole: "STUDENT" },
        });

        return {
          ...grp.dataValues,
          name: `${group.name} - ${monthName} ${year}`,
          usersCount,
          GroupsPerUsers: a,
        };
      }),
    );
    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getAllGroupForSuperAdminDashbord = async (req, res) => {
  try {
    const { language } = req.query;
    let group = await Groups.findAll({
      where: {
        finished: false
      },
      attributes: ['id', [`name_${language}`, 'name'], 'assignCourseId', "startDate"],
      order: [['id', 'DESC']],
      include: [
        {
          model: GroupsPerUsers,
          required: false,
          include: {
            model: Users,
            attributes: ['firstName', 'lastName', 'image', 'role'],
            where: { role: { [Op.in]: ['TEACHER', 'STUDENT'] } },
          },
          attributes: ['userId'],
          limit: 3
        },
      ],
    });

    group = await Promise.all(
      group.map(async (grp) => {
        const group = grp.toJSON();
        const date = new Date(group.startDate);
        const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
        const year = date.getFullYear();
        const a = await Promise.all(
          grp.GroupsPerUsers.map(async (e) => {
            let user = e.toJSON();
            delete user.dataValues;
            user.firstName = user.User.firstName;
            user.lastName = user.User.lastName;
            user.image = user.User.image;
            user.role = user.User.role;
            delete user.User;
            return user;
          }),
        );

        const usersCount = await GroupsPerUsers.count({
          where: { groupId: grp.id, userRole: "STUDENT" },
        });

        return {
          ...grp.dataValues,
          name: `${group.name} - ${monthName} ${year}`,
          usersCount,
          GroupsPerUsers: a,
        };
      }),
    );
    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

module.exports = {
  CreateGroup,
  findOne,
  findOneTeacherAdmin,
  findAll,
  update,
  addMember,
  SingleUserStatics,
  recordUserStatics,
  getUserStaticChart,
  finishGroup,
  getUsers,
  getGroupesForTeacher,
  findGroups,
  getStudents,
  getTeachers,
  deleteGroup,
  deleteMember,
  groupInfo,
  getAllAdmin,
  getAllGroupForTeacher,
  getAllGroupForTeacherDashbord,
  getAllGroupForAdminDashbord,
  getAllGroupForSuperAdminDashbord
};
