const { GroupChatMessages, GroupChats, Users, GroupChatReads, sequelize } = require('../../models');
const { Op, Sequelize, where } = require('sequelize');
const uuid = require("uuid");
const path = require("path");

const createGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { text } = req.body;
        const image = req.files?.image;
        const file = req.files?.file;
        const io = req.io;
        const getFilePath = "api/v2/chatMessage/getMessageFile/"

        let imageName
        let fileName
        if (image) {
            const type = image.mimetype.split("/")[1];
            imageName = uuid.v4() + "." + type;
            image.mv(path.resolve(__dirname, "../../", "static", imageName));
        } else if (file) {
            const type = file.mimetype.split("/")[1];
            fileName = uuid.v4() + "." + type;
            file.mv(path.resolve(__dirname, "../../", "messageFiles", fileName));
        }

        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        const { id } = await GroupChatMessages.create({
            groupChatId: chatId,
            senderId: userId,
            text,
            image: imageName ? imageName : null,
            file: fileName ? getFilePath + fileName : null
        })
        const messages = await GroupChatMessages.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        io.to(`room_${chatId}`).emit("createGroupChatMessage", messages);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const replyGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId, messageId } = req.params;
        const { text } = req.body;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        const { id } = await GroupChatMessages.create({ groupChatId: chatId, senderId: userId, text, isReply: messageId })
        const message = await GroupChatMessages.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: GroupChatMessages,
                    as: "Reply",
                    include: [
                        {
                            model: Users,
                            attributes: ["id", "firstName", "lastName", "image"],
                        },
                    ],
                }
            ],
        });
        io.to(`room_${chatId}`).emit("replyGroupChatMessage", message);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const getGroupChatMessages = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { limit, page } = req.query;

        if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
            return res.status(400).json({ message: 'Invalid limit or page number' });
        }

        const chat = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        // const Users = await Users.findAll()
        const messages = await GroupChatMessages.findAll({
            where: {
                groupChatId: chatId,
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: GroupChatMessages,
                    as: "Reply",
                    include: [
                        {
                            model: Users,
                            attributes: ["id", "firstName", "lastName", "image"],
                        },
                    ],
                },
                {
                    model: GroupChats,
                    as: "isReads",
                    // include: [
                    //     {
                    //         model: Users,
                    //         through: {
                    //             model: GroupChatReads,
                    //             where: {
                    //                 lastSeen: { [Op.gte]: GroupChatMessages.id }
                    //             }
                    //         },
                    //         attributes: ["id", "firstName", "lastName", "image"],
                    //     }
                    // ],
                    attributes: {
                        include: [['id', 'groupChatId']],
                        exclude: ['id', 'name', 'image', 'groupId', 'adminId', 'members']
                    },
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: (page - 1) * limit
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        // messages.forEach(async (element) => {
            
        // });
        
        return res.status(200).json( Users)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    };
};

const updateGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;
        const { text } = req.body;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        const message = await GroupChatMessages.findOne({
            where: { id: messageId },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: GroupChatMessages,
                    as: "Reply",
                    include: [
                        {
                            model: Users,
                            attributes: ["id", "firstName", "lastName", "image"],
                        },
                    ],
                }
            ],
        })
        message.text = text;
        message.isUpdated = true
        await message.save();
        if (!message) return res.status(404).json({ message: 'Message not found' });
        io.to(`room_${chatId}`).emit("updateGroupChatMessage", message);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        const deleteMessage = await GroupChatMessages.destroy({
            where: { id: messageId }
        });
        if (deleteMessage === 0) return res.status(404).json({ message: "Message not found" })
        io.to(`room_${chatId}`).emit("deleteGroupChatMessage", messageId);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const readGroupChatMessage = async () => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;
        const read = await GroupChatReads.findOne({
            where: {
                userId,
                chatId
            }
        })
        if (read?.lastSeen < messageId) {
            read.lastSeen = messageId
            await read.save()
        }
        await GroupChatReads.create({
            userId,
            chatId,
            lastSeen: messageId
        })
    } catch (error) {
        onsole.log(error);
        return res.status(500).json(error.message)
    }
}

module.exports = {
    createGroupChatMessage,
    replyGroupChatMessage,
    updateGroupChatMessage,
    deleteGroupChatMessage,
    getGroupChatMessages,
    readGroupChatMessage
};