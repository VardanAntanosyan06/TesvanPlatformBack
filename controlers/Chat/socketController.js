const { userSockets } = require("../../userSockets") // Assuming you have a Map for user sockets

const users = [] // group chat typing users
const typing = (io, socket) => {
    socket.on('typing', (data) => {
        if (data.groupChatId) {
            users.push(data.userName)
            if (users.length > 2) {
                socket.to(`room_${data.groupChatId}`).emit('typing', { message: `${users.length} are typing...` })
            } else if (users.length == 2) {
                socket.to(`room_${data.groupChatId}`).emit('typing', { message: `${users[0]} and ${users[1]} are typing...` })
            } else {
                socket.to(`room_${data.groupChatId}`).emit('typing', { message: `${users[0]} is typing...` })
            }
            function typingOff() {
                const index = users.indexOf(data.userName);
                const typingUsers = users.splice(index, 1);
                if (typingUsers.length > 2) {
                    socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers.length} are typing...` })
                } else if (typingUsers.length == 2) {
                    socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers[0]} and ${typingUsers[1]} are typing...` })
                } else {
                    socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers[0]} is typing...` })
                }
            }
            setTimeout(typingOff, 2500)
        }

        if (data.userId) {
            const userSocket = userSockets.get(data.userId)
            io.to(userSocket.id).emit('typing', {message: "typing..."})
            function typingOff() {
                io.to(userSocket.id).emit('stopTyping')
            }
            setTimeout(typingOff, 2500)
        }
    })
}
const stopTyping = (io, socket) => {
    socket.on('stopTyping', (data) => {
        if (data.groupChatId) {
            const index = users.indexOf(data.userId);
            const typingUsers = users.splice(index, 1);
            if (typingUsers.length > 2) {
                socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers.length} are typing...` })
            } else if (typingUsers.length == 2) {
                socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers[0]} and ${typingUsers[1]} are typing...` })
            } else {
                socket.to(`room_${data.groupChatId}`).emit('stopTyping', { message: `${typingUsers[0]} is typing...` })
            }
        }

        if (data.userId) {
            const userSocket = userSockets.get(data.userId)
            io.to(userSocket.id).emit('stopTyping')
        }
    })
}
module.exports = {
    typing,
    stopTyping
}