exports.createLobby = () => {
  const games = new Map();

  const createLobby = (user, socketId, idGame, rows, cols) => {
    if (!user || !rows || !cols || !idGame) return null;

    const maxPlayers = determineMaxPlayers(rows, cols);

    const game = {
      id: idGame,
      rows: rows,
      cols: cols,
      board: [],
      created_at: Date.now(),
      expires_at: Date.now() + 180000,
      player1: user,
      player1SocketId: socketId,
      players: [{ ...user, pairsFound: 0 }],
      maxPlayers: maxPlayers,
      status: "waiting",
    };

    games.set(idGame, game);
    return game;
  };

  const determineMaxPlayers = (rows, cols) => {
    if (cols === 3 && rows === 4) return 2;
    if (cols === 4 && rows === 4) return 3;
    return 5;
  };

  const setGameBoard = (gameId, board) => {
    const game = games.get(gameId);
    if (game) {
      game.board = board;
      games.set(gameId, game);
      return game;
    } else {
      return null;
    }
  };

  const leave = (gameId, userId) => {
    const game = games.get(gameId);
    if (!game) return getGames();

    const previousOwnerId = game.player1.id;

    if (game.status === "waiting") {
      game.players = game.players.filter((player) => player.id !== userId);

      if (game.players.length === 0) {
        games.delete(gameId);
        return { games: getGames(), previousOwnerId };
      }

      if (game.player1.id === userId) {
        game.player1 = game.players[0];
        game.player1SocketId = game.players[0].socketId;
      }
    }

    return { games: getGames(), previousOwnerId, game };
  };

  const leaveAllLobbies = (userId) => {
    for (const [gameId, game] of games.entries()) {
      if (game.players.some((player) => player.id === userId)) {
        leave(gameId, userId);
      }
    }
  };

  const setReady = (gameId, playerId) => {
    const game = games.get(gameId);
    if (!game) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.ready = !player.ready;
    }

    return game;
  };

  const existsGame = (id) => {
    return games.has(id);
  };

  const getGame = (id) => {
    return games.get(id);
  };

  const getGames = () => {
    deleteExpiredLobbies();
    return [...games.values()];
  };

  const deleteGame = (gameId) => {
    if (games.has(gameId)) {
      const game = games.get(gameId);
      if (game.timer) {
        clearTimeout(game.timer);
      }
      games.delete(gameId);
    }
  };

  const playerInativo = (gameId, userId) => {
    const game = games.get(gameId);
    if (!game) {
      return null;
    }

    const player = game.players.find((p) => p.id === userId);
    if (player) {
      player.inactive = true;
    }

    let currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id === userId) {
      do {
        game.currentPlayerIndex =
          (game.currentPlayerIndex + 1) % game.players.length;
        currentPlayer = game.players[game.currentPlayerIndex];
      } while (currentPlayer.inactive);
    }

    return game;
  };

  const deleteExpiredLobbies = () => {
    const now = Date.now();
    for (const [gameId, game] of games.entries()) {
      if (game.expires_at && game.expires_at <= now) {
        games.delete(gameId);
      }
    }
  };

  return {
    getGames,
    getGame,
    createLobby,
    existsGame,
    leave,
    setReady,
    leaveAllLobbies,
    setGameBoard,
    deleteGame,
    playerInativo,
    deleteExpiredLobbies,
  };
};
