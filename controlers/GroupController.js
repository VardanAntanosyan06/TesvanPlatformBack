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
  UserPoints
} = require('../models');
const { v4 } = require('uuid');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const CreateGroup = async (req, res) => {
  try {
    const { name_en,name_am,name_ru, assignCourseId, users, startDate, endDate, payment_en } = req.body;

    let groupeKey = `${process.env.HOST}-joinLink-${v4()}`;

    let { price, discount } = payment_en.reduce(
      (min, item) => (item.price < min.price ? item : min),
      payment_en[0],
    );

    const task = await Groups.create({
      name_am,
      name_ru,
      name_en,
      groupeKey,
      assignCourseId,
      startDate,
      endDate,
      price:10,
      sale: 1,
    });

    // payment_en.map((e) => {
      PaymentWays.create({
        title_en: "Static title",
        title_ru: "Static title",
        title_am: "Static title",
        description_en: "Static description",
        description_en: "Static description",
        description_en: "Static description",
        price: 10,
        discount: 5,
        groupId: task.id,
      });
    // });

    await Promise.all(
      users.map(async (userId) => {
        console.log(userId);
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
        await GroupsPerUsers.create({
          groupId: task.id,
          userId,
          userRole: users.userRole,
        });
      }),
    );

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
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
      name: group.name,
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
    // console.log(course)
    // console.log(group.assignCourseId);
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
    const { name, assignCourseId, users, startDate, endDate, payment } = req.body;

    let group = await Groups.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.name = name;
    group.assignCourseId = assignCourseId;
    group.startDate = startDate;
    group.endDate = endDate;

    if (payment && payment.length > 0) {
      let { price, discount } = payment.reduce(
        (min, item) => (item.price < min.price ? item : min),
        payment[0],
      );
      group.price = price;
      group.sale = discount;

      await PaymentWays.destroy({ where: { groupId } });

      await PaymentWays.bulkCreate(payment);
    }

    await group.save();

    return res.status(200).json({ success: true, group, PaymentWays });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, users } = req.body;

    const group = await Groups.findByPk(groupId); // Added await here
    await Promise.all(
      users.map(async (userId) => {
        const user = await Users.findOne({ where: { id: userId } });
        if (user) {
          const userRole = user.role;
          await GroupsPerUsers.create({
            groupId: groupId,
            userId: userId,
            userRole: userRole,
          });
        }

        await UserCourses.create({
          GroupCourseId: group.assignCourseId,
          UserId: userId,
        });

        const lessons = await CoursesPerLessons.findAll({
          where: { courseId: group.assignCourseId },
        });

        await Promise.all(
          lessons.map(async (e) => {
            await UserLesson.create({
              GroupCourseId: group.assignCourseId,
              UserId: userId,
              LessonId: e.lessonId,
            });
          }),
        );
        await UserPoints.findOrCreate({
          where:{
            userId
          },
          defaults:{
            userId:userId,
            lesson: 0,
            quizz: 0,
            finalInterview: 0
          }
        })

        const boughtTests = await Tests.findAll({
          where: {
            [sequelize.Op.or]: [{ courseId: group.assignCourseId }, { courseId: null }],
          },
        });
        
        await Promise.all(
          boughtTests.map(async (test) => {
            await UserTests.findOrCreate({
              where: {
                testId: test.id,
                userId,
                courseId: test.courseId,
                language: test.language,
                type: 'Group',
              },
              defaults: {
                testId: test.id,
                userId,
              },
            });
          }),
        );
      }),
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const SingleUserStstic = async (req, res) => {
  try {
    const { id, userId } = req.query;

    const UserInfo = await UserCourses.findOne({
      where: { GroupCourseId: id, UserId: userId },
      include: { model: Users, attributes: ['firstName', 'lastName', 'image'] },
    });

    if (!UserInfo) return res.status(404).json({ success: false, message: 'Invalid id or userId' });

    return res.status(200).json({ success: true, UserInfo });
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
    const {language} = req.query
    const Group = await Groups.findOne({
      where: {
        id,
      },
      include: [{
        model: UserCourses,
      }]    });

    if (!Group)
    return res.json({
        success: false,
        message: `Group with ID ${id} not defined`,
      });

      let status = 1 
      const {title:courseName} = await CoursesContents.findOne({where:{courseId:Group.assignCourseId,language}})

    Group.UserCourses.map((e) => {
      if(e.totalPoints>40){
        status = 2
      } else if(e.totalPoints>90){
        status = 3
      }
        Certificates.create({
          userId: e.UserId,
          courseName,
          status,
          giveDate:new Date().toISOString()
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
    let group = await Groups.findAll({
      attributes: ['id', ['name_en','name'],'assignCourseId'],
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
        },
      ],
    });

    group = await Promise.all(
      group.map(async (grp) => {
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
          where: { groupId: grp.id },
          include: {
            model: Users,
            where: { role: { [Op.in]: ['TEACHER', 'STUDENT'] } },
          },
          required: true,
        });

        return {
          ...grp.dataValues,
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
    const { id } = req.params;

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

    const users = await Users.findAll({
      include: [
        {
          model: GroupsPerUsers,
          where: { groupId: id },
          required: false,
        },
      ],
      where: {
        role: {
          [sequelize.Op.or]: ['STUDENT', 'TEACHER'],
        },
      },
      attributes: ['id', 'firstName', 'lastName', 'role'],
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

    await GroupsPerUsers.destroy({
      where: {
        groupId,
        userId,
      },
    });

    await UserCourses.destroy({
      where: {
        GroupCourseId: groupId,
        UserId: userId,
      },
    });

    // Delete entries from UserLesson based on GroupCourseId and UserId
    await UserLesson.destroy({
      where: {
        GroupCourseId: groupId,
        UserId: userId,
      },
    });
    await UserPoints.destroy({
      where:{
        userId
      }
    })
    await UserTests.destroy({
      where: {
        userId: userId,
        courseId: {
          [sequelize.Op.or]: [groupId, null],
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = {
  CreateGroup,
  findOne,
  findAll,
  update,
  addMember,
  SingleUserStstic,
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
};
