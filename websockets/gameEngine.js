exports.createGameEngine = (lobby) => {
  const initGame = (gameFromDB) => {
    gameFromDB.gameStatus = null;
    gameFromDB.currentPlayerIndex = 0;
    gameFromDB.matchedPairs = [];
    gameFromDB.selectedCards = [];
    gameFromDB.isLocked = false;
    gameFromDB.startTime = null;

    if (Array.isArray(gameFromDB.board)) {
      gameFromDB.board = gameFromDB.board.map((card) => ({
        ...card,
        flipped: false,
      }));
    } else {
      console.error("Invalid board format in initGame:", gameFromDB.board);
    }

    return gameFromDB;
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

    game.players.forEach((player) => {
      if (!player.pairsFound) player.pairsFound = 0;
    });
    if (!game.totalMoves) game.totalMoves = 0;

    if (game.selectedCards.length === 2) {
      game.isLocked = true; // Bloqueia novas jogadas durante a verificação

      const [firstIndex, secondIndex] = game.selectedCards;

      game.totalMoves += 1;

      setTimeout(() => {
        if (game.board[firstIndex].id === game.board[secondIndex].id) {
          // Jogador acertou o par
          game.matchedPairs.push(firstIndex, secondIndex);
          currentPlayer.pairsFound += 1;
        } else {
          // Jogador errou o par, vira as cartas de volta
          game.board[firstIndex].flipped = false;
          game.board[secondIndex].flipped = false;

          // Passa para o próximo jogador ativo apenas quando erra
          do {
            game.currentPlayerIndex =
              (game.currentPlayerIndex + 1) % game.players.length;
            currentPlayer = game.players[game.currentPlayerIndex];
          } while (currentPlayer.inactive);
        }

        game.selectedCards = [];
        game.isLocked = false; // Desbloqueia após a verificação

        // Verifica se o jogo terminou
        if (game.matchedPairs.length === game.board.length) {
          game.status = "ended";

          const pairsFoundByPlayers = game.players.map((player) => ({
            nickname: player.nickname,
            pairsFound: player.pairsFound,
          }));

          io.to(game.players.map((p) => p.socketId)).emit("gameEnded", {
            message: "Game Over! You completed the game!",
            totalMoves: game.totalMoves,
            pairsFoundByPlayers,
            game,
          });

          lobby.deleteGame(game.id);

          io.to("lobby").emit("lobbyChanged", lobby.getGames());
        } else {
          io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", game);
        }
      }, 1000);
    }

    return game;
  };

  return {
    initGame,
    flipCard,
  };
};
