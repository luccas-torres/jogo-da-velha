// const WebSocket = require("ws");
// const { v4: uuidv4 } = require("uuid");
// const wss = new WebSocket.Server({ port: 8081 });

// let players = [];

// wss.on("connection", (ws) => {
//   console.log("Novo jogador conectado!");
//   const playerId = uuidv4();
//   players.push(ws);

//   ws.send(JSON.stringify({ type: "assignId", playerId }));

//   ws.on("message", (message) => {
//     const data = JSON.parse(message);
//     data.playerId = playerId;

//     if (data.type === "move") {
//       players.forEach((player) => {
//         if (player !== ws) {
//           player.send(JSON.stringify(data));
//         }
//       });
//     }

//     if (data.type === "winner") {
//       players.forEach((player) => {
//         player.send(JSON.stringify(data));
//       });
//     }

//     if (data.type === "restart") {
//       players.forEach((player) => {
//         player.send(JSON.stringify({ type: "restart" }));
//       });
//     }

//     if (data.type === "end") {
//       players.forEach((player) => {
//         player.send(JSON.stringify({ type: "end" }));
//       });
//     }
//   });

//   ws.on("close", () => {
//     players = players.filter((player) => player !== ws);
//     console.log("Um jogador desconectou!");
//   });
// });

// console.log("Servidor WebSocket rodando na porta 8081!");

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8081 });

let players = []; // Lista de jogadores conectados
let turn = null; // ID do jogador atual (quem deve jogar)

wss.on("connection", (ws) => {
  const playerId = uuidv4();
  console.log("Novo jogador conectado!", playerId);

  players.push({ ws, playerId });

  // Se dois jogadores já estão conectados, define o primeiro jogador como o turno inicial
  if (players.length === 2 && turn === null) {
    turn = players[0].playerId;
    notifyTurn();
  }

  // Envia o playerId para o jogador atual
  ws.send(JSON.stringify({ type: "assignId", playerId }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    data.playerId = playerId;

    if (data.type === "move") {
      if (playerId === turn) {
        // Envia o movimento para todos os jogadores
        players.forEach((player) => {
          player.ws.send(JSON.stringify(data));
        });

        // Alterna o turno para o próximo jogador
        turn = players.find((player) => player.playerId !== turn).playerId;
        notifyTurn();
      } else {
        // Movimento inválido (fora do turno)
        ws.send(JSON.stringify({ type: "error", message: "Não é sua vez!" }));
      }
    }

    if (data.type === "winner") {
      players.forEach((player) => {
        player.ws.send(JSON.stringify(data));
      });
    }

    if (data.type === "restart") {
      // Reinicia o jogo
      turn = players[1].playerId; // Primeiro jogador inicia o turno
      players.forEach((player) => {
        player.ws.send(JSON.stringify({ type: "restart" }));
      });
      notifyTurn();
    }

    if (data.type === "end") {
      // Envia mensagem de fim para todos
      players.forEach((player) => {
        player.ws.send(JSON.stringify({ type: "end" }));
      });
    }
  });

  ws.on("close", () => {
    players = players.filter((player) => player.ws !== ws);
    console.log("Um jogador desconectou!");
  });

  function notifyTurn() {
    players.forEach((player) => {
      player.ws.send(JSON.stringify({ type: "turn", currentTurn: turn }));
    });
  }
});

console.log("Servidor WebSocket rodando na porta 8081!");
