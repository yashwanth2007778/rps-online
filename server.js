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

app.use(express.static("public"));

// Store games
const games = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🎮 Create game
  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substring(2, 8);

    games[gameId] = {
      players: [socket.id],
      moves: {},
      names: {},
      scores: {
        p1: 0,
        p2: 0
      }
    };

    socket.join(gameId);

    socket.emit("gameCreated", gameId);

    console.log("Game created:", gameId);
  });

  // 🔗 Join game
  socket.on("joinGame", (gameId) => {
    const game = games[gameId];

    if (!game) {
      socket.emit("errorMsg", "Game not found");
      return;
    }

    if (game.players.length >= 2) {
      socket.emit("errorMsg", "Game full");
      return;
    }

    game.players.push(socket.id);

    socket.join(gameId);

    io.to(gameId).emit("startGame");

    console.log("Player joined:", gameId);
  });

  // 👤 Set player name
  socket.on("setName", ({ gameId, name }) => {
    const game = games[gameId];

    if (!game) return;

    if (socket.id === game.players[0]) {
      game.names.p1 = name;
    } else {
      game.names.p2 = name;
    }
  });

  // 🎯 Player move
  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId];

    if (!game) return;

    game.moves[socket.id] = move;

    // Wait for both players
    if (Object.keys(game.moves).length < 2) return;

    const p1 = game.players[0];
    const p2 = game.players[1];

    const m1 = game.moves[p1];
    const m2 = game.moves[p2];

    let result = "Draw";

    if (
      (m1 === "rock" && m2 === "scissors") ||
      (m1 === "paper" && m2 === "rock") ||
      (m1 === "scissors" && m2 === "paper")
    ) {
      result = `${game.names.p1} Wins`;

      game.scores.p1++;
    } else if (m1 !== m2) {
      result = `${game.names.p2} Wins`;

      game.scores.p2++;
    }

    io.to(gameId).emit("result", {
      m1,
      m2,
      result,
      names: game.names,
      scores: game.scores
    });

    // Reset moves
    game.moves = {};
  });

  // ❌ Disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});