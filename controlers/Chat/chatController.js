const { Chats } = require("../../models");
const { Op } = require('sequelize');

const createChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { receiverId } = req.body;
        const Chat = await Chats.findOne({
            where: {
                members: {
                    [Op.and]: [
                        { [Op.contains]: [userId, receiverId] },
                    ]
                }
            }
        })
        if (Chat) return res.status(200).json(Chat);
        const newChat = await Chats.create({ members: [userId, receiverId] });
        return res.status(200).json(newChat);
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
                members: {
                    [Op.and]: [
                        { [Op.contains]: [userId] },
                    ]
                }
            }
        })
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
                members: {
                    [Op.contains]: [userId],
                }
            }
        })
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
                members: {
                    [Op.and]: [
                        { [Op.contains]: [userId] },
                    ]
                }
            }
        })
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        const deleteChat = await Chats.destroy({
            where: { id: chatId }
        })
        if(deleteChat === 0) return res.status(404).json({ message: 'Message not found' });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

module.exports = {
    createChat,
    getChat,
    getChats,
    deleteChat
}