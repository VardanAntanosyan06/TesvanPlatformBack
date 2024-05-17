const { userSockets } = require("../../userSockets") // Assuming you have a Map for user sockets

const typing = (io, socket) => {
    socket.on('typing', (data) => {
        if (data.groupChatId) {
            socket.to(`room_${data.groupChatId}`).emit('typing')
            function typingOff() {
                socket.to(`room_${data.groupChatId}`).emit('stopTyping')
            }
            setTimeout(typingOff, 2500)
        }

        if (data.userId) {
            const userSocket = userSockets.get(data.userId)
            io.to(userSocket.id).emit('typing')
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
            socket.to(`room_${data.groupChatId}`).emit('stopTyping')
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