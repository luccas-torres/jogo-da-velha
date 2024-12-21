const socket = new WebSocket("ws://localhost:8080 ");

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

const board = document.querySelector(".board");
const squares = document.querySelectorAll(".cell");
const winningLine = document.querySelector(".winning-line");
const restart = document.querySelector("button");

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

const diagonal = [1, 5, 9];
const antiDiagonal = [3, 5, 7];
const vertical = [2, 5, 8];
const horizontal = [4, 5, 6];

const upHorizontal = [1, 2, 3];
const downHorizontal = [7, 8, 9];

const leftVertical = [1, 4, 7];
const rightVertical = [3, 6, 9];

const edges = [1, 9, 3, 7];
const cruz = [2, 8, 4, 6];

const classes = ["o", "x"];

squares.forEach((square, index) => {
  square.addEventListener("click", (e) => {
    if (square.classList.contains("o") || square.classList.contains("x"))
      return;

    if (square.classList.contains("o") || square.classList.contains("x"))
      return;

    const player = is_x ? "x" : "o";
    square.classList.add(player);

    socket.send(JSON.stringify({ type: "move", index, player, playerId }));

    is_x = !is_x;

    if (edges.slice(0, 2).includes(index + 1) || index + 1 === 5) {
      const squareClass = square.classList.value.slice(-1);
      const winner = isWinner(squareClass, diagonal);

      if (winner) {
        socket.send(JSON.stringify({ type: "winner", line: "diagonal" }));
      }
    }

    if (edges.slice(-2).includes(index + 1) || index + 1 === 5) {
      const squareClass = square.classList.value.slice(-1);
      const winner = isWinner(squareClass, antiDiagonal);

      if (winner) {
        socket.send(JSON.stringify({ type: "winner", line: "anti-diagonal" }));
      }
    }

    if (cruz.slice(0, 2).includes(index + 1) || index + 1 === 5) {
      const squareClass = square.classList.value.slice(-1);
      const winner = isWinner(squareClass, vertical);

      if (winner) {
        socket.send(JSON.stringify({ type: "winner", line: "vetical-middle" }));
      }
    }

    if (cruz.slice(-2).includes(index + 1) || index + 1 === 5) {
      const squareClass = square.classList.value.slice(-1);
      const winner = isWinner(squareClass, horizontal);

      if (winner) {
        socket.send(
          JSON.stringify({ type: "winner", line: "horizontal-middle" })
        );
      }
    }

    if (edges[0] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerUp = isWinner(squareClass, upHorizontal);
      const winnerLeft = isWinner(squareClass, leftVertical);

      if (winnerUp || winnerLeft) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerUp ? "horizontal-top" : "vertical-left",
          })
        );
      }
    }

    if (edges[2] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerUp = isWinner(squareClass, upHorizontal);
      const winnerRight = isWinner(squareClass, rightVertical);

      if (winnerUp || winnerRight) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerUp ? "horizontal-top" : "vertical-right",
          })
        );
      }
    }

    if (edges.at(-1) === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerDown = isWinner(squareClass, downHorizontal);
      const winnerLeft = isWinner(squareClass, leftVertical);

      if (winnerDown || winnerLeft) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerDown ? "horizontal-bottom" : "vertical-left",
          })
        );
      }
    }

    if (edges[1] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerDown = isWinner(squareClass, downHorizontal);
      const winnerRight = isWinner(squareClass, rightVertical);

      if (winnerDown || winnerRight) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerDown ? "horizontal-bottom" : "vertical-right",
          })
        );
      }
    }

    if (cruz[0] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerMiddle = isWinner(squareClass, vertical);
      const winnerUp = isWinner(squareClass, upHorizontal);

      if (winnerMiddle || winnerUp) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerMiddle ? "vertical-middle" : "horizontal-top",
          })
        );
      }
    }

    if (cruz[1] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerMiddle = isWinner(squareClass, horizontal);
      const winnerDown = isWinner(squareClass, downHorizontal);

      if (winnerMiddle || winnerDown) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerMiddle ? "vertical-middle" : "horizontal-bottom",
          })
        );
      }
    }

    if (cruz[2] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerMiddle = isWinner(squareClass, horizontal);
      const winnerLeft = isWinner(squareClass, leftVertical);

      if (winnerMiddle || winnerLeft) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerMiddle ? "horizontal-middle" : "vertical-left",
          })
        );
      }
    }

    if (cruz[3] === index + 1) {
      const squareClass = square.classList.value.slice(-1);
      const winnerMiddle = isWinner(squareClass, horizontal);
      const winnerRight = isWinner(squareClass, rightVertical);

      if (winnerMiddle || winnerRight) {
        socket.send(
          JSON.stringify({
            type: "winner",
            line: winnerMiddle ? "horizontal-middle" : "vertical-right",
          })
        );
      }
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
  socket.send(JSON.stringify({ type: "restart" }));
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

const isWinner = (squareClass, direction) => {
  for (let i = 0; i < direction.length; i++) {
    const currentSquareClass = squares[direction[i] - 1];

    if (!currentSquareClass.classList.contains(squareClass)) {
      return false;
    }
  }

  hasWinner = true;

  return true;
};
