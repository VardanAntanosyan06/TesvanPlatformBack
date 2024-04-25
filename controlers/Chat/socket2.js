const app = require('../../app')

app.get("/", (req, res) => {
    var io = req.io
    console.log(io);


    io.on("connection", (socket) => {
        try {
            const token = socket?.handshake?.query?.token;
            if (token) {
                jwt.verify(token, process.env.SECRET, (err, decoded) => {
                    if (err) {
                        console.error("Token verification error:", err);
                        socket.disconnect();
                    } else {
                        const userId = decoded.user_id;
                        userSockets.set(userId, socket.id);
                        console.log("====================================");
                        console.log(userId, "Contected");
                        console.log("====================================");
                    }
                });
            } else {
                socket.disconnect();
            }
        } catch (e) {
            console.error("Socket connection error:", e);
            socket.disconnect();
        }

        socket.on("subscribe", (roomId) => {
            socket.join(`room_${roomId}`)
        })

        socket.on("unsubsc ribe", (roomId) => {
            socket.leave(`room_${roomId}`)
        })

        socket.on("chatMessage", ({ userId, message, roomId }) => {
            console.log(2, "gdhdddddddddddddddddddddddddd");
            if (userId) {
                const userSocket = userSockets.get(userId);
                if (userSocket) {
                    io.to(userSocket).emit("new-chatMessage", message);
                    console.log(7, "------------------------------------------------------------")
                }
            };
            if (roomId) {
                io.in(dataroomId).emit("new-chatMessage", message);
            };
        })

        socket.on("disconnect", () => {
            const userId = getUserIdForSocket(socket);
            userId && userSockets.delete(userId);
        });
    });

    function getUserIdForSocket(socket) {
        for (const [userId, userSocket] of userSockets.entries()) {
            if (userSocket === socket) {
                return userId;
            }
        }
        return null;
    }
})();