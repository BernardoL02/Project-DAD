exports.createGameEngine = () => {
  // Inicializa o jogo
  const initGame = (gameFromDB) => {
    gameFromDB.gameStatus = null;
    gameFromDB.currentPlayerIndex = 0;
    gameFromDB.matchedPairs = [];
    gameFromDB.selectedCards = [];

    // Reinicia o estado das cartas (flipped) no board
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

  // Jogada para virar uma carta
  const flipCard = (game, index, playerSocketId, io) => {
    const currentPlayer = game.players[game.currentPlayerIndex];

    if (playerSocketId !== currentPlayer.socketId) {
      return {
        errorCode: 12,
        errorMessage: "Invalid play: It is not your turn!",
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

    game.selectedCards.push(index);
    game.board[index].flipped = true; // Marca a carta como virada

    game.players.forEach((player) => {
      if (!player.pairsFound) player.pairsFound = 0;
    });
    if (!game.totalMoves) game.totalMoves = 0;

    if (game.selectedCards.length === 2) {
      const [firstIndex, secondIndex] = game.selectedCards;

      game.totalMoves += 1;

      setTimeout(() => {
        if (game.board[firstIndex].id === game.board[secondIndex].id) {
          game.matchedPairs.push(firstIndex, secondIndex);
          currentPlayer.pairsFound += 1;
        } else {
          game.board[firstIndex].flipped = false;
          game.board[secondIndex].flipped = false;
        }

        game.selectedCards = [];
        game.currentPlayerIndex =
          (game.currentPlayerIndex + 1) % game.players.length;

        // Verifica se o jogo terminou
        if (game.matchedPairs.length === game.board.length) {
          game.status = "ended";
          io.to(game.players.map((p) => p.socketId)).emit("gameEnded", game);
        } else {
          io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", game);
        }
      }, 1000); // Atraso de 1 segundo para mostrar a animação
    }

    return game;
  };

  // Verifica se o jogo terminou
  const gameEnded = (game) => {
    return game.matchedPairs.length === game.board.length;
  };

  return {
    initGame,
    flipCard,
    gameEnded,
  };
};
