const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = new Map();

app.use(express.static("public"));

app.get("/users", (req, res) => {
res.json(Array.from(users.values()));
});

io.on("connection", (socket) => {
console.log("User connected:", socket.id);

socket.on("register", (username) => {
users.set(socket.id, { id: socket.id, username });
socket.emit("registration-success");
console.log("User registered:", socket.id, username);
});

socket.on("start-call", () => {
socket.broadcast.emit("start-call");
});

socket.on("offer", (userId, offer) => {
socket.to(userId).emit("offer", socket.id, offer);
});

socket.on("answer", (userId, answer) => {
socket.to(userId).emit("answer", socket.id, answer);
});

socket.on("ice-candidate", (userId, candidate) => {
socket.to(userId).emit("ice-candidate", socket.id, candidate);
});

socket.on("disconnect", () => {
users.delete(socket.id);
console.log("User disconnected:", socket.id);
});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
console.log("Server is running on port ${PORT}");
});
