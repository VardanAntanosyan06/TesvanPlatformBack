const { GroupChatMessages, GroupChats, Users, GroupChatReads, sequelize } = require('../../models');
const { Op, where } = require('sequelize');
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const {getMessageNotifications} = require('./chatMessageController')

const createGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { text } = req.body;
        const image = req.files?.image;
        const file = req.files?.file;
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

        let imageName
        let fileName
        if (image) {
            const type = image.mimetype.split("/")[1];
            imageName = uuid.v4() + "." + type;
            image.mv(path.resolve(__dirname, "../../", "messageFiles", imageName), (err) => {
                if (err) {
                    console.error("Failed to move image:", err.message);
                } else {
                    console.log("Image successfully saved");
                }
            });
        } else if (file) {
            const type = file.mimetype.split("/")[1];
            fileName = uuid.v4() + "." + type;
            file.mv(path.resolve(__dirname, "../../", "messageFiles", fileName), (err) => {
                if (err) {
                    console.error("Failed to move file:", err.message);
                } else {
                    console.log("File successfully saved");
                }
            });
        }

        const { id } = await GroupChatMessages.create({
            groupChatId: chatId,
            senderId: userId,
            text,
            image: imageName ? imageName : null,
            file: fileName ? fileName : null
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
        // const notification = await getMessageNotifications(userId)
        // io.to(`room_${chatId}`).emit('groupChatNotification', notification.groupChatNotification)
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
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: (page - 1) * limit
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        return res.status(200).json(messages)
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
        const { file, image } = await GroupChatMessages.findOne({
            where: { id: messageId }
        })
        if (file) {
            const fileName = file.split("/").pop()
            fs.unlinkSync(path.resolve(__dirname, "../../", "messageFiles", fileName), (err) => {
                console.log(err.message);
            })
        }
        if (image) {
            const imageName = image.split("/").pop()
            fs.unlinkSync(path.resolve(__dirname, "../../", "messageFiles", imageName), (err) => {
                console.log(err.message);
            })
        }


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

const readGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;

        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            },
            include: {
                module: GroupChatMessages,
                as: "messages",
                where: {
                    id: messageId
                },
                required: true
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat or message not found' });

        const read = await GroupChatReads.findOne({
            where: {
                userId,
                groupChatId: chatId
            }
        })
        
        if (!read) {
            await GroupChatReads.create({
                userId,
                groupChatId: chatId,
                lastSeen: messageId
            })
            return res.status(200).json({ success: true });
            
        } else if (read.lastSeen < messageId) {
            read.lastSeen = messageId
            await read.save() 
            return res.status(200).json({ success: true });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const seenGroupChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        const users = await Users.findAll({
            include: {
                model: GroupChatReads,
                where: {
                    lastSeen: { [Op.gte]: messageId }
                }
            },
            attributes: ["id", "firstName", "lastName", "image"],
        })
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

module.exports = {
    createGroupChatMessage,
    replyGroupChatMessage,
    updateGroupChatMessage,
    deleteGroupChatMessage,
    getGroupChatMessages,
    readGroupChatMessage,
    seenGroupChatMessage
};