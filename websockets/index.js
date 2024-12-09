const { createLobby } = require("./lobby");
const lobby = createLobby();

const { createUtil } = require("./util");
const util = createUtil();

const { createGameEngine } = require("./gameEngine");
const gameEngine = createGameEngine();

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.APP_PORT || 8181;

httpServer.listen(PORT, () => {
  console.log(`listening on localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log(`client ${socket.id} has connected`);

  socket.on("login", (user) => {
    socket.data.user = user;
    if (user && user.id) {
      socket.join("user_" + user.id);
      socket.join("lobby");
    }
  });

  socket.on("logout", (user) => {
    if (user && user.id) {
      socket.leave("user_" + user.id);
      lobby.leaveLobby(socket.id);
      io.to("lobby").emit("lobbyChanged", lobby.getGames());
      socket.leave("lobby");
      util.getRoomGamesPlaying(socket).forEach(([roomName, room]) => {
        socket.leave(roomName);
        if (!gameEngine.gameEnded(room.game)) {
          room.game.status = "interrupted";
          room.game.gameStatus = 3;
          io.to(roomName).emit("gameInterrupted", room.game);
        }
      });
    }
    socket.data.user = undefined;
  });

  socket.on("echo", (message) => {
    socket.emit("echo", message);
  });

  // ------------------------------------------------------
  // Lobby
  // ------------------------------------------------------

  socket.on("fetchGames", (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const games = lobby.getGames();
    console.log("Games fetched:", games);
    if (callback) {
      callback(games);
    }
  });

  socket.on("addGame", (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const game = lobby.addGame(socket.data.user, socket.id);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback(game);
    }
  });

  socket.on("joinGame", (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const game = lobby.getGame(id);
    if (socket.data.user.id == game.player1.id) {
      if (callback) {
        callback({
          errorCode: 3,
          errorMessage: "User cannot join a game that he created!",
        });
      }
      return;
    }
    game.player2 = socket.data.user;
    game.player2SocketId = socket.id;
    lobby.removeGame(id);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback(game);
    }
  });

  socket.on("removeGame", (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const game = lobby.getGame(id);
    if (socket.data.user.id != game.player1.id) {
      if (callback) {
        callback({
          errorCode: 4,
          errorMessage: "User cannot remove a game that he has not created!",
        });
      }
      return;
    }
    lobby.removeGame(game.id);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback(game);
    }
  });
});
