// export default class RoomController {
//   constructor(playerId) {
//     this.rooms = [];
//     this.rommCounter = 1;
//     this.playerId = playerId;
//   }
  
//   createRoom() {
//     const room = {
//       id: roomCounter++,
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

//   cleanEmptyRooms() {
//     const initialRoomCount = this.rooms.length;
//     this.rooms.forEach((room, index) => {
//       if (room.players.length === 0) {
//         rooms.splice(index, 1);
//       }
//     });

//     if (initialRoomCount !== this.rooms.length) {
//       console.log(`Cleaned empty rooms. Active rooms: ${this.rooms.length}`);
//     }
//   }
// }
