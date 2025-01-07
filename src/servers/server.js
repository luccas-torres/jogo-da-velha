// // import * as express from "express";
// import * as http from "http";
// import { WebSocketServer } from "ws";
// import { v4 as uuidv4 } from "uuid";
// import RoomController from "./servers/rooms.js";

// class GameServer {
//   constructor() {
//     this.app = express();
//     this.server = http.createServer(this.app);
//     this.wss = new WebSocketServer({ server: this.server });
//     this.rooms = [];
//     this.roomCounter = 1;
//     this.switchTurn = false;

//     this.app.use(express.static("src"));

//     this.wss.on("connection", (ws) => this.handleConnection(ws));
//   }

//   createRoom() {
//     const room = {
//       id: this.roomCounter++,
//       players: [],
//       turn: null,
//     };
//     this.rooms.push(room);
//     return room;
//   }

//   findRoom(playerId) {
//     return this.rooms.find((room) =>
//       room.players.some((player) => player.playerId === playerId)
//     );
//   }

//   notifyTurn(room) {
//     if (!room.turn) return;
//     room.players.forEach(({ ws }) => {
//       ws.send(JSON.stringify({ type: "turn", currentTurn: room.turn }));
//     });
//   }

//   handleConnection(ws) {
//     const playerId = uuidv4();
//     console.log("New player connected!", playerId);

//     const roomsController = new RoomController(playerId);
//     const b = roomsController.createRoom();
//     console.log("test", b);

//     let room =
//       this.rooms.length && this.rooms[this.rooms.length - 1].players.length < 2
//         ? this.rooms[this.rooms.length - 1]
//         : this.createRoom();

//     room.players.push({ ws, playerId });

//     ws.send(
//       JSON.stringify({
//         type: "assignId",
//         playerId,
//         room: room.id,
//       })
//     );

//     if (room.players.length === 2 && !room.turn) {
//       room.players.forEach(({ ws }) => {
//         ws.send(
//           JSON.stringify({
//             type: "other-player-connected",
//             message: "Another player has joined the room!",
//           })
//         );
//       });
//       room.turn = room.players[0].playerId;
//       this.notifyTurn(room);
//     }

//     ws.on("message", (message) => this.handleMessage(ws, message, playerId));
//     ws.on("close", () => this.handleDisconnection(playerId));
//   }

//   handleMessage(ws, message, playerId) {
//     const data = JSON.parse(message);
//     data.playerId = playerId;

//     const room = this.findRoom(playerId);
//     if (!room) {
//       ws.send(
//         JSON.stringify({ type: "error", message: "Room not found!" })
//       );
//       return;
//     }

//     if (data.type === "move") {
//       if (playerId === room.turn) {
//         room.players.forEach(({ ws }) => {
//           ws.send(JSON.stringify(data));
//         });

//         const currentIndex = room.players.findIndex(
//           (player) => player.playerId === room.turn
//         );
//         room.turn =
//           room.players[(currentIndex + 1) % room.players.length].playerId;

//         this.notifyTurn(room);
//       } else {
//         ws.send(
//           JSON.stringify({ type: "error", message: "It's not your turn!" })
//         );
//       }
//     }

//     if (data.type === "winner") {
//       room.players.forEach(({ ws }) => {
//         ws.send(JSON.stringify(data));
//       });
//     }

//     if (["restart", "end"].includes(data.type)) {
//       room.players.forEach(({ ws }) => {
//         ws.send(JSON.stringify({ type: data.type }));
//       });

//       if (data.type === "restart") {
//         this.switchTurn = !this.switchTurn;
//         room.turn = this.switchTurn
//           ? room.players[1].playerId
//           : room.players[0].playerId;
//         this.notifyTurn(room);
//       }
//     }
//   }

//   handleDisconnection(playerId) {
//     const room = this.findRoom(playerId);
//     if (room) {
//       room.players = room.players.filter(
//         (player) => player.playerId !== playerId
//       );

//       if (!room.players.length) {
//         const index = this.rooms.indexOf(room);
//         if (index !== -1) this.rooms.splice(index, 1);
//       }
//     }

//     console.log(`Player ${playerId} disconnected!`);
//   }

//   start(port = 8080) {
//     this.server.listen(port, () => {
//       console.log(`Server running at http://localhost:${port}`);
//     });
//   }
// }

// const gameServer = new GameServer();
// gameServer.start(process.env.PORT || 8080);
