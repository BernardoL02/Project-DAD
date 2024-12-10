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

  socket.on("createLobby", (board, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const game = lobby.createLobby(socket.data.user, socket.id, board);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback(game);
    }
  });

  socket.on("joinlobby", (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const game = lobby.getGame(id);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    if (!game.players) {
      game.players = [game.player1];
    }

    if (game.players.length >= game.maxPlayers) {
      return callback({ errorCode: 8, errorMessage: "Lobby is full!" });
    }

    if (game.players.some((player) => player.id === socket.data.user.id)) {
      return callback({
        errorCode: 9,
        errorMessage: "You have already joined this lobby!",
      });
    }

    const playerCopy = { ...socket.data.user, ready: false };
    game.players.push(playerCopy);

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback(game);
    }
  });

  socket.on("setReady", ({ gameId, playerId }, callback) => {
    const game = lobby.setReady(gameId, playerId);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    console.log("Emitting updated game state to all clients:", game);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback(game);
  });

  socket.on("leaveLobby", (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const games = lobby.leaveLobby(gameId, socket.data.user.id);
    io.to("lobby").emit("lobbyChanged", games);
    callback(games);
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

  socket.on("startGame", (id, callback) => {
    const game = lobby.getGame(id);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    // Verifica se há pelo menos dois jogadores no lobby
    if (game.players.length < 2) {
      return callback({
        errorCode: 6,
        errorMessage: "Need at least two players to start the game!",
      });
    }

    // Verifica se todos os jogadores, exceto o player1, estão prontos
    const allReady = game.players.slice(1).every((player) => player.ready);

    if (!allReady) {
      return callback({
        errorCode: 7,
        errorMessage: "Not all players are ready!",
      });
    }

    // Define o status do jogo como 'started'
    game.status = "started";

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback(game);
  });
});
