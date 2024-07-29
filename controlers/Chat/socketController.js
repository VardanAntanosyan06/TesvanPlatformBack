const { userSockets } = require("../../userSockets") // Assuming you have a Map for user sockets


const typing = (io, socket) => {
    socket.on('typing', (data) => {
        console.log('typing', data);
        if (data.receiverId) {
            const userSocket = userSockets.get(+data.receiverId)
            if (userSocket) {
                io.to(userSocket.id).emit('typing', data.userName)
            }
        }
    })
}
const stopTyping = (io, socket) => {
    socket.on('stopTyping', (data) => {
        console.log('stopTyping', data);
        if (data.receiverId) {
            const userSocket = userSockets.get(+data.receiverId)
            if (userSocket) {
                io.to(userSocket.id).emit('stopTyping')
            }
        }
    })
}

const users = [] // group chat typing users
const typingGroup = (io, socket) => {
    socket.on('typingGroup', (data) => {
        console.log('typingGroup',data);
        if (data.groupChatId) {
            users.push(data.userName)
            socket.to(`room_${data.groupChatId}`).emit('typingGroup', users)
        }
    })
}

const stopTypingGroup = (io, socket) => {

    socket.on('stopTypingGroup', (data) => {
        console.log('stopTypingGroup', data);
        if (data.groupChatId) {
            const index = users.indexOf(data.userName);
            users.splice(index, 1);
            socket.to(`room_${data.groupChatId}`).emit('stopTypingGroup', users)
        }
    })
}

const { getMessageNotifications } = require("../Chat/chatMessageController")
const notifications = (io, socket) => {
    socket.on("getNotifications", (data) => {
        console.log(data);
        if (data.userId) {
            const userSocket = userSockets.get(+data.userId)
            if (userSocket) {
                io.to(userSocket.id).emit('chatNotifications', getMessageNotifications(data.userId).chatNotification)
                io.to(userSocket.id).emit('groupChatNotifications', getMessageNotifications(data.userId).groupChatNotification)
            }

        }
    })
}
module.exports = {
    typing,
    stopTyping,
    typingGroup,
    stopTypingGroup,
    notifications
}