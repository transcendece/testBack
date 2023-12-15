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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const matter_js_1 = require("matter-js");
const socket_io_1 = require("socket.io");
const game_dto_1 = require("../DTOs/game/game.dto");
const width = 600;
const height = 800;
const paddleWidth = 125;
const paddleHeight = 20;
const maxScore = 4;
const AdvancedObs = [matter_js_1.Bodies.rectangle(width / 2, height / 2, 800, 10, { isStatic: true, label: "ADV" })];
const IntemidierObs = [matter_js_1.Bodies.rectangle(width / 2, height / 2, 400, 10, { isStatic: true, label: "INTE" })];
let GameService = class GameService {
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    constructor(client, gameId, map, mode) {
        this.id = gameId;
        this.player1Id = client.id;
        this.client1 = client;
        this.map = map;
        this.mode = mode;
        this.serve = true;
        this.isRunning = true;
        this.score1 = 0;
        this.score2 = 0;
        this.engine = matter_js_1.Engine.create({
            gravity: { x: 0, y: 0, scale: 0.001 },
            positionIterations: 10,
            velocityIterations: 8,
        });
        this.runner = matter_js_1.Runner.create();
        this.ball = matter_js_1.Bodies.circle(width / 2, height / 2, 10, {
            restitution: 1,
            frictionAir: 0,
            friction: 0,
            inertia: Infinity,
            label: "ball"
        });
        matter_js_1.Body.setVelocity(this.ball, { x: 5, y: 5 });
        this.p1 = matter_js_1.Bodies.rectangle(width / 2, 780, paddleWidth, paddleHeight, {
            isStatic: true,
            chamfer: { radius: 10 },
        });
        this.p2 = matter_js_1.Bodies.rectangle(width / 2, 20, paddleWidth, paddleHeight, {
            isStatic: true,
            chamfer: { radius: 10 },
        });
        this.grounds = [
            matter_js_1.Bodies.rectangle(0, 0, 1200, 10, { isStatic: true, label: "TOP" }),
            matter_js_1.Bodies.rectangle(0, 800, 1200, 10, { isStatic: true, label: "DOWN" }),
            matter_js_1.Bodies.rectangle(0, 0, 10, 1600, { isStatic: true, label: "LEFT" }),
            matter_js_1.Bodies.rectangle(600, 0, 10, 1600, { isStatic: true, label: "RIGHT" }),
        ];
        this.obstacles = [];
        if (this.map === game_dto_1.gameMaps.ADVANCED) {
            this.obstacles = AdvancedObs;
            this.maxVelocity = 20;
            if (this.mode === game_dto_1.gameMods.DEFI)
                this.maxScore = 7;
            else
                this.maxTime = 5;
        }
        else if (this.map === game_dto_1.gameMaps.INTEMIDIER) {
            this.obstacles = IntemidierObs;
            this.maxVelocity = 15;
            if (this.mode === game_dto_1.gameMods.DEFI)
                this.maxScore = 5;
            else
                this.maxTime = 3;
        }
        else {
            this.maxVelocity = 10;
            if (this.mode === game_dto_1.gameMods.DEFI)
                this.maxScore = 4;
            else
                this.maxTime = 1;
        }
    }
    startGame() {
        this.client1.emit("START", {
            "ID": 1,
            "ball": this.ball.position,
            "p1": this.p1.position,
            "p2": this.p2.position,
            "score1": this.score1,
            "score2": this.score2,
        });
        this.client2.emit("START", {
            "ID": 2,
            "ball": this.reverseVector(this.ball.position),
            "p1": this.reverseVector(this.p1.position),
            "p2": this.reverseVector(this.p2.position),
            "score1": this.score1,
            "score2": this.score2,
        });
        matter_js_1.Runner.run(this.runner, this.engine);
        matter_js_1.Composite.add(this.engine.world, [this.p1, this.p2, ...this.grounds, ...this.obstacles]);
        this.spownBall();
        this.checkBallPosition();
        try {
            matter_js_1.Events.on(this.engine, "collisionStart", event => {
                let stop = false;
                event.pairs.forEach((pair) => {
                    const bodyA = pair.bodyA;
                    const bodyB = pair.bodyB;
                    if (bodyA === this.ball || bodyB == this.ball) {
                        const normal = pair.collision.normal;
                        const Threshold = 0.1;
                        if (Math.abs(normal.x) < Threshold) {
                            const sign = Math.sign(this.ball.velocity.x);
                            const i = 0.5;
                            matter_js_1.Body.setVelocity(this.ball, {
                                x: Math.min(this.ball.velocity.x + sign * i, this.maxVelocity),
                                y: this.ball.velocity.y
                            });
                            const restitution = 1;
                            const friction = 0;
                        }
                        const otherBody = bodyA === this.ball ? bodyB : bodyA;
                        if (otherBody.label === "TOP" || otherBody.label === "DOWN") {
                            if (otherBody.label === "TOP")
                                this.score2++;
                            else if (otherBody.label === "DOWN")
                                this.score1++;
                            matter_js_1.Body.setPosition(this.ball, { x: 300, y: 400 });
                            matter_js_1.Body.setVelocity(this.ball, { x: 5, y: -5 });
                        }
                    }
                });
                if (this.score1 === maxScore || this.score2 === maxScore) {
                    this.score1 === maxScore ? this.client1.emit("WinOrLose", { content: "win" }) : this.client2.emit("WinOrLose", { content: "win" });
                    this.score1 === maxScore ? this.client2.emit("WinOrLose", { content: "lose" }) : this.client1.emit("WinOrLose", { content: "lose" });
                    this.stop();
                }
            });
        }
        catch (error) {
            console.log("got an error ....");
        }
        matter_js_1.Events.on(this.engine, "afterUpdate", () => {
            this.client1.emit('UPDATE', {
                "ball": this.ball.position,
                "p1": this.p1.position,
                "p2": this.p2.position,
                "score1": this.score1,
                "score2": this.score2,
            });
            this.client2.emit('UPDATE', {
                "ball": this.reverseVector(this.ball.position),
                "p1": this.reverseVector(this.p1.position),
                "p2": this.reverseVector(this.p2.position),
                "score1": this.score1,
                "score2": this.score2,
            });
        });
    }
    setPlayer1(sock, id) {
        this.player1Id = id;
        this.client1 = sock;
    }
    setPlayer2(sock, id) {
        this.player2Id = id;
        this.client2 = sock;
    }
    getPlayer1() {
        return this.client1;
    }
    getPlayer2() {
        return this.client2;
    }
    ifPlayerInGame(id) {
        if (id === this.player1Id || id === this.player2Id)
            return true;
        return false;
    }
    reverseVector(vector) {
        return ({ x: width - vector.x, y: height - vector.y });
    }
    checkBallPosition() {
        setInterval(() => {
        }, 1000 / 60);
    }
    spownBall() {
        if (!this.isRunning) {
            this.isRunning = !this.isRunning;
            matter_js_1.Runner.run(this.runner, this.engine);
            return;
        }
        let forceX = -1.3;
        let forceY = -1.2;
        if (this.serve) {
            forceX = 1.3;
            forceY = 1.2;
        }
        this.serve = !this.serve;
        setTimeout(() => {
            matter_js_1.Composite.add(this.engine.world, this.ball);
        }, 1000);
    }
    stop() {
        matter_js_1.Runner.stop(this.runner);
        matter_js_1.Engine.clear(this.engine);
        this.isRunning = false;
    }
    run() {
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Number, Number])
], GameService);
//# sourceMappingURL=game.service.js.map