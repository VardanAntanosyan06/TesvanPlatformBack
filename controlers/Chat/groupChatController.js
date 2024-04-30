const { GroupChats } = require("../../models");
const { Op } = require('sequelize');
const { userSockets } = require("../../userSockets");

const createGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { receiverId, name } = req.body;
        await GroupChats.create({
            adminId: userId,
            name: name,
            members: [userId, ...receiverId]
        });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const groupChat = await GroupChats.findOne({
            where: {
                id: groupChatId,
                members: {
                    [Op.contains]: [userId]
                },
            },
            attributes: ["id", "name"]
        })
        const userSocket = await userSockets.get(userId);
        if (userSocket) { userSocket.join(`room_${groupChatId}`) }
        return res.status(200).json(groupChat)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const getGroupChats = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const groupChats = await GroupChats.findAll({
            where: {
                members: {
                    [Op.contains]: [userId]
                }
            },
            attributes: ["id", "name"]
        })
        return res.status(200).json(groupChats)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const updateNameGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const { name } = req.body;
        const groupChats = await GroupChats.findOne({
            where: {
                id: groupChatId,
                adminId: userId,
            }
        })
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        await GroupChats.update(
            { name },
            { where: { id: groupChatId } }
        )
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}

const addMemberGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const { receiverId } = req.body;
        const groupChats = await GroupChats.findOne({
            where: {
                id: groupChatId,
                adminId: userId,
            }
        })
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        await GroupChats.update(
            { members: [...groupChats.members, ...receiverId] },
            { where: { id: groupChatId } }
        )
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteMemberGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const { receiverId } = req.body;
        const groupChat = await GroupChats.findOne({
            where: {
                id: groupChatId,
                adminId: userId,
            }
        })
        if (!groupChat) return res.status(404).json({ message: 'Chat not found' });
        const index = groupChat.members.indexOf(+receiverId);
        const newMembers = groupChat.members.splice(index, 1);
        await GroupChats.update(
            { members: [...groupChat.members] },
            { where: { id: groupChatId } }
        )
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

const deleteGroupChat = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const groupChats = await GroupChats.findOne({
            where: {
                id: groupChatId,
                adminId: userId,
            }
        })
        if (!groupChats) return res.status(404).json({ message: 'Chat not found' });
        await GroupChats.destroy({
            where: { id: groupChatId }
        })
        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};

module.exports = {
    createGroupChat,
    getGroupChat,
    getGroupChats,
    updateNameGroupChat,
    addMemberGroupChat,
    deleteMemberGroupChat,
    deleteGroupChat
}
