const { ChatMessages, Chats, Users, GroupChatMessages, GroupChatReads, GroupChats } = require('../../models');
const { Op, Sequelize, where } = require('sequelize');
const { userSockets } = require("../../userSockets");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs")

const createChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { text } = req.body;
        const image = req.files?.image;
        const file = req.files?.file;
        const io = req.io;

        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

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

        const { id } = await ChatMessages.create({
            chatId,
            senderId: userId,
            text,
            image: imageName ? imageName : null,
            file: fileName ? fileName : null
        })
        const message = await ChatMessages.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"]
                }
            ],
        });
        const firstIdSocket = await userSockets.get(chat.firstId)
        if (firstIdSocket) { io.to(firstIdSocket.id).emit('createChatMessage', message) };
        const secondSocket = await userSockets.get(chat.secondId)
        if (secondSocket) { io.to(secondSocket.id).emit('createChatMessage', message) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

// const createChatFile = async (req, res) => {
//     try {
//         const { user_id: userId } = req.user;
//         const { text } = req.body;
//         const { chatId } = req.params;
//         const { file } = req.files;
//         const type = file.mimetype.split("/")[1];
//         const fileName = uuid.v4() + "." + type;
//         file.mv(path.resolve(__dirname, "../../", "static", fileName));

//         const chat = await Chats.findOne({
//             where: {
//                 id: chatId,
//                 [Op.or]: [{ secondId: userId }, { firstId: userId }]
//             },
//         });
//         if (!chat) return res.status(404).json({ message: 'Chat not found' });
//         const { id } = await ChatMessages.create({ chatId, senderId: userId, text, image: fileName })
//         const message = await ChatMessages.findOne({
//             where: {
//                 id
//             },
//             include: [
//                 {
//                     model: Users,
//                     attributes: ["id", "firstName", "lastName", "image"],
//                 }
//             ],
//         });
//         const firstIdSocket = await userSockets.get(chat.firstId)
//         if (firstIdSocket) { io.to(firstIdSocket.id).emit('createChatMessage', message) };
//         const secondSocket = await userSockets.get(chat.secondId)
//         if (secondSocket) { io.to(secondSocket.id).emit('createChatMessage', message) };
//         return res.status(200).json({ success: true });
//         // return res.json({ url: fileName });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(error.message)
//     }
// }

const replyChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId, messageId } = req.params;
        const { text } = req.body;
        const io = req.io;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        const { id } = await ChatMessages.create({ chatId, senderId: userId, text, isReply: messageId })
        const message = await ChatMessages.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: ChatMessages,
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
        const firstIdSocket = await userSockets.get(chat.firstId)
        if (firstIdSocket) { io.to(firstIdSocket.id).emit('replyChatMessage', message) };
        const secondSocket = await userSockets.get(chat.secondId)
        if (secondSocket) { io.to(secondSocket.id).emit('replyChatMessage', message) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const getChatMessages = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { limit, page } = req.query;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        const messages = await ChatMessages.findAll({
            where: {
                chatId: chat.id,
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: ChatMessages,
                    as: "Reply",
                    include: [
                        {
                            model: Users,
                            attributes: ["id", "firstName", "lastName", "image"],
                        },
                    ],
                }
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

const updateChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId, messageId } = req.params;
        const { text } = req.body;
        const io = req.io;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const message = await ChatMessages.findOne({
            where: { id: messageId },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                },
                {
                    model: ChatMessages,
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
        message.isUpdated = true;
        await message.save()
        const firstIdSocket = await userSockets.get(chat.firstId)
        if (firstIdSocket) { io.to(firstIdSocket.id).emit('updateChatMessage', message) };
        const secondSocket = await userSockets.get(chat.secondId)
        if (secondSocket) { io.to(secondSocket.id).emit('updateChatMessage', message) };
        return res.status(200).json({ success: true, message });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId, messageId } = req.params;
        const io = req.io;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const { file, image } = await ChatMessages.findOne({
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

        const deleteMessage = await ChatMessages.destroy({
            where: { id: messageId }
        });
        if (deleteMessage === 0) return res.status(404).json({ message: "Message not found" })
        const firstSocket = await userSockets.get(chat.firstId)
        if (firstSocket) { io.to(firstSocket.id).emit('deleteChatMessage', messageId) };
        const secondSocket = await userSockets.get(chat.secondId)
        if (secondSocket) { io.to(secondSocket.id).emit('deleteChatMessage', messageId) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getMessageFile = (req, res) => {
    try {
        const { fileName } = req.params;
        const options = {
            root: path.join(__dirname, "../../", "messageFiles")
        };
        res.sendFile(fileName, options);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const getMessageNotifications = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const chats = await Chats.findAll({
            where: {
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
            include: [
                {
                    model: Users,
                    as: "firstIds",
                    attributes: ["id", "firstName", "lastName", "image"],
                    where: {
                        id: { [Op.ne]: userId }
                    },
                    required: false
                },
                {
                    model: Users,
                    as: "secondIds",
                    attributes: ["id", "firstName", "lastName", "image"],
                    where: {
                        id: { [Op.ne]: userId }
                    },
                    required: false
                },
                {
                    model: ChatMessages,
                    where: {
                        isRead: false
                    },
                    attributes: ["id", "text"],
                    order: [['createdAt', 'DESC']],
                }
            ],
            attributes: ["id", "firstId", "secondId"]
        })

        const chatNotification = chats.map(chat => {
            const chatData = chat.toJSON();
            chatData.notification = chatData.ChatMessages.length
            chatData.lastMessage = chatData.ChatMessages[0]
            delete chatData.ChatMessages
            if (chatData.secondId === userId) {
                chatData.receiver = chatData.firstIds;
                delete chatData.firstIds;
                delete chatData.secondIds;
            } else {
                chatData.receiver = chatData.secondIds;
                delete chatData.secondIds;
                delete chatData.firstIds;
            }
            return chatData;
        });
        const groupChatNotification = await GroupChats.findAll({
            where: {
                members: {
                    [Op.contains]: [userId]
                },
            },
            include: {
                model: GroupChatReads,
                as: "userLastSeen",
                where: { userId },
                attributes: ["lastSeen"],
                required: false
            },
            attributes: ["id", "name", "image"]
        })
        for (let element of groupChatNotification) {
            const results = await GroupChatMessages.findAll({
                where: {
                    groupChatId: element.id,
                    id: { [Op.gt]: element.userLastSeen ? element.userLastSeen.lastSeen : 0 }
                },
                order: [['createdAt', 'DESC']],
                attributes: ["id", "text"]
            })
            element.setDataValue('notification', results.length);
            element.setDataValue('lastMessage', results[0]);
        }
        return res.status(200).json({ chatNotification, groupChatNotification });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const readChatMessage = async () => {
    try {
        const { user_id: userId } = req.user;
        const { messageId, chatId } = req.params;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{ secondId: userId }, { firstId: userId }]
            },
        });
        const message = await ChatMessages.findOne({
            where: {
                id: messageId,
            }
        })
        read.isReade = true
        await read.save()
        const firstSocket = await userSockets.get(chat.firstId)
        if (firstSocket) { io.to(firstSocket.id).emit('readChatMessage', message) };
        const secondSocket = await userSockets.get(chat.secondId)
        if (secondSocket) { io.to(secondSocket.id).emit('readChatMessage', message) };
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

module.exports = {
    createChatMessage,
    replyChatMessage,
    getChatMessages,
    updateChatMessage,
    deleteChatMessage,
    getMessageFile,
    readChatMessage,
    getMessageNotifications
};