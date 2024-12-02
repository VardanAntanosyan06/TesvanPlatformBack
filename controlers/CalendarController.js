const { Calendar, Groups, Users, GroupsPerUsers, UserInterview, UserCourses, GroupCourses, CoursesContents } = require('../models');
const { Op, where } = require('sequelize');

const create = async (req, res) => {
  try {
    const { user_id } = req.user;
    let { title, start, end, description, format, link, type, userId, groupId } = req.body;

    // const teacher = Users.findOne({
    //   where: {
    //     cretorId: user_id,
    //     role: "TEACHER"
    //   }
    // });

    // if (teacher) {
    //   userId.push(teacher.cretorId);
    // };

    // userId.push(user_id);
    let calendar = await Calendar.create({
      title,
      start,
      end,
      description,
      format,
      link,
      type,
      userId,
      groupId,
    });

    if (type === 'finalInterview') {
      await Promise.all(
        userId.map(async (id) => {
          try {
            await UserInterview.create({
              userId: id,
              type,
              points: 0,
              calendarId: calendar.id,
              courseId: groupId,
            });
          } catch (error) {
            console.log(`Error creating user interview for user ID ${id}:`, error);
            // Handle the error as needed
          }
        }),
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id: userId } = req.user;
    const task = await Calendar.findOne({
      where: { id, userId: { [Op.contains]: [userId] } },
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "You don't have task width id " + id,
      });
    }
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findByDay = async (req, res) => {
  try {
    const day = new Date();
    const { user_id: userId } = req.user;
    const { startOfDay, endOfDay } = req.query;
    // const startOfDay = new Date(
    //   Date.UTC(
    //     day.getUTCFullYear(),
    //     day.getUTCMonth(),
    //     day.getUTCDate(),
    //     0,
    //     0,
    //     0,
    //     0
    //   )
    // );
    // const endOfDay = new Date(
    //   Date.UTC(
    //     day.getUTCFullYear(),
    //     day.getUTCMonth(),
    //     day.getUTCDate(),
    //     23,
    //     59,
    //     59,
    //     999
    //   )
    // );
    const task = await Calendar.findAll({
      where: {
        start: { [Op.between]: [startOfDay, endOfDay] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (task.length < 0) {
      return res.status(404).json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findByYear = async (req, res) => {
  try {
    const day = new Date();
    const { user_id: userId } = req.user;
    const { startOfYear, endOfYear } = req.query;

    // const startOfYear = new Date(
    //   Date.UTC(day.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
    // );
    // const endOfYear = new Date(
    //   Date.UTC(day.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
    // );

    const tasks = await Calendar.findAll({
      where: {
        start: { [Op.between]: [startOfYear, endOfYear] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (tasks.length < 0) {
      return res.status(404).json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findByMonth = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { startOfMonth, endOfMonth } = req.query;

    // const day = new Date();
    // const startOfMonth = new Date(
    //   Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1, 0, 0, 0, 0)
    // );
    // const endOfMonth = new Date(
    //   Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    // );
    console.log(userId);
    const tasks = await Calendar.findAll({
      where: {
        start: { [Op.between]: [startOfMonth, endOfMonth] },
        userId: { [Op.contains]: [userId] },
      },
    });
    console.log(tasks);
    if (tasks.length < 0) {
      return res.status(404).json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findByWeek = async (req, res) => {
  try {
    const day = new Date();
    const { user_id: userId } = req.user;
    const { startOfWeek, endOfWeek } = req.query;

    // const startOfYear = new Date(
    //   Date.UTC(day.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
    // );
    // const endOfYear = new Date(
    //   Date.UTC(day.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
    // );

    const tasks = await Calendar.findAll({
      where: {
        start: { [Op.between]: [startOfWeek, endOfWeek] },
        userId: { [Op.contains]: [userId] },
      },
    });
    if (tasks.length < 0) {
      return res.status(404).json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const findAll = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const task = await Calendar.findAll({
      where: { userId: { [Op.contains]: [userId] } },
    });
    if (task.length < 0) {
      return res.status(404).json({ success: false, message: "You don't have any tasks" });
    }
    return res.status(200).json({ task });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.body;

    const updateFields = {};
    const fields = ['title', 'start', 'end', 'description', 'format', 'link', 'type'];

    fields.forEach((field) => {
      if (req.body[field] !== null && req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const [updatedRows] = await Calendar.update(updateFields, {
      where: { id },
    });

    if (updatedRows > 0) {
      return res.status(200).json({ success: true, message: 'Record updated successfully.' });
    } else {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    let calendar = await Calendar.findOne({ where: { id } });

    if (calendar.type == 'finalInterview') {
      await UserInterview.destroy({ where: { calendarId: id } });
    }
    const status = await Calendar.destroy({
      where: { id },
    });
    if (status == 0) {
      return res.status(404).json({ success: false, message: 'task not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUsers = async (req, res) => {
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

    let Group = await Groups.findAll({
      where: {
        creatorId: [userId, creatorId, ...teacherIds]
      },
      include: [
        {
          attributes: ['id'],
          model: GroupsPerUsers,
          include: {
            model: Users,
            attributes: ['id', 'firstName', 'lastName'],
          },
          required: true,
        },
      ],
      attributes: ['id', [`name_${language}`, 'name']],
    });

    Group = await Promise.all(
      Group.map(async (grp) => {
        console.log(grp);
        const a = await Promise.all(
          grp.GroupsPerUsers.map(async (e) => {
            let user = e.toJSON();
            delete user.dataValues;
            user.id = user.User?.id;
            user.firstName = user.User?.firstName;
            user.lastName = user.User?.lastName;
            user.image = user.User?.image;
            user.role = user.User?.role;
            delete user.User;
            return user;
          }),
        );

        return {
          ...grp.dataValues,
          GroupsPerUsers: a,
        };
      }),
    );
    return res.json(Group);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const getUsersForTeacher = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { language } = req.query;

    let groups = await UserCourses.findAll({
      where: { UserId: userId },
      attributes: ['id', ['UserId', 'userId']],
      include: [
        {
          model: GroupCourses,
          include: [
            {
              model: CoursesContents,
              where: { language },
              attributes: ['title', 'description', 'level', 'courseType'],
            },
            {
              model: Groups,
              include: [
                {
                  model: Users,
                  attributes: ['id', 'firstName', 'lastName'],
                },
              ],
              attributes: ['id', [`name_${language}`, 'name']],
            },
          ],
        },
      ],
    });

    groups = groups.reduce((aggr, value) => {
      const groupPars = value.GroupCourse.Groups[0].toJSON()
      const group = { ...groupPars, GroupsPerUsers: [...groupPars.Users] };
      delete group.Users
      aggr.push(group);
      return aggr
    }, []);

    return res.send(groups)
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
}

module.exports = {
  create,
  findOne,
  findByDay,
  findByMonth,
  findByWeek,
  findByYear,
  findAll,
  getUsers,
  remove,
  update,
};
