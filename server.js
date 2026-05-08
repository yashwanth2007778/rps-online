const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get("/", (req, res) => {
  res.send("RPS Backend Running 🚀");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("createGame", () => {
    console.log("Create game clicked");
  });

  socket.on("joinGame", (gameId) => {
    console.log("Join game:", gameId);
  });

  socket.on("move", (data) => {
    console.log("Move received:", data);
  });

  socket.on("setName", (data) => {
    console.log("Name set:", data);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});