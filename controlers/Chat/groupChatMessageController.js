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
        io.to(`room_${chatId}`).emit("new-groupChatMessage", {message: text});
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
            ]
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
        await GroupChatMessages.update(
            {text: text, isUpdated: true},
            {where: {id: messageId}}
        );
        io.to(`room_${chatId}`).emit("new-groupChatMessage", {message: text});
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
        io.to(`room_${chatId}`).emit("new-groupChatMessage");
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