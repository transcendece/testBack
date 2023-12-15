"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGeteway = void 0;
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const websockets_1 = require("@nestjs/websockets");
const matter_js_1 = require("matter-js");
const game_dto_1 = require("../DTOs/game/game.dto");
const game_service_1 = require("./game.service");
const randomString = (length = 20) => {
    return Math.random().toString(36).substring(2, length + 2);
};
let GameGeteway = class GameGeteway {
    constructor() {
        this.clients = new Map();
        this.Random = new Map();
        this.friendGame = {};
        this.randomQueue = [];
        this.gameDe = new game_dto_1.GameDependency(0, 0, 0.001, 10, 8, '#000000', false, 1, 0, 0, Infinity, "red", 5, 5, 10, 'blue');
    }
    ;
    async handleConnection(client, ...args) {
        if (this.clients.has(client.id))
            client.disconnect();
        this.clients.set(client.id, client);
        client.emit("connection", { "clientId": client.id });
    }
    handleDisconnect(client) {
        console.log('Client disconnectedd:', client.id);
        this.Random.forEach((value, key) => {
            if (value.ifPlayerInGame(client.id)) {
                value.stop();
                value.client1.emit("GAMEOVER");
                value.client2.emit("GAMEOVER");
                this.Random.delete(key);
            }
        });
        this.clients.delete(client.id);
    }
    ;
    createGame(req) {
        this.createNewGame(req.clientId, req.map, req.mod);
    }
    randomGame(req) {
        console.log("request: ", req);
        this.createRandomGame(req.clientId, req.map, req.mod);
    }
    joinToGame(req) {
        const gameObj = this.Random.get(req.gameId);
        gameObj.setPlayer2(this.clients.get(req.clientId), req.clientId);
        this.sendPlayDemand(gameObj.player1Id, gameObj.player2Id, req.gameId);
    }
    beginningGame(req) {
        this.Random.get(req.gameId).startGame();
    }
    updatePaddle(req) {
        if (req.clientId === this.Random.get(req.gameId).player1Id) {
            let vec = { x: req.vec.x, y: 780 };
            matter_js_1.Body.setPosition(this.Random.get(req.gameId).p1, vec);
        }
        else if (req.clientId === this.Random.get(req.gameId).player2Id) {
            let vec = { x: req.vec.x, y: 20 };
            matter_js_1.Body.setPosition(this.Random.get(req.gameId).p2, vec);
        }
        this.Random.get(req.gameId).client1.emit('UPDATE', {
            "ball": this.Random.get(req.gameId).ball.position,
            "p1": this.Random.get(req.gameId).p1.position,
            "p2": this.Random.get(req.gameId).p2.position,
            "score1": this.Random.get(req.gameId).score1,
            "score2": this.Random.get(req.gameId).score2,
        });
        this.Random.get(req.gameId).client2.emit('UPDATE', {
            "ball": this.Random.get(req.gameId).reverseVector(this.Random.get(req.gameId).ball.position),
            "p1": this.Random.get(req.gameId).reverseVector(this.Random.get(req.gameId).p1.position),
            "p2": this.Random.get(req.gameId).reverseVector(this.Random.get(req.gameId).p2.position),
            "score1": this.Random.get(req.gameId).score1,
            "score2": this.Random.get(req.gameId).score2,
        });
    }
    createNewGame(player1, map, mod, player2) {
        let state = player2 === undefined ? false : true;
        const gameId = randomString(20);
        this.Random.set(gameId, new game_service_1.GameService(this.clients.get(player1), gameId, game_dto_1.gameMaps.BEGINNER, game_dto_1.gameMods.DEFI));
        if (!state)
            this.clients.get(player1).emit("CREATE", { gameId: "gameId", });
        else {
            this.Random.get(gameId).setPlayer2(this.clients.get(player2), player2);
            this.sendPlayDemand(player1, player2, gameId);
        }
    }
    sendPlayDemand(p1, p2, gameId) {
        this.clients.get(p1).emit("PLAY", {
            gameDependency: this.gameDe,
            gameId: gameId,
        });
        this.clients.get(p2).emit("PLAY", {
            gameDependency: this.gameDe,
            gameId: gameId,
        });
        this.Random.get(gameId).startGame();
    }
    createRandomGame(player, map, mod) {
        this.randomQueue.push(player);
        if (this.randomQueue.length >= 2) {
            const player1 = this.randomQueue.shift();
            const player2 = this.randomQueue.shift();
            this.createNewGame(player1, map, mod, player2);
        }
    }
};
exports.GameGeteway = GameGeteway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGeteway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("CREATE"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGeteway.prototype, "createGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("RANDOM"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGeteway.prototype, "randomGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("JOIN"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGeteway.prototype, "joinToGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("PLAY"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGeteway.prototype, "beginningGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("UPDATE"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGeteway.prototype, "updatePaddle", null);
exports.GameGeteway = GameGeteway = __decorate([
    (0, websockets_1.WebSocketGateway)(8881, {
        cors: {
            origin: ['http://localhost:3000']
        }
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GameGeteway);
//# sourceMappingURL=game.gateway.js.map