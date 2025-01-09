class Rooms {
  constructor() {
    this.salaCounter = 1;
    this.salas = [];
  }

  criarSala() {
    const sala = {
      id: this.salaCounter++,
      jogadores: [],
      turn: null,
    };

    this.salas.push(sala);
    return sala;
  }

  encontrarSala(playerId) {
    return this.salas.find((sala) =>
      sala.jogadores.some((jogador) => jogador.playerId === playerId)
    );
  }

  cleanEmptyRooms() {
    for (let i = this.salas.length - 1; i >= 0; i--) {
      if (this.salas[i].jogadores.length === 0) {
        this.salas.splice(i, 1);
      }
    }
  }
}

module.exports = { Rooms };
