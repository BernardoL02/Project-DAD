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

  const timers = new Map();

  const startTurnTimer = (game, io, lobby) => {
    stopTurnTimer(game.id);

    // Define o tempo inicial (20 segundos) e registra o início
    const TURN_DURATION = 20000; // 20 segundos em milissegundos
    game.turnStartTime = Date.now();

    const timer = setTimeout(() => {
      const currentPlayer = game.players[game.currentPlayerIndex];

      console.log(`Player ${currentPlayer.nickname} did not play in time.`);

      const updatedGame = lobby.playerInativo(game.id, currentPlayer.id);

      if (!updatedGame) {
        io.to(game.players.map((p) => p.socketId)).emit("gameCancelled", {
          message:
            "The game was cancelled because all players became inactive.",
          updatedGame: game,
        });

        return;
      }

      io.to(updatedGame.players.map((p) => p.socketId)).emit("playerLeft", {
        message: `${currentPlayer.nickname} was removed for inactivity.`,
        updatedGame,
      });

      io.to(updatedGame.players.map((p) => p.socketId)).emit("gameUpdated", {
        ...updatedGame,
        remainingTime: TURN_DURATION / 1000,
      });

      startTurnTimer(updatedGame, io, lobby);
    }, TURN_DURATION);

    timers.set(game.id, timer);

    // Envia o tempo restante para os clientes
    io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", {
      ...game,
      remainingTime: TURN_DURATION / 1000,
    });
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

    // Define o startTime na primeira jogada
    if (!game.startTime) {
      game.startTime = Date.now();
    }

    game.selectedCards.push(index);
    game.board[index].flipped = true;

    if (game.selectedCards.length === 2) {
      game.isLocked = true;
      stopTurnTimer(game.id); // Para o timer atual durante a jogada
      game.totalMoves += 1; // Incrementa o contador de jogadas
      currentPlayer.totalTurns = (currentPlayer.totalTurns || 0) + 1; // Incrementa o totalTurns do jogador atual

      const [firstIndex, secondIndex] = game.selectedCards;

      setTimeout(() => {
        if (game.board[firstIndex].id === game.board[secondIndex].id) {
          game.matchedPairs.push(firstIndex, secondIndex);
          currentPlayer.pairsFound = (currentPlayer.pairsFound || 0) + 1;
        } else {
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
        game.isLocked = false;

        // Verifica se o jogo terminou
        if (game.matchedPairs.length === game.board.length) {
          game.status = "ended";

          // Determina o vencedor
          const winner = determineWinner(game.players);

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
          io.to(game.players.map((p) => p.socketId)).emit("gameUpdated", {
            ...game,
            remainingTime: 20,
            startTime: game.startTime,
            players: game.players,
          });
          startTurnTimer(game, io, lobby);
        }
      }, 1000);
    }

    return game;
  };

  // Função para determinar o vencedor
  const determineWinner = (players) => {
    return players.reduce((best, player) => {
      if (!best) return player;

      // Se o jogador atual encontrou mais pares que o "best", ele se torna o novo vencedor
      if (player.pairsFound > best.pairsFound) {
        return player;
      }

      // Se ambos os jogadores têm o mesmo número de pares encontrados
      if (player.pairsFound === best.pairsFound) {
        // Ganha o jogador que tiver menos turnos
        if (player.totalTurns < best.totalTurns) {
          return player;
        }

        // Em caso de empate nos turnos, o "best" permanece vencedor por ter alcançado o empate primeiro
      }

      return best;
    }, null);
  };

  return {
    initGame,
    flipCard,
    startTurnTimer,
    stopTurnTimer,
  };
};
