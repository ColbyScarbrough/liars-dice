"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiarsDiceGame = void 0;
class LiarsDiceGame {
    constructor(playerNames) {
        this.state = {
            players: playerNames.map((name, index) => ({
                id: index,
                name,
                dice: this.rollDice(6),
                hasLost: false
            })),
            currentPlayer: 0,
            bid: null
        };
    }
    rollDice(count) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    }
    nextPlayer() {
        const total = this.state.players.length;
        do {
            this.state.currentPlayer = (this.state.currentPlayer + 1) % total;
        } while (this.state.players[this.state.currentPlayer].hasLost);
    }
    makeBid(playerId, count, face) {
        if (this.state.currentPlayer != playerId)
            return false;
        if (this.state.bid && (this.state.bid.count <= count && this.state.bid.face <= face))
            return false;
        this.state.bid = { count, face };
        this.nextPlayer();
        return true;
    }
    callLiar(playerId) {
        var _a, _b;
        if (this.state.currentPlayer !== playerId)
            return null;
        const total = this.state.players
            .flatMap(p => p.dice)
            .filter(face => { var _a; return face === ((_a = this.state.bid) === null || _a === void 0 ? void 0 : _a.face); }).length;
        const liarWasRight = total < ((_b = (_a = this.state.bid) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0);
        const prevPlayerId = this.getPreviousPlayerId();
        const loserId = liarWasRight ? prevPlayerId : playerId;
        const loser = this.state.players.find(p => p.id === loserId);
        if (loser)
            loser.hasLost = true;
        return { loserId };
    }
    getPreviousPlayerId() {
        const total = this.state.players.length;
        let index = this.state.currentPlayer;
        do {
            index = (index - 1 + total) % total;
        } while (this.state.players[index].hasLost);
        return this.state.players[index].id;
    }
    getPublicState(forPlayerName) {
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
        };
    }
}
exports.LiarsDiceGame = LiarsDiceGame;
