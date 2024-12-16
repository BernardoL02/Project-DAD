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

  socket.on("logout", async (user) => {
    if (user && user.id) {
      for (const game of lobby.getGames()) {
        if (game.status === "started") {
          const callback = () => {};
          if (util.checkAuthenticatedUser(socket, callback)) {
            const currentGame = lobby.getGame(game.id);

            if (currentGame) {
              const previousOwner = currentGame.player1;
              const previousOwnerSocketId = currentGame.player1SocketId;

              const updatedGame = lobby.playerInativo(game.id, user.id);

              const activePlayers = updatedGame.players.filter(
                (p) => !p.inactive
              );

              if (previousOwner.id === user.id && activePlayers.length > 0) {
                const newOwner = activePlayers[0];
                updatedGame.player1 = newOwner;
                updatedGame.player1SocketId = newOwner.socketId;

                await new Promise((resolve) => {
                  io.to(previousOwnerSocketId).emit("ownerChanged", {
                    message: `You have been removed as the lobby owner. Ownership transferred to ${newOwner.nickname}.`,
                    updatedGame,
                  });
                  setTimeout(resolve, 500);
                });
              }

              callback();

              if (activePlayers.length === 1) {
                gameEngine.stopTurnTimer(updatedGame.id);
                updatedGame.status = "ended";
                const winner = activePlayers[0];

                io.to(winner.socketId).emit("gameCancelled", {
                  message: "Your opponent left the game. You win by default!",
                  gameId: game.id,
                  updatedGame,
                  winner,
                });

                lobby.deleteGame(game.id);
                io.to("lobby").emit("lobbyChanged", lobby.getGames());
                callback({
                  success: true,
                  message: "Game ended as the opponent left.",
                });
              } else {
                io.to(activePlayers.map((p) => p.socketId)).emit("playerLeft", {
                  message: `${user.nickname} left the game.`,
                  updatedGame,
                });
                callback({
                  success: true,
                  message: "You left the game successfully!",
                });
              }
            }
          }
        } else if (game.status === "waiting") {
          lobby.leave(game.id, user.id);
        }
      }

      io.to("lobby").emit("lobbyChanged", lobby.getGames());
      socket.leave("lobby");
      socket.leave("user_" + user.id);
      socket.data.user = undefined;
    }
  });

  socket.on("updateSocketId", (userId) => {
    if (!userId) return;

    lobby.getGames().forEach((game) => {
      game.players.forEach((player) => {
        if (player.id === userId) {
          player.socketId = socket.id;
        }
      });

      if (game.player1.id === userId) {
        game.player1SocketId = socket.id;
      }
    });
  });

  socket.on("updateSocketIdInGame", (userId, gameId) => {
    const game = lobby.getGame(gameId);
    if (game) {
      game.players.forEach((player) => {
        if (player.id === userId) {
          player.socketId = socket.id;
        }
      });
    }
  });

  socket.on("fetchGame", (gameId, callback) => {
    const gameIdInt = parseInt(gameId, 10);

    if (isNaN(gameIdInt)) {
      return callback({ error: "Invalid game ID" });
    }

    const game = lobby.getGame(gameIdInt);

    if (game) {
      if (game.turnStartTime) {
        const TURN_DURATION = 20000;
        const elapsedTime = Date.now() - game.turnStartTime;
        game.remainingTime = Math.max(
          Math.ceil((TURN_DURATION - elapsedTime) / 1000),
          0
        );
      } else {
        game.remainingTime = 20;
      }

      callback(game);
    } else {
      callback({ error: "Game not found" });
    }
  });

  socket.on("privateMessage", (clientMessageObj, callback) => {
    const destinationRoomName = "user_" + clientMessageObj?.destinationUser?.id;
    if (io.sockets.adapter.rooms.get(destinationRoomName)) {
      const payload = {
        user: socket.data.user,
        message: clientMessageObj.message,
      };
      io.to(destinationRoomName).emit("privateMessage", payload);
      if (callback) {
        callback({ success: true });
      }
    } else {
      if (callback) {
        callback({
          errorCode: 1,
          errorMessage: `User "${clientMessageObj?.destinationUser?.name}" is not online!`,
        });
      }
    }
  });

  // ------------------------------------------------------
  // Lobby
  // ------------------------------------------------------

  socket.on("fetchGames", (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const games = lobby.getGames();
    if (callback) {
      callback({ games, serverTime: Date.now() });
    }
  });

  socket.on("createLobby", (idGame, rows, cols, currentBalance, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    socket.data.user.brain_coins_balance = currentBalance;

    const userWithSocketId = { ...socket.data.user, socketId: socket.id };

    if (userWithSocketId.brain_coins_balance < 5) {
      return callback({
        errorCode: 11,
        errorMessage: "Insufficient balance to create a lobby.",
      });
    }

    const game = lobby.createLobby(
      userWithSocketId,
      socket.id,
      idGame,
      rows,
      cols
    );

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback({ game, serverTime: Date.now() });
    }
  });

  socket.on("joinlobby", (id, currentBalance, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    socket.data.user.brain_coins_balance = currentBalance;

    const user = socket.data.user;

    if (user.brain_coins_balance < 5) {
      return callback({
        errorCode: 11,
        errorMessage: "Insufficient balance to join the lobby.",
      });
    }

    const game = lobby.getGame(id);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    if (game.status !== "waiting") {
      return callback({
        errorCode: 7,
        errorMessage: "Lobby is not open for joining.",
      });
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

    const playerCopy = {
      ...socket.data.user,
      ready: false,
      socketId: socket.id,
    };
    game.players.push(playerCopy);

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    if (callback) {
      callback({ game, serverTime: Date.now() });
    }
  });

  socket.on("setReady", ({ gameId, playerId }, callback) => {
    const game = lobby.setReady(gameId, playerId);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback(game);
  });

  socket.on("leaveLobby", (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const {
      games: updatedGames,
      previousOwnerId,
      game,
    } = lobby.leave(gameId, socket.data.user.id);

    io.to("lobby").emit("lobbyChanged", updatedGames);
    callback({ ...game, previousOwnerId, serverTime: Date.now() });
  });

  socket.on("removePlayer", ({ gameId, playerId }, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const game = lobby.getGame(gameId);

    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    if (socket.data.user.id !== game.player1.id) {
      return callback({
        errorCode: 10,
        errorMessage: "Only the lobby owner can remove players!",
      });
    }

    game.players = game.players.filter((player) => player.id !== playerId);

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback({ success: true, message: "Player removed successfully!" });
  });

  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  function generateRandomBoard(rows, cols) {
    let totalCards = rows * cols;
    if (totalCards % 2 !== 0) totalCards -= 1;

    const cardImages = [
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
      "c7",
      "c11",
      "c12",
      "c13",
      "e1",
      "e2",
      "e3",
      "e4",
      "e5",
      "e6",
      "e7",
      "e11",
      "e12",
      "e13",
      "o1",
      "o2",
      "o3",
      "o4",
      "o5",
      "o6",
      "o7",
      "o11",
      "o12",
      "o13",
      "p1",
      "p2",
      "p3",
      "p4",
      "p5",
      "p6",
      "p7",
      "p11",
      "p12",
      "p13",
    ];

    const selectedCards = cardImages
      .sort(() => 0.5 - Math.random())
      .slice(0, totalCards / 2);
    const cardPairs = [...selectedCards, ...selectedCards].sort(
      () => 0.5 - Math.random()
    );

    return cardPairs.map((id) => ({ id, flipped: false }));
  }

  socket.on("startGame", (gameId, callback) => {
    let game = lobby.getGame(gameId);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    const generatedBoard = generateRandomBoard(game.rows, game.cols);

    game = lobby.setGameBoard(gameId, generatedBoard);
    if (!game) {
      return callback({
        errorCode: 6,
        errorMessage: "Failed to set game board!",
      });
    }

    game.expires_at = null;
    game = gameEngine.initGame(game);
    game.status = "started";

    game.players.forEach((player) => {
      if (player.socketId) {
        io.to(player.socketId).emit("gameStarted", game);
      }
    });

    gameEngine.startTurnTimer(game, io, lobby);

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback(game);
  });

  socket.on("flipCard", ({ gameId, index }, callback) => {
    const game = lobby.getGame(gameId);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    const result = gameEngine.flipCard(game, index, socket.id, io, lobby);
    if (result.errorCode) {
      return callback(result);
    }

    if (game.status !== "ended") {
      game.players.forEach((player) => {
        io.to(player.socketId).emit("gameUpdated", game);
      });
    }

    callback(game);
  });

  socket.on("leaveAllLobbies", (userId, callback) => {
    if (!userId) {
      return callback({ errorCode: 1, errorMessage: "User ID is missing" });
    }

    lobby.leaveAllLobbies(userId);
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback({ success: true });
  });

  socket.on("leaveGame", async (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const currentGame = lobby.getGame(gameId);

    if (!currentGame) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    const previousOwner = currentGame.player1;
    const previousOwnerSocketId = currentGame.player1SocketId;

    const updatedGame = lobby.playerInativo(gameId, socket.data.user.id);

    const activePlayers = updatedGame.players.filter((p) => !p.inactive);

    if (previousOwner.id === socket.data.user.id && activePlayers.length > 0) {
      const newOwner = activePlayers[0];
      updatedGame.player1 = newOwner;
      updatedGame.player1SocketId = newOwner.socketId;

      await new Promise((resolve) => {
        io.to(previousOwnerSocketId).emit("ownerChanged", {
          message: `You have been removed as the lobby owner. Ownership transferred to ${newOwner.nickname}.`,
          updatedGame,
        });
        setTimeout(resolve, 500);
      });
    }

    if (activePlayers.length === 1) {
      gameEngine.stopTurnTimer(updatedGame.id);

      updatedGame.status = "ended";
      const winner = activePlayers[0];

      io.to(winner.socketId).emit("gameCancelled", {
        message: "Your opponent left the game. You win by default!",
        gameId: gameId,
        updatedGame,
        winner,
      });

      lobby.deleteGame(gameId);
      io.to("lobby").emit("lobbyChanged", lobby.getGames());
      return callback({
        success: true,
        message: "Game ended as the opponent left.",
      });
    }

    io.to(activePlayers.map((p) => p.socketId)).emit("playerLeft", {
      message: `${socket.data.user.nickname} left the game.`,
      updatedGame,
    });

    callback({ success: true, message: "You left the game successfully!" });
  });
});
