const { Chats, Users } = require("../../models");
const { Op, Model } = require('sequelize');


const createChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { receiverId } = req.body;
        const Chat = await Chats.findOne({
            where: {
                [Op.or]: [
                    { [Op.and]: [{ firstId: userId }, { secondId: receiverId }] },
                    { [Op.and]: [{ firstId: receiverId }, { secondId: userId }] }
                ]
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'firstIds'
                },
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'secondIds'
                }
            ]
        })
        if (Chat) {
            if (Chat.firstId === userId) {
                Chat.setDataValue('receiver', Chat.dataValues.secondIds);
                delete Chat.dataValues.firstIds;
                delete Chat.dataValues.secondIds;
                await Chat.save()
            } else {
                Chat.setDataValue('receiver', Chat.dataValues.firstIds);
                delete Chat.dataValues.secondIds;
                delete Chat.dataValues.firstIds;
                await Chat.save()
            }
            return res.status(200).json(Chat);
        } else {
            const { id } = await Chats.create({ firstId: userId, secondId: receiverId });
            const Chat = await Chats.findOne({
                where: {
                    id
                },
                include: [
                    {
                        model: Users,
                        attributes: ["id", "firstName", "lastName", "image"],
                        as: 'firstIds'
                    },
                    {
                        model: Users,
                        attributes: ["id", "firstName", "lastName", "image"],
                        as: 'secondIds'
                    }
                ]
            })

            if (Chat.firstId === userId) {
                Chat.setDataValue('receiver', Chat.dataValues.secondIds);
                delete Chat.dataValues.firstIds;
                delete Chat.dataValues.secondIds;
                await Chat.save()
            } else {
                Chat.setDataValue('receiver', Chat.dataValues.firstIds);
                delete Chat.dataValues.secondIds;
                delete Chat.dataValues.firstIds;
                await Chat.save()
            }
            return res.status(200).json(Chat);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'firstIds'
                },
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'secondIds'
                }
            ]
        })
        if (!chat)
            return res.status(400).json({ message: "Chat not found" })
        else
            return res.status(200).json(chat)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getChats = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const chats = await Chats.findAll({
            where: {
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'firstIds'
                },
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                    as: 'secondIds'
                }
            ]
        });
        return res.status(200).json(chats)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            }
        })
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        const deleteChat = await Chats.destroy({
            where: { id: chatId }
        })
        if (deleteChat === 0) return res.status(404).json({ message: 'Message not found' });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getAdminChats = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { language } = req.query;

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

        let courses = await GroupCourses.findAll({
            where: {
                creatorId: teacherIds
            },
            include: [
                {
                    model: Users,
                    as: 'courses',
                    attributes: ["id", "firstName", "lastName", "image", "role"]
                }
            ]
        });

        // const members = courses.reduce((aggr, value) => {
        //     aggr = [...aggr, ...value.courses]
        //     return aggr
        // }, []);

        courses = courses.reduce((aggr, value) => {
            value.toJson()
            value.members = value.courses;
            delete value.courses
            return [...aggr, value]
        }, []);

        return res.status(200).json(courses)

    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

module.exports = {
    createChat,
    getChat,
    getChats,
    deleteChat
}