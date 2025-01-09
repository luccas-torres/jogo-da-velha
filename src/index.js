const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { Rooms } = require("./models/Rooms");
const { sendMessage, notifyTurn } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("src"));

const roomsManager = new Rooms();

wss.on("connection", (ws) => {
  const playerId = uuidv4();
  console.log("Novo jogador conectado!", playerId);

  let sala =
    roomsManager.salas.length && roomsManager.salas[roomsManager.salas.length - 1].jogadores.length < 2
      ? roomsManager.salas[roomsManager.salas.length - 1]
      : roomsManager.criarSala();

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
    
    const sala = roomsManager.encontrarSala(playerId);

    sendMessage(ws, data, playerId, sala);
  });

  ws.on("close", () => {
    const sala = encontrarSala();
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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
