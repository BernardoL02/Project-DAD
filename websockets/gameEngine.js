exports.createGameEngine = (lobby) => {
  const initGame = (gameFromDB) => {
    gameFromDB.gameStatus = null;
    gameFromDB.currentPlayerIndex = 0;
    gameFromDB.matchedPairs = [];
    gameFromDB.selectedCards = [];
    gameFromDB.isLocked = false;
    gameFromDB.startTime = null;
    gameFromDB.turnStartTime = null;
    gameFromDB.totalMoves = 0;
    gameFromDB.serverTime = null;
    gameFromDB.endMatch = null;
    gameFromDB.bestPlayer = null;

    if (Array.isArray(gameFromDB.board)) {
      gameFromDB.board = gameFromDB.board.map((card) => ({
        ...card,
        flipped: false,
      }));
    }

    return gameFromDB;
  };

  const timers = new Map();

  const startTurnTimer = (game, io, lobby) => {
    stopTurnTimer(game.id);

    const TURN_DURATION = 20000;
    game.turnStartTime = Date.now();

    const timer = setTimeout(() => {
      const currentPlayer = game.players[game.currentPlayerIndex];

      const updatedGame = lobby.playerInativo(game.id, currentPlayer.id);

      io.to(currentPlayer.socketId).emit("gameCancelled", {
        message: "You were removed for inactivity.",
        gameId: game.id,
      });

      const activePlayers = updatedGame.players.filter((p) => !p.inactive);

      const previousOwnerSocketId = updatedGame.player1SocketId;

      if (updatedGame.player1.id === currentPlayer.id) {
        if (activePlayers.length > 0) {
          updatedGame.player1 = activePlayers[0];
          updatedGame.player1SocketId = activePlayers[0].socketId;

          io.to(previousOwnerSocketId).emit("ownerChanged", {
            message: `You have been removed as the lobby owner. Ownership transferred to ${activePlayers[0].nickname}.`,
            updatedGame,
          });

          setTimeout(() => {
            proceedAfterOwnerChange(
              updatedGame,
              activePlayers,
              io,
              lobby,
              TURN_DURATION
            );
          }, 1000);
        }
      } else {
        proceedAfterOwnerChange(
          updatedGame,
          activePlayers,
          io,
          lobby,
          TURN_DURATION
        );
      }
    }, TURN_DURATION);

    timers.set(game.id, timer);

    game.serverTime = Date.now();

    io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", {
      ...game,
      remainingTime: TURN_DURATION / 1000,
      serverTime: game.serverTime,
      startTime: game.startTime,
    });
  };

  const proceedAfterOwnerChange = (
    updatedGame,
    activePlayers,
    io,
    lobby,
    TURN_DURATION
  ) => {
    if (activePlayers.length === 1) {
      updatedGame.status = "ended";
      const winner = activePlayers[0];

      io.to(winner.socketId).emit("gameCancelled", {
        message:
          "Your opponent was removed for inactivity. You win by default!",
        gameId: updatedGame.id,
        updatedGame,
        winner,
      });

      lobby.deleteGame(updatedGame.id);
      io.to("lobby").emit("lobbyChanged", lobby.getGames());

      return;
    }

    io.to(activePlayers.map((p) => p.socketId)).emit("playerLeft", {
      message: `${
        updatedGame.players[updatedGame.currentPlayerIndex].nickname
      } was removed for inactivity.`,
      updatedGame,
    });

    game.serverTime = Date.now();

    io.to(activePlayers.map((p) => p.socketId)).emit("gameUpdated", {
      ...updatedGame,
      remainingTime: TURN_DURATION / 1000,
    });

    startTurnTimer(updatedGame, io, lobby);
  };

  const stopTurnTimer = (gameId) => {
    if (timers.has(gameId)) {
      clearTimeout(timers.get(gameId));
      timers.delete(gameId);
    }
  };

  const flipCard = (game, index, playerSocketId, io, lobby) => {
    let currentPlayer = game.players[game.currentPlayerIndex];

    if (playerSocketId !== currentPlayer.socketId) {
      return {
        errorCode: 12,
        errorMessage: "Invalid play: It is not your turn!",
      };
    }

    if (game.isLocked) {
      return {
        errorCode: 14,
        errorMessage: "Please wait, the current turn is being processed.",
      };
    }

    if (
      game.selectedCards.includes(index) ||
      game.matchedPairs.includes(index)
    ) {
      return {
        errorCode: 13,
        errorMessage: "Invalid play: card already selected!",
      };
    }

    if (!game.startTime) {
      game.startTime = Date.now();
    }

    game.selectedCards.push(index);
    game.board[index].flipped = true;

    if (game.selectedCards.length === 2) {
      game.isLocked = true;
      stopTurnTimer(game.id);
      game.totalMoves += 1;
      currentPlayer.totalTurns = (currentPlayer.totalTurns || 0) + 1;

      const [firstIndex, secondIndex] = game.selectedCards;

      setTimeout(() => {
        if (game.board[firstIndex].id === game.board[secondIndex].id) {
          game.matchedPairs.push(firstIndex, secondIndex);
          currentPlayer.pairsFound = (currentPlayer.pairsFound || 0) + 1;

          if (
            !game.bestPlayer ||
            currentPlayer.pairsFound > game.bestPlayer.pairsFound
          ) {
            game.bestPlayer = currentPlayer;
          }
        } else {
          game.board[firstIndex].flipped = false;
          game.board[secondIndex].flipped = false;

          do {
            game.currentPlayerIndex =
              (game.currentPlayerIndex + 1) % game.players.length;
            currentPlayer = game.players[game.currentPlayerIndex];
          } while (currentPlayer.inactive);
        }

        game.selectedCards = [];
        game.isLocked = false;

        if (game.matchedPairs.length === game.board.length) {
          game.status = "ended";

          const winner = determineWinner(game.players, game.bestPlayer);

          game.endMatch = Date.now();

          io.to(game.players.map((p) => p.socketId)).emit("gameEnded", {
            message: `Game Over! ${winner.nickname} won the game!`,
            totalMoves: game.totalMoves,
            winner,
            updatedGame: game,
            pairsFoundByPlayers: game.players.map((player) => ({
              nickname: player.nickname,
              pairsFound: player.pairsFound || 0,
              totalTurns: player.totalTurns || 0,
            })),
          });

          lobby.deleteGame(game.id);
          io.to("lobby").emit("lobbyChanged", lobby.getGames());
        } else {
          game.serverTime = Date.now();
          io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", {
            ...game,
            remainingTime: 20,
            startTime: game.startTime,
            players: game.players,
          });
          startTurnTimer(game, io, lobby);
        }
      }, 1000);
    } else {
      game.serverTime = Date.now();
      io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", {
        ...game,
        startTime: game.startTime,
      });
    }

    return game;
  };

  const determineWinner = (players, bestPlayer) => {
    return bestPlayer || players[0];
  };

  return {
    initGame,
    flipCard,
    startTurnTimer,
    stopTurnTimer,
  };
};
