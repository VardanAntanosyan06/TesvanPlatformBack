const { ChatMessages, Chats, Users } = require('../../models');
const { Op } = require('sequelize');
const { userSockets } = require("../../userSockets");

const createChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { senderId, text } = req.body;
        const io = req.io;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{secondId:userId}, {firstId:userId}] 
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        await ChatMessages.create({ chatId, senderId, text })
        const messages = await ChatMessages.findAll({
            where: {
                chatId: chatId,
            },
            attributes:["text","isUpdated"],
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
        });
        console.log()
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        let socketSendId
        if (userId == chat.firstId) {
            socketSendId = chat.secondId
        } else {
            socketSendId = chat.firstId
        }
        const userSocket = await userSockets.get(socketSendId)
        if (userSocket) { io.to(userSocket.id).emit('chatMessage', messages) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getChatMessages = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const {quantity} = req.query;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{secondId:userId}, {firstId:userId}] 
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        const messages = await ChatMessages.findAll({
            where: {
                chatId: chat.id,
            },
            attributes:["text","isUpdated"],
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
            offset: quantity-20

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
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{secondId:userId}, {firstId:userId}] 
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const updateMessage = await ChatMessages.findOne({
            where: {id: messageId}
        })
        updateMessage.text = text;
        updateMessage.isUpdated = true;
        await updateMessage.save()
        const messages = await ChatMessages.findAll({
            where: {
                chatId: chatId,
            },
            attributes:["text","isUpdated"],
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        let socketSendId
        if (userId == chat.firstId) {
            socketSendId = chat.secondId
        } else {
            socketSendId = chat.firstId
        }
        const userSocket = await userSockets.get(socketSendId)
        if (userSocket) { io.to(userSocket.id).emit('chatMessage', messages) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteChatMessage = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId, messageId } = req.params;
        const chat = await Chats.findOne({
            where: {
                id: chatId,
                [Op.or]: [{secondId:userId}, {firstId:userId}] 
            },
        });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        await ChatMessages.destroy({
            where: { id: messageId }
        });
        const messages = await ChatMessages.findAll({
            where: {
                chatId: chatId,
            },
            attributes:["text","isUpdated"],
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        let socketSendId
        if (userId == chat.firstId) {
            socketSendId = chat.secondId
        } else {
            socketSendId = chat.firstId
        }
        const userSocket = await userSockets.get(socketSendId)
        if (userSocket) { io.to(userSocket.id).emit('chatMessage', messages) };
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

module.exports = {
    createChatMessage,
    getChatMessages,
    updateChatMessage,
    deleteChatMessage
};