let socket = null;
let playerId = null;
let isMyTurn = false;

function connectPlayers() {
  if (socket) {
    console.log("Já conectado!");
    return; 
  }

  socket = new WebSocket(
    window.location.hostname === "localhost"
      ? "ws://localhost:8080"
      : "wss://jogo-da-velha-ijfk.onrender.com"
  );

  socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket!");
    yourTurn.append("Aguardando outro jogador entrar na sala...");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "other-player-connected") {
      yourTurn.firstChild.remove();
    }

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
}

const board = document.querySelector(".board");
const squares = document.querySelectorAll(".cell");
const winningLine = document.querySelector(".winning-line");
const restart = document.querySelector(".restart");
const connectPlayersButton = document.querySelector(".connect-button");

const yourTurn = document.querySelector(".your-turn");
const yourTurnText = document.createTextNode("Sua vez");
const waitOtherPlayer = document.createTextNode("Aguarde sua vez");

const empate = document.createElement("div");
const empateText = document.createTextNode("EMPATE");
const winnerText = document.createTextNode("VOCÊ VENCEU! :)");
const loserText = document.createTextNode("VOCÊ PERDEU :(");
empate.setAttribute("class", "draw-message");

let is_x = true;
let hasWinner = false;

const classes = ["o", "x"];

const checkCombinations = () => {
  const combinations = [
    { type: "diagonal", combination: [0, 4, 8] },
    { type: "anti-diagonal", combination: [2, 4, 6] },
    { type: "vertical-middle", combination: [1, 4, 7] },
    { type: "vertical-left", combination: [0, 3, 6] },
    { type: "vertical-right", combination: [2, 5, 8] },
    { type: "horizontal-middle", combination: [3, 4, 5] },
    { type: "horizontal-top", combination: [0, 1, 2] },
    { type: "horizontal-bottom", combination: [6, 7, 8] },
  ];

  for (const { type, combination } of combinations) {
    const [a, b, c] = combination;

    if (
      squares[a].classList.item(1) &&
      squares[a].classList.item(1) === squares[b].classList.item(1) &&
      squares[a].classList.item(1) === squares[c].classList.item(1)
    ) {
      hasWinner = true;
      return type;
    }
  }

  return null;
};

connectPlayersButton.addEventListener("click", () => connectPlayers());

squares.forEach((square, index) => {
  square.addEventListener("click", (e) => {
    if (!socket || square.classList.contains("o") || square.classList.contains("x")) {
      return; 
    }

    const player = is_x ? "x" : "o";
    square.classList.add(player);

    socket.send(JSON.stringify({ type: "move", index, player, playerId }));

    is_x = !is_x;

    const lineWinner = checkCombinations();

    if (lineWinner) {
      socket.send(JSON.stringify({ type: "winner", line: lineWinner }));
    }

    const someElementMissingClass = Array.from(squares).every(
      (square) =>
        square.classList.contains(classes[0]) ||
        square.classList.contains(classes[1])
    );

    if (!hasWinner && someElementMissingClass) {
      socket.send(JSON.stringify({ type: "end" }));
    }

    endGame(someElementMissingClass);
  });
});

const restartGame = () => {
  const winningLineClasses = winningLine.classList;

  squares.forEach((square) => {
    const classes = square.classList;

    if (classes.length > 1) {
      square.classList.remove(classes[classes.length - 1]);
    }
  });

  board.classList.remove("block-game");
  board.classList.remove("opacity");

  if (winningLineClasses[winningLineClasses.length - 1] !== "winning-line") {
    winningLine.classList.remove(
      winningLineClasses[winningLineClasses.length - 1]
    );
  }

  empate.remove();
  is_x = true;
  hasWinner = false;
};

restart.addEventListener("click", () => {
  if (socket) {
    socket.send(JSON.stringify({ type: "restart" }));
  }
});

const updateBoardState = () => {
  if (isMyTurn && !hasWinner) {
    yourTurn.firstChild ? yourTurn.firstChild.remove() : null;
    yourTurn.append(yourTurnText);
    board.classList.remove("block-game");
  } else if (!isMyTurn && !hasWinner) {
    yourTurn.firstChild ? yourTurn.firstChild.remove() : null;
    yourTurn.append(waitOtherPlayer);
    board.classList.add("block-game");
  } else {
    yourTurn.remove();
  }
};

const endGame = (someElementMissingClass) => {
  if (!hasWinner && someElementMissingClass) {
    board.classList.add("block-game");
    board.classList.add("opacity");
    empate.append(empateText);
    board.appendChild(empate);
  }
};