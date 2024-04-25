const {ChatMessages, GroupChats} = require('../../models');

const createGroupChatMessage = async (req, res)=> {
    try {
        const { user_id: userId } = req.user;
        const { chatId } = req.params;
        const { senderId, text } = req.body;
        const io = req.io;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                userId: userId
            }
        });
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        await ChatMessages.create({ chatId, senderId, text })
        io.in(`room_${chatId}`).emit("new-chatMessage", {message: text});
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const updateGroupChatMessage = async (req, res)=> {
    try {
        const { user_id: userId } = req.user;
        const {messageId, chatId} = req.params;
        const {text} = req.body;
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                userId: userId
            }
        });
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        await ChatMessages.update(
            {text, isUpdated: true},
            {where: {id: messageId}}
        );
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
        const groupChats = await GroupChats.findOne({
            where: {
                id: chatId,
                userId: userId
            }
        });
        if (!groupChats) return res.status(404).json({message: 'Chat not found'});
        await ChatMessages.destroy({
            where: {id: messageId}
        });
        return res.status(200).json({ success: true });
    } catch(error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

module.exports = {
    createGroupChatMessage,
    updateGroupChatMessage,
    deleteGroupChatMessage
};