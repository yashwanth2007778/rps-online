// ✅ Connect to Render backend
const socket = io("https://rps-online-1.onrender.com");

// ✅ Connection successful
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  document.getElementById("status").innerText =
    "Connected to server ✅";
});

let gameId = "";
let playerName = "";

// 👤 Set player name
function setName() {
  playerName = document.getElementById("nameInput").value;

  if (!playerName) {
    alert("Please enter your name");
    return;
  }

  alert("Name set: " + playerName);
}

// 🎮 Create game
function createGame() {
  socket.emit("createGame");
}

// 🔗 Join existing game
function joinGame() {
  gameId = document.getElementById("gameIdInput").value;

  if (!gameId) {
    alert("Enter Game ID");
    return;
  }

  socket.emit("joinGame", gameId);
}

// 🎯 Send move
function sendMove(move) {
  if (!gameId) {
    alert("Create or join a game first");
    return;
  }

  socket.emit("move", { gameId, move });
}

// ✅ Game created
socket.on("gameCreated", (id) => {
  gameId = id;

  // Send player name
  socket.emit("setName", {
    gameId,
    name: playerName
  });

  document.getElementById("status").innerText =
    "Game Created! ID: " + id;
});

// ✅ Game started
socket.on("startGame", () => {
  socket.emit("setName", {
    gameId,
    name: playerName
  });

  document.getElementById("game").style.display = "block";

  document.getElementById("status").innerText =
    "Game Started 🎮";
});

// 🎉 Show result
socket.on("result", (data) => {
  document.getElementById("status").innerText =
    `${data.names.p1} (${data.m1}) vs ${data.names.p2} (${data.m2})
→ ${data.result}`;

  document.getElementById("score").innerText =
    `Score → ${data.names.p1}: ${data.scores.p1} | ${data.names.p2}: ${data.scores.p2}`;
});

// ❌ Error messages
socket.on("errorMsg", (msg) => {
  alert(msg);
});

// ❌ Socket disconnected
socket.on("disconnect", () => {
  document.getElementById("status").innerText =
    "Disconnected from server ❌";
});