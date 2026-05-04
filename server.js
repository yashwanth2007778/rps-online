const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let games = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
socket.on("setName", ({ gameId, name }) => {
  if (games[gameId]) {
    games[gameId].names[socket.id] = name;
  }
});
  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substr(2, 5);
   games[gameId] = {
  players: [socket.id],
  names: {},
  moves: {},
  scores: { p1: 0, p2: 0 }
};

    socket.join(gameId);
    socket.emit("gameCreated", gameId);
  });

  socket.on("joinGame", (gameId) => {
    if (games[gameId] && games[gameId].players.length < 2) {
      games[gameId].players.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit("startGame");
    } else {
      socket.emit("errorMsg", "Game full or not found");
    }
  });

  socket.on("move", ({ gameId, move }) => {
  games[gameId].moves[socket.id] = move;

  if (Object.keys(games[gameId].moves).length === 2) {
    const [p1, p2] = games[gameId].players;

    const m1 = games[gameId].moves[p1];
    const m2 = games[gameId].moves[p2];

    const result = getWinner(m1, m2);

    // 🎯 Update scores
    if (result === "Player 1 wins") {
      games[gameId].scores.p1++;
    } else if (result === "Player 2 wins") {
      games[gameId].scores.p2++;
    }

    const scores = games[gameId].scores; // ✅ FIX

    io.to(gameId).emit("result", {
      m1,
      m2,
      result,
      scores,
      names: {
        p1: games[gameId].names[p1] || "Player 1",
        p2: games[gameId].names[p2] || "Player 2"
      }
    });

    // 🔁 Reset moves
    games[gameId].moves = {};
  }
});
});


function getWinner(p1Move, p2Move) {
  if (p1Move === p2Move) return "Draw";

  if (
    (p1Move === "rock" && p2Move === "scissors") ||
    (p1Move === "paper" && p2Move === "rock") ||
    (p1Move === "scissors" && p2Move === "paper")
  ) return "Player 1 wins";

  return "Player 2 wins";
}
app.get("/", (req, res) => {
  res.send("RPS Server is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});