const {GroupChatMessages, GroupChats, Users} = require('../../models');
const { Op } = require('sequelize');

const createGroupChatMessage = async (req, res)=> {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
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
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        await GroupChatMessages.create({ groupChatId: chatId, senderId: userId, text })
        const messages = await GroupChatMessages.findAll({
            where: {
                groupChatId: chatId,
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 1,
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        io.to(`room_${chatId}`).emit("groupChatMessages", messages);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getGroupChatMessages = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const {from, to} = req.query;
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
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: to,
            offset: from
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        return res.status(200).json(messages)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    };
};

const updateGroupChatMessage = async (req, res)=> {
    try {
        const { user_id: userId } = req.user;
        const {messageId, chatId} = req.params;
        const {text} = req.body;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        const message = await GroupChatMessages.findOne({
            where: {id: messageId}
        })
        message.text = text;
        message.isUpdated = true
        await message.save();
        const messages = await GroupChatMessages.findAll({
            where: {
                groupChatId: chatId,
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 1,
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        io.to(`room_${chatId}`).emit("groupChatMessages", messages);
        return res.status(200).json({ success: true });
    } catch(error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteGroupChatMessage = async (req, res)=> {
    try {
        const { user_id: userId } = req.user;
        const {messageId, chatId} = req.params;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                members: {
                    [Op.contains]: [userId]
                }
            }
        });
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        await GroupChatMessages.destroy({
            where: {id: messageId}
        });
        const messages = await GroupChatMessages.findAll({
            where: {
                groupChatId: chatId,
            },
            include: [
                {
                    model: Users,
                    attributes: ["id", "firstName", "lastName", "image"],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 1,
        });
        if (!messages) return res.status(404).json({ message: 'Message not found' });
        io.to(`room_${chatId}`).emit("groupChatMessages", messages);
        return res.status(200).json({ success: true });
    } catch(error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

module.exports = {
    createGroupChatMessage,
    updateGroupChatMessage,
    deleteGroupChatMessage,
    getGroupChatMessages
};