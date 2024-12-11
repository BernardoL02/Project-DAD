exports.createLobby = () => {
  const games = new Map();
  let id = 1;

  const createLobby = (user, socketId, rows, cols) => {
    if (!user || !rows || !cols) return null;

    id++;
    const maxPlayers = determineMaxPlayers(rows, cols);

    const game = {
      id: id,
      rows: rows,
      cols: cols,
      board: [],
      created_at: Date.now(),
      player1: user,
      player1SocketId: socketId,
      players: [user],
      maxPlayers: maxPlayers,
      status: "waiting",
    };

    games.set(id, game);
    return game;
  };

  // Função auxiliar para determinar o limite de jogadores com base no board
  const determineMaxPlayers = (rows, cols) => {
    if (cols === 3 && rows === 4) return 2;
    if (cols === 4 && rows === 4) return 3;
    return 5;
  };

  const setGameBoard = (gameId, board) => {
    const game = games.get(gameId);
    if (game) {
      game.board = board; // Atualiza o board corretamente
      games.set(gameId, game); // Salva o jogo atualizado no mapa
      console.log("Board updated in game:", game);
      return game; // Retorna o jogo atualizado
    } else {
      console.error(`Game with ID ${gameId} not found in setGameBoard`);
      return null;
    }
  };

  const leaveLobby = (gameId, userId) => {
    const game = games.get(gameId);
    if (!game) return getGames();

    // Se o jogador não estiver na lista de jogadores, retorna os jogos
    if (!game.players.some((player) => player.id === userId)) return getGames();

    // Se o usuário é o dono do lobby
    if (game.player1.id === userId) {
      // Se houver outro jogador disponível, ele se torna o novo dono
      if (game.players.length > 1) {
        game.players = game.players.filter((player) => player.id !== userId);
        game.player1 = game.players[0]; // Novo dono é o primeiro jogador da lista
        game.player1SocketId = null; // Opcional: atualizar o socket ID conforme necessário
      } else {
        // Se não há mais jogadores, remove o lobby
        games.delete(gameId);
        return getGames();
      }
    } else {
      // Se o usuário não é o dono, apenas remove ele do lobby
      game.players = game.players.filter((player) => player.id !== userId);
    }

    return getGames();
  };

  const leaveAllLobbies = (userId) => {
    for (const [gameId, game] of games.entries()) {
      if (game.players.some((player) => player.id === userId)) {
        leaveLobby(gameId, userId);
      }
    }
  };

  const setReady = (gameId, playerId) => {
    const game = games.get(gameId);
    if (!game) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.ready = !player.ready;
      console.log(`Player ${playerId} ready state set to:`, player.ready);
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
    return [...games.values()];
  };

  return {
    getGames,
    getGame,
    createLobby,
    existsGame,
    leaveLobby,
    setReady,
    leaveAllLobbies,
    setGameBoard,
  };
};
