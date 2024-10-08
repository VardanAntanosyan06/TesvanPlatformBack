const { GroupChats, Users, Chats } = require("../../models");
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
            attributes: ["id", "name", "image", "members", "adminId"]
        })
        const members = await Users.findAll({
            where: { id: groupChat.members },
            attributes: ["id", "firstName", "lastName", "image", "role"]
        })
        members.forEach((element) => {
            const onlineUser = userSockets.get(element.id)
            if (onlineUser) {
                element.setDataValue("online", true)
            } else {
                element.setDataValue("online", false)
            }
        })
        groupChat.setDataValue('members', members);
        const userSocket = await userSockets.get(userId);
        if (userSocket) {
            userSocket.join(`room_${groupChatId}`)
            userSocket.userRooms = [...userSocket.userRooms, ...[`room_${groupChatId}`]]
            userSocket.userRooms = [...new Set(userSocket.userRooms)]
        }
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
            attributes: ["id", "name", "members", "adminId"]
        })
        const userSocket = await userSockets.get(userId);
        if (userSocket) {
            groupChats.map((chat) => {
                userSocket.join(`room_${chat.id}`)
            })
        }
        return res.status(200).json(groupChats)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
};
const getGroupChatMembers = async (req, res) => {
    try {
        const { user_id: userId } = req.user;
        const { groupChatId } = req.params;
        const groupChat = await GroupChats.findAll({
            where: {
                id: groupChatId,
                members: {
                    [Op.contains]: [userId]
                }
            },
            attributes: ["members"]
        })
        const members = await Users.findAll({
            where: groupChat.members,
            attributes: ["id", "firstName", "lastName", "image", "role"]
        })
        return res.status(200).json(members)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}
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
        const newMembers = [...receiverId, ...groupChats.members]
        const uniqueUsers = [...new Set(newMembers)];
        const users = await Users.findAll({
            where: {
                id: [...receiverId],
            },
            attributes: ['id']
        });
        if (users.length !== receiverId.length) {
            return res.status(400).json({ message: "An error has occurred. The user you specified may not be found" })
        }
        await GroupChats.update(
            { members: [...uniqueUsers] },
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
        const Users = new Set(groupChat.members)
        let notFound = 0;
        receiverId.forEach(user => {
            if (!Users.has(user)) {
                notFound++
            }
            Users.delete(user)
        })
        await GroupChats.update(
            { members: [...Users] },
            { where: { id: groupChatId } }
        )
        if (notFound) {
            return res.status(200).json({ success: true, message: `${notFound} users not found` });
        }
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

const getGroupChatsForAdmin = async (req, res) => {
    try {
        const groupChats = await GroupChats.findAll()

        const members = groupChats.reduce((members, chat) => {
            return members = [...members, ...chat.members]
        }, []);

        const allGroupChatMembers = await Users.findAll({
            where: { id: members },
            attributes: ["id", "firstName", "lastName", "image", "role"]
        })
        return res.status(200).json({
            success: true,
            allGroupChatMembers
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
}
module.exports = {
    getGroupChat,
    getGroupChats,
    createGroupChat,
    updateNameGroupChat,
    addMemberGroupChat,
    deleteMemberGroupChat,
    deleteGroupChat,
    getGroupChatMembers,
    getGroupChatsForAdmin
}
