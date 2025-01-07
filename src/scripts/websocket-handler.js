const socket = new WebSocket(
  window.location.hostname === "localhost"
    ? "ws://localhost:8080"
    : "wss://jogo-da-velha-ijfk.onrender.com"
);

let playerId = null;
let isMyTurn = false;

socket.onopen = () => {
  console.log("Conectado ao servidor WebSocket!");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "assignId") {
    playerId = data.playerId;
    console.log("Meu ID único:", playerId);
  }

  if (data.type === "turn") {
    isMyTurn = data.currentTurn === playerId;
    updateBoardState();
  }

  if (data.type === "move") {
    const { index, player } = data;
    squares[index].classList.add(player);
    is_x = player === "x" ? false : true;
  }

  if (data.type === "winner") {
    const { line } = data;

    winningLine.classList.add(line);
    board.classList.add("opacity");
    board.classList.add("block-game");
  }

  if (data.type === "restart") {
    restartGame();
  }

  if (data.type === "end") {
    endGame(true);
  }
};

socket.onerror = (error) => {
  console.error("Erro no WebSocket:", error);
};

export { socket, }