import { Server, Socket } from "socket.io";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Vector } from 'matter-js';
export declare class GameGeteway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private clients;
    private Random;
    private friendGame;
    private randomQueue;
    private gameDe;
    constructor();
    handleConnection(client: Socket, ...args: any[]): Promise<void>;
    handleDisconnect(client: Socket): void;
    createGame(req: {
        clientId: string;
        map: string;
        mod: string;
    }): void;
    randomGame(req: {
        clientId: string;
        map: string;
        mod: string;
    }): void;
    joinToGame(req: {
        clientId: string;
        gameId: string;
    }): void;
    beginningGame(req: {
        clientId: string;
        gameId: string;
    }): void;
    updatePaddle(req: {
        clientId: string;
        gameId: string;
        vec: Vector;
    }): void;
    private createNewGame;
    private sendPlayDemand;
    private createRandomGame;
}
