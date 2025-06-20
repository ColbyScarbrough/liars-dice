type Player = {
    id: string;
    dice: number[];
    hasLost: boolean;
};

type GameState = {
    players: Player[];
    currentPlayer: number;
    bid: { count: number; face: number} | null;
}

export class LiarsDiceGame {
    state: GameState;

    constructor(playerIds: string[]) {
        this.state = {
            players: playerIds.map(id => ({id, dice: this.rollDice(6), hasLost: false})),
            currentPlayer: 0,
            bid: null,
        };
    }

    rollDice(count: number) {
        return Array.from({ length: count}, () => Math.floor(Math.random() * 6) + 1);
    }

    nextPlayer() {
        const total = this.state.players.length;
        do {
            this.state.currentPlayer = (this.state.currentPlayer + 1) % total;
        } while (this.state.players[this.state.currentPlayer].hasLost);
    }

    makeBid(playerId: number, count: number, face: number): boolean {
        if(this.state.currentPlayer != playerId) return false;
        if(this.state.bid && (this.state.bid.count <= count && this.state.bid.face <= face)) return false;

        this.state.bid = { count, face };
        this.nextPlayer();
        return true;
    }

    callLiar(playerId: string): { loserId: string } | null {
        if (this.state.players[this.state.currentPlayer].id !== playerId) return null;

        const total = this.state.players.flatMap(p => p.dice)
        .filter(face => face === this.state.bid?.face).length;

        const liarWasRight = total < (this.state.bid?.count ?? 0);
        const loser = liarWasRight
        ? this.state.players.find(p => p.id === this.getPreviousPlayerId())
        : this.state.players.find(p => p.id === playerId);

        if (loser) loser.hasLost = true;
        return { loserId: loser?.id || '' };
    }

    getPreviousPlayerId(): string {
        const total = this.state.players.length;
        let index = this.state.currentPlayer;
        do {
            index = (index - 1 + total) % total;
        } while (this.state.players[index].hasLost);
        return this.state.players[index].id;
    }

    getPublicState(forPlayerId: string) {
        return {
            players: this.state.players.map(p => ({
                id: p.id,
                diceCount: p.dice.length,
                isSelf: p.id === forPlayerId,
        })),
        currentPlayer: this.state.players[this.state.currentPlayer].id,
        currentBid: this.state.bid,
        };
    }

}