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

  constructor(playerNames: string[]) {
    this.state = {
      players: playerNames.map((name, index) => ({
        id: index,
        name,
        dice: this.generateDice(6),
        hasLost: false,
      })),
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

  getPublicState(forPlayerName: string) {
    return {
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        diceCount: p.dice.length,
        isSelf: p.name === forPlayerName,
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