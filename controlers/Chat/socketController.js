const { userSockets } = require("../../userSockets") // Assuming you have a Map for user sockets


const typing = (io, socket) => {
    socket.on('typing', (data) => {
        console.log('typing', data);
        if (data.receiverId) {
            const userSocket = userSockets.get(+data.receiverId)
            if (userSocket) {
                io.to(userSocket.id).emit('typing', data.userName)
                function typingOff() {
                    io.to(userSocket.id).emit('stopTyping')
                }
                setTimeout(typingOff, 3500)
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
        console.log('typingGroup', data);
        if (data.groupChatId) {
            users.push(data.userName)
            socket.to(`room_${data.groupChatId}`).emit('typingGroup', users)
            function typingOff() {
                const index = users.indexOf(data.userName);
                users.splice(index, 1);
                socket.to(`room_${data.groupChatId}`).emit('stopTypingGroup', users)
            }
            setTimeout(typingOff, 3500)
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

const online = (io, socket) => {
    socket.on('online', (data) => {
        const userSocket = userSockets.get(data.userId);
        if (userSocket) {
            data.groupChats.map((groupChatId) => {
                userSocket.join(`room_${groupChatId}`)
                userSocket.userRooms = [...userSocket.userRooms, ...[`room_${groupChatId}`]]
                userSocket.userRooms = [...new Set(userSocket.userRooms)]
                socket.to(`room_${groupChatId}`).emit('online', { userId: data.userId })
            })
        }
    });
}
module.exports = {
    typing,
    stopTyping,
    typingGroup,
    stopTypingGroup,
    notifications,
    online
}