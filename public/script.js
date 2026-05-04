const socket = io();

let gameId = "";
let playerName = "";

// 👤 Set name
function setName() {
  playerName = document.getElementById("nameInput").value;
  alert("Name set: " + playerName);
}

// 🎮 Create game
function createGame() {
  socket.emit("createGame");
}

// 🎮 Join game
function joinGame() {
  gameId = document.getElementById("gameIdInput").value;
  socket.emit("joinGame", gameId);
}

// 🎯 Send move
function sendMove(move) {
  socket.emit("move", { gameId, move });
}

// ✅ When game created
socket.on("gameCreated", (id) => {
  gameId = id;

  // 🔥 Send name to server
  socket.emit("setName", { gameId, name: playerName });

  document.getElementById("status").innerText = "Game ID: " + id;
});

// ✅ When game starts
socket.on("startGame", () => {
  socket.emit("setName", { gameId, name: playerName });

  document.getElementById("game").style.display = "block";
  document.getElementById("status").innerText = "Game Started!";
});

// 🎉 Show result with names
socket.on("result", (data) => {
  document.getElementById("status").innerText =
    `${data.names.p1} (${data.m1}) vs ${data.names.p2} (${data.m2})
→ ${data.result}`;

  document.getElementById("score").innerText =
    `Score → ${data.names.p1}: ${data.scores.p1} | ${data.names.p2}: ${data.scores.p2}`;
});

// ❌ Error message
socket.on("errorMsg", (msg) => {
  alert(msg);
});