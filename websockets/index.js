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
      lobby.leaveAllLobbies(user.id);
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
      callback(games);
    }
  });

  socket.on("createLobby", (rows, cols, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const userWithSocketId = { ...socket.data.user, socketId: socket.id };
    const game = lobby.createLobby(userWithSocketId, socket.id, rows, cols);

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

    const playerCopy = {
      ...socket.data.user,
      ready: false,
      socketId: socket.id,
    };
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

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback(game);
  });

  socket.on("leaveLobby", (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const games = lobby.leave(gameId, socket.data.user.id);
    io.to("lobby").emit("lobbyChanged", games);
    callback(games);
  });

  socket.on("removePlayer", ({ gameId, playerId }, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const game = lobby.getGame(gameId);

    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    // Verifica se o usuário que está tentando remover é o dono do lobby
    if (socket.data.user.id !== game.player1.id) {
      return callback({
        errorCode: 10,
        errorMessage: "Only the lobby owner can remove players!",
      });
    }

    // Remove o jogador
    game.players = game.players.filter((player) => player.id !== playerId);

    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback({ success: true, message: "Player removed successfully!" });
  });

  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  // Função auxiliar para gerar o tabuleiro com cartas aleatórias
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

  // Evento de início do jogo
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

    game = gameEngine.initGame(game);
    game.status = "started";

    game.players.forEach((player) => {
      io.to(player.socketId).emit("gameStarted", game);
    });

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

  socket.on("leaveGame", (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const game = lobby.getGame(gameId);
    if (!game) {
      return callback({ errorCode: 5, errorMessage: "Game not found!" });
    }

    // Guarda o nome do jogador que está saindo
    const leavingPlayer = game.players.find(
      (player) => String(player.id) === String(socket.data.user.id)
    );

    const leavingPlayerName = leavingPlayer
      ? leavingPlayer.nickname
      : "Um jogador";

    // Remove o jogador do lobby
    lobby.leave(gameId, socket.data.user.id);

    // Verifica o número de jogadores restantes
    const updatedGame = lobby.getGame(gameId);

    if (!updatedGame || updatedGame.players.length < 2) {
      if (updatedGame) {
        // Notifica os jogadores restantes que o jogo foi cancelado
        updatedGame.players.forEach((player) => {
          io.to(player.socketId).emit("gameCancelled", {
            message:
              "O jogo foi cancelado porque apenas um jogador restou no lobby.",
            updatedGame,
          });
        });
      }

      // Deleta o jogo após notificar os jogadores
      lobby.deleteGame(gameId);
    } else {
      // Notifica os jogadores restantes que alguém saiu
      updatedGame.players.forEach((player) => {
        io.to(player.socketId).emit("playerLeft", {
          message: `${leavingPlayerName} saiu do lobby.`,
          updatedGame,
        });
      });
    }

    // Atualiza o lobby para todos os jogadores
    io.to("lobby").emit("lobbyChanged", lobby.getGames());
    callback({ success: true, message: "Você saiu do lobby com sucesso!" });
  });
});
