const { userSockets } = require("../../userSockets") // Assuming you have a Map for user sockets

const users = [] // group chat typing users
const typing = (io, socket) => {
    socket.on('typing', (data) => {
        if (data.groupChatId) {
            users.push(data.userName)
            socket.to(`room_${data.groupChatId}`).emit('typing', users)
            function typingOff() {
                const index = users.indexOf(data.userName);
                users.splice(index, 1);
                socket.to(`room_${data.groupChatId}`).emit('stopTyping', users)
            }
            setTimeout(typingOff, 2500)
        }

        if (data.receiverId) {
            const userSocket = userSockets.get(+data.receiverId)
            io.to(userSocket.id).emit('typing', data.userName)
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
            users.splice(index, 1);
            socket.to(`room_${data.groupChatId}`).emit('stopTyping', users)
        }
        if (data.receiverId) {
            const userSocket = userSockets.get(+data.receiverId)
            io.to(userSocket.id).emit('stopTyping')
        }
    })
}
module.exports = {
    typing,
    stopTyping
}