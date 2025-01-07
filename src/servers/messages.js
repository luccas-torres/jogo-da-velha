// const { v4: uuidv4 } = require("uuid");
// const { createRoom, findRoom, notifyTurn, rooms } = require("./rooms");

// let switchTurn = false;

// function handleConnection(ws) {
//   const playerId = uuidv4();
//   console.log("New player connected!", playerId);

//   let room =
//     rooms.length && rooms[rooms.length - 1].players.length < 2
//       ? rooms[rooms.length - 1]
//       : createRoom();

//   room.players.push({ ws, playerId });

//   ws.send(
//     JSON.stringify({
//       type: "assignId",
//       playerId,
//       room: room.id,
//     })
//   );

//   if (room.players.length === 2 && !room.turn) {
//     room.players.forEach(({ ws }) => {
//       ws.send(
//         JSON.stringify({
//           type: "other-player-connected",
//           message: "Another player has joined the room!",
//         })
//       );
//     });
//     room.turn = room.players[0].playerId;
//     notifyTurn(room);
//   }

//   ws.on("message", (message) => handleMessage(ws, playerId, message));
//   ws.on("close", () => handleDisconnection(playerId));
// }

// function handleMessage(ws, playerId, message) {
//   const data = JSON.parse(message);
//   data.playerId = playerId;

//   const room = findRoom(playerId);
//   if (!room) {
//     ws.send(
//       JSON.stringify({ type: "error", message: "Room not found!" })
//     );
//     return;
//   }

//   if (data.type === "move") {
//     if (playerId === room.turn) {
//       room.players.forEach(({ ws }) => {
//         ws.send(JSON.stringify(data));
//       });

//       const currentIndex = room.players.findIndex(
//         (player) => player.playerId === room.turn
//       );
//       room.turn =
//         room.players[(currentIndex + 1) % room.players.length].playerId;

//       notifyTurn(room);
//     } else {
//       ws.send(JSON.stringify({ type: "error", message: "It's not your turn!" }));
//     }
//   }

//   if (data.type === "winner") {
//     room.players.forEach(({ ws }) => {
//       ws.send(JSON.stringify(data));
//     });
//   }

//   if (["restart", "end"].includes(data.type)) {
//     room.players.forEach(({ ws }) => {
//       ws.send(JSON.stringify({ type: data.type }));
//     });

//     if (data.type === "restart") {
//       switchTurn = !switchTurn;
//       room.turn = switchTurn
//         ? room.players[1].playerId
//         : room.players[0].playerId;
//       notifyTurn(room);
//     }
//   }
// }

// function handleDisconnection(playerId) {
//   const room = findRoom(playerId);
//   if (room) {
//     room.players = room.players.filter(
//       (player) => player.playerId !== playerId
//     );

//     if (!room.players.length) {
//       const index = rooms.indexOf(room);
//       if (index !== -1) rooms.splice(index, 1);
//     }
//   }

//   console.log(`Player ${playerId} disconnected!`);
// }

// module.exports = { handleConnection };
