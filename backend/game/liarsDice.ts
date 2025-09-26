type Player = {
  id: number;
  name: string;
  dice: number[];
  hasLost: boolean;
};

type GameState = {
  players: Player[];
  currentPlayer: number;
  bid: { count: number; face: number } | null;
  started: boolean;
};

export class LiarsDiceGame {
  state: GameState;

  constructor() {
    this.state = {
      players: [],
      currentPlayer: 0,
      bid: null,
      started: false,
    };
  }

  generateDice(count: number): number[] {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  }

  rollDiceForAllPlayers(): void {
    this.state.players.forEach(player => {
      if (!player.hasLost) {
        player.dice = this.generateDice(player.dice.length);
      }
    });
  }

  nextPlayer() {
    const total = this.state.players.length;
    do {
      this.state.currentPlayer = (this.state.currentPlayer + 1) % total;
    } while (this.state.players[this.state.currentPlayer].hasLost);
  }

  makeBid(playerId: number, count: number, face: number): boolean {
    if (this.state.currentPlayer !== playerId) return false;

    const currentProduct = this.state.bid ? this.state.bid.count * this.state.bid.face : 0;
    const newProduct = count * face;

    if (this.state.bid && newProduct <= currentProduct) return false;

    this.state.bid = { count, face };
    this.nextPlayer();
    return true;
  }

  callLiar(playerId: number): number | null {
    if (this.state.bid == null) return null;
    if (this.state.currentPlayer !== playerId) return null;

    const total = this.state.players
      .flatMap(p => p.dice)
      .filter(face => face === this.state.bid?.face).length;

    const challengerWasRight = total < (this.state.bid?.count ?? 0);
    const prevPlayerId = this.getPreviousPlayerId();
    const loserId = challengerWasRight ? prevPlayerId : playerId;

    const loser = this.state.players[loserId];
    if (!loser) {
      console.error(`Loser with ID ${loserId} not found`);
      return null;
    }

    console.log(`Challenge by ${playerId}, prevPlayer: ${prevPlayerId}, loser: ${loserId}, dice before: ${loser.dice.length}`);

    if (loser.dice.length === 1) {
      loser.hasLost = true;
      loser.dice = [];
    } else {
      loser.dice.pop();
    }

    this.state.bid = null;
    this.nextPlayer();

    this.rollDiceForAllPlayers();

    console.log(`After challenge, loser dice: ${loser.dice.length}, bid: ${JSON.stringify(this.state.bid)}`);

    return loserId;
  }

  addPlayer(name: string): void {
    const id = this.state.players.length;
    const newPlayer: Player = {
      id,
      name,
      dice: this.state.started ? [] : this.generateDice(6),
      hasLost: this.state.started,
    }

    this.state.players.push(newPlayer);
  }

  removePlayer(id: number): void {
    this.state.players = this.state.players.filter(player => player.id !== id);
  }

  gameOver(): boolean | string {
    const playersLeft = this.state.players.filter(player => !player.hasLost);
    if (playersLeft.length === 1) {
      this.restartGame();
      return playersLeft[0].name;
    }
    return false;
  }

  restartGame(): void {
    this.state.players.forEach(player => {
      player.dice = this.generateDice(6);
      player.hasLost = false;
    })
    this.state.bid = null;
    this.state.currentPlayer = 0;
    this.state.started = false;
  }

  getPreviousPlayerId(): number {
    const total = this.state.players.length;
    let index = this.state.currentPlayer;
    let iterations = 0;
    do {
      index = (index - 1 + total) % total;
      iterations++;
      if (iterations >= total) {
        console.error('No valid previous player found');
        return this.state.currentPlayer;
      }
    } while (this.state.players[index].hasLost);
    return this.state.players[index].id;
  }

  getPublicState() {
    return {
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        diceCount: p.dice.length,
        hasLost: p.hasLost,
      })),
      currentPlayer: this.state.currentPlayer,
      currentBid: this.state.bid,
      started: this.state.started,
    };
  }

  getPlayerDice(player: number) {
    return this.state.players[player].dice;
  }
}