const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let switchTurn = false;

app.use(express.static("src"));

let salaCounter = 1;
const salas = [];

function criarSala() {
  const sala = {
    id: salaCounter++,
    jogadores: [],
    turn: null,
  };
  salas.push(sala);
  return sala;
}

function encontrarSala(playerId) {
  return salas.find((sala) =>
    sala.jogadores.some((jogador) => jogador.playerId === playerId)
  );
}
function notifyTurn(sala) {
  if (!sala.turn) return;
  sala.jogadores.forEach(({ ws }) => {
    ws.send(JSON.stringify({ type: "turn", currentTurn: sala.turn }));
  });
}

wss.on("connection", (ws) => {
  const playerId = uuidv4();
  console.log("Novo jogador conectado!", playerId);

  let sala =
    salas.length && salas[salas.length - 1].jogadores.length < 2
      ? salas[salas.length - 1]
      : criarSala();

  sala.jogadores.push({ ws, playerId });

  ws.send(
    JSON.stringify({
      type: "assignId",
      playerId,
      sala: sala.id,
    })
  );

  if (sala.jogadores.length === 2 && !sala.turn) {
    sala.jogadores.forEach(({ ws }) => {
      ws.send(
        JSON.stringify({
          type: "other-player-connected",
          message: "Outro jogador entrou na sala!",
        })
      );
    });
    sala.turn = sala.jogadores[0].playerId;
    notifyTurn(sala);
  }

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    data.playerId = playerId;

    const sala = encontrarSala(playerId);
    if (!sala) {
      ws.send(
        JSON.stringify({ type: "error", message: "Sala não encontrada!" })
      );
      return;
    }

    if (data.type === "move") {
      if (playerId === sala.turn) {
        sala.jogadores.forEach(({ ws }) => {
          ws.send(JSON.stringify(data));
        });

        const currentIndex = sala.jogadores.findIndex(
          (jogador) => jogador.playerId === sala.turn
        );
        sala.turn =
          sala.jogadores[(currentIndex + 1) % sala.jogadores.length].playerId;

        notifyTurn(sala);
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Não é sua vez!" }));
      }
    }

    if (data.type === "winner") {
      sala.jogadores.forEach(({ ws }) => {
        ws.send(JSON.stringify(data));
      });
    }

    if (["restart", "end"].includes(data.type)) {
      sala.jogadores.forEach(({ ws }) => {
        ws.send(JSON.stringify({ type: data.type }));
      });

      if (data.type === "restart") {
        switchTurn = !switchTurn;
        sala.turn = switchTurn
          ? sala.jogadores[1].playerId
          : sala.jogadores[0].playerId;
        notifyTurn(sala);
      }
    }
  });

  ws.on("close", () => {
    const sala = encontrarSala(playerId);
    if (sala) {
      sala.jogadores = sala.jogadores.filter(
        (jogador) => jogador.playerId !== playerId
      );

      if (!sala.jogadores.length) {
        const index = salas.indexOf(sala);
        if (index !== -1) salas.splice(index, 1);
      }
    }

    console.log(`Jogador ${playerId} desconectou!`);
  });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
