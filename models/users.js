'use strict';
const { Model } = require('sequelize');
const groups = require('./groups');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Chats, { foreignKey: "firstId", as: "firstIds",onDelete: 'CASCADE' })
      Users.hasMany(models.Chats, { foreignKey: "secondId", as: "secondIds",onDelete: 'CASCADE' })
      Users.hasMany(models.ChatMessages, { foreignKey: "senderId",onDelete: 'CASCADE' })
      Users.hasMany(models.GroupChatMessages, { foreignKey: "senderId",onDelete: 'CASCADE' })
      Users.hasOne(models.GroupChatReads, {foreignKey: "userId",onDelete: 'CASCADE'})
    }
  }
  Users.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: 'Incorrect email format.',
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [['Male', 'Female', 'Other']],
            msg: "gender must be 'Male', 'Female', 'Other'",
          },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      englishLevel: {
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        validate: {
          isIn: {
            args: [['A1', 'A2', 'B1', 'B2', 'C1', 'C2']],
            msg: "English Level must be 'A1','A2','B1','B2','C1'or 'C2'",
          },
        },
      },
      education: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      backgroundInQA: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [['TEACHER', 'STUDENT']],
            msg: "Role must be 'TEACHER' or 'STUDENT'",
          },
        },
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tokenCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      likedCourses: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
    },

    {
      sequelize,
      modelName: 'Users',
    },
  );

  const userLikes = sequelize.define('UserLikes');
  Users.hasMany(userLikes, {
    foreignKey: 'id',
    onDelete: 'CASCADE',
  });

  const GroupCourses = sequelize.define('GroupCourses');
  Users.belongsToMany(GroupCourses, { through: 'UserCourses', as: 'courses', onDelete: 'CASCADE' });

  //
  // const UserCourses = sequelize.define("UserCourses");
  // Users.hasMany(UserCourses);
  //

  const Lessons = sequelize.define('Lessons');
  Users.belongsToMany(Lessons, { through: 'UserLesson', onDelete: 'CASCADE' });

  const Homework = sequelize.define('Homework');
  Users.belongsToMany(Homework, { through: 'UserHomework', onDelete: 'CASCADE' });

  const Message = sequelize.define('Message');
  Users.hasMany(Message, { onDelete: 'CASCADE' });

  const UserCourses = sequelize.define('UserCourses');
  const Groups = sequelize.define('Groups');
  Users.hasMany(UserCourses, { onDelete: 'CASCADE' });

  Users.belongsToMany(Groups, {
    through: 'GroupsPerUsers',
    foreignKey: 'userId',
    otherKey: 'groupId',
    as: 'groups',
    onDelete: 'CASCADE',
  });

  const UserInterview = sequelize.define('UserInterview');
  Users.hasMany(UserInterview, {
    foreignKey: "userId"
  });

  const UserHomework = sequelize.define('UserHomework');
  Users.hasMany(UserHomework);

  const GroupsPerUsers = sequelize.define('GroupsPerUsers');
  Users.hasMany(GroupsPerUsers, { onDelete: 'CASCADE', foreignKey: 'userId' });
  return Users;
};
