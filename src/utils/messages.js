let switchTurn = false;

function sendMessage(ws, data, playerId, sala) {
  if (!sala) {
    ws.send(
      JSON.stringify({ type: "error", message: "Sala não encontrada!" })
    );
    return;
  }

  switch (data.type) {
    case "move":
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
      break;
    case "winner":
      sala.jogadores.forEach(({ ws }) => {
        ws.send(JSON.stringify(data));
      });
      break;
    case "restart":
    case "end":
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
      break;
  }
}

function notifyTurn(sala) {
  if (!sala.turn) return;
  sala.jogadores.forEach(({ ws }) => {
    ws.send(JSON.stringify({ type: "turn", currentTurn: sala.turn }));
  });
}

module.exports = { sendMessage, notifyTurn };
