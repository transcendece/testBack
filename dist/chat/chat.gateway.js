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
exports.ChatGateway = void 0;
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const channel_messages_dto_1 = require("../DTOs/channel/channel.messages.dto");
const message_dto_1 = require("../DTOs/message/message.dto");
const conversation_repository_1 = require("../modules/conversation/conversation.repository");
const message_repository_1 = require("../modules/message/message.repository");
const users_repository_1 = require("../modules/users/users.repository");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("../DTOs/chat/chat.dto");
let ChatGateway = class ChatGateway {
    constructor(jwtService, user, conversation, message, channel) {
        this.jwtService = jwtService;
        this.user = user;
        this.conversation = conversation;
        this.message = message;
        this.channel = channel;
        this.clientsMap = new Map();
    }
    async handleConnection(client, ...args) {
        try {
            console.log("new connection ....");
            let cookie = client.client.request.headers.cookie;
            console.log("00000000000 cookie 00000000000 >>>>> ", cookie);
            if (cookie) {
                const jwt = cookie.substring(cookie.indexOf('=') + 1);
                let user;
                user = this.jwtService.verify(jwt);
                console.log(user);
                if (user) {
                    const test = await this.user.getUserById(user.sub);
                    if (test) {
                        console.log("map :=====>", this.clientsMap.has(test.id));
                        let exist = this.clientsMap.has(test.id);
                        if (exist) {
                            client.emit('ERROR', "YOU ARE ALREADY CONNECTED ...");
                            client.disconnect();
                        }
                        else {
                            this.clientsMap.set(test.id, client);
                            await this.user.updateUserOnlineStatus(true, user.sub);
                        }
                    }
                }
            }
            else {
                console.log("user dosen't exist in database");
                client.emit('ERROR', "RAH KAN3REF BAK, IHCHEM");
                client.disconnect();
            }
        }
        catch (error) {
            console.log("user dosen't exist in database");
            client.emit('ERROR', "RAH KAN3REF BAK, IHCHEM");
            client.disconnect();
            console.log("invalid data : check JWT or DATABASE QUERIES");
        }
    }
    async handleDisconnect(client) {
        let cookie = client.client.request.headers.cookie;
        if (cookie) {
            const jwt = cookie.substring(cookie.indexOf('=') + 1);
            console.log('here is the jwt : ', jwt);
            let user;
            user = this.jwtService.verify(jwt);
            if (user) {
                const test = await this.user.getUserById(user.sub);
                if (test) {
                    console.log(test.id);
                    await this.user.updateUserOnlineStatus(false, test.id);
                    console.log(`this is a test : ${test.id} ****`);
                }
                this.clientsMap.delete(test.id);
            }
        }
    }
    async handleChannelMessage(message, client) {
        try {
            console.log("0 ===> ", message);
            let cookie = client.client.request.headers.cookie;
            if (cookie) {
                const jwt = cookie.substring(cookie.indexOf('=') + 1);
                let user;
                user = await this.jwtService.verify(jwt);
                if (user) {
                    console.log("1");
                    const _user = await this.user.getUserById(user.sub);
                    if (_user) {
                        if (!_user.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322994/vp6r4ephqymsyrzxgd0h.png')) {
                            await this.user.updateAcheivement('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322994/vp6r4ephqymsyrzxgd0h.png', _user.id);
                        }
                        let channel = await this.channel.getChannelByName(message.channelName);
                        if (channel && channel.users.includes(_user.username)) {
                            let muted = await this.channel.isMuted(_user.username, channel.id);
                            console.log("3");
                            message.sender = _user.username;
                            if (!muted) {
                                console.log("storing channel message : ", message);
                                await this.channel.createChannelMessage(message);
                                channel.users.forEach(async (__user) => {
                                    let tmp = await this.user.getUserByUsername(__user);
                                    if (tmp) {
                                        let socket = this.clientsMap.get(tmp.id);
                                        if (socket) {
                                            console.log("emiting to : ", __user);
                                            socket.emit('channelMessage', message);
                                        }
                                    }
                                });
                            }
                        }
                        else {
                            console.log("4");
                            let socket = this.clientsMap.get(_user.id);
                            if (socket) {
                                socket.emit('ERROR', 'SERVER : your not in channel .');
                            }
                        }
                    }
                }
            }
            else
                throw ('unAuthorized Action ....');
        }
        catch (error) {
            console.log(error);
        }
    }
    async hanldeMessage(message, client) {
        try {
            let cookie = client.client.request.headers.cookie;
            if (cookie) {
                const jwt = cookie.substring(cookie.indexOf('=') + 1);
                let user;
                user = this.jwtService.verify(jwt);
                if (user) {
                    const sender = await this.user.getUserById(user.sub);
                    const reciever = await this.user.getUserByUsername(message.recieverId);
                    if (!sender || !reciever || (sender.id == reciever.id)) {
                        throw ("invalid data : Wrong sender or reciever info.");
                    }
                    if (reciever.bandUsers.includes(sender.id)) {
                        throw ("a banned user can't send messages .");
                    }
                    let achievementCheck = await this.conversation.numberOfConversations(sender.id);
                    if (achievementCheck > 0) {
                        if (!sender.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322994/vp6r4ephqymsyrzxgd0h.png')) {
                            await this.user.updateAcheivement('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322994/vp6r4ephqymsyrzxgd0h.png', sender.id);
                            console.log('added first message');
                        }
                    }
                    let conversations = await this.conversation.findConversations(reciever.id, sender.id);
                    if (!conversations) {
                        const tmp = await this.conversation.createConversation(reciever.id, sender.id);
                        message.conversationId = tmp.id;
                        await this.sendToSocket(message);
                    }
                    else {
                        message.conversationId = conversations.id;
                        await this.sendToSocket(message);
                    }
                }
            }
            else {
                throw ('invalid Request : not Authorized ...');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendToSocket(message) {
        try {
            console.log('message in send socket : ', message);
            let _reciever = await this.user.getUserByUsername(message.recieverId);
            if (_reciever) {
                const socket = this.clientsMap.get(_reciever.id);
                await this.message.CreateMesasge(message);
                if (socket) {
                    this.conversation.updateConversationDate(message.conversationId);
                    let data = new chat_dto_1.chatDto;
                    data.content = message.content;
                    data.sender = message.senderId;
                    data.avatar = _reciever.avatar;
                    data.isOwner = false;
                    data.conversationId = message.conversationId;
                    socket.emit('RecieveMessage', data);
                }
                else {
                    this.conversation.updateConversationDate(message.conversationId);
                    console.error(`Socket with ID ${message.recieverId} not found.`);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('channelMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_messages_dto_1.channelMessageDto, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleChannelMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('SendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.messageDto, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "hanldeMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(8888, {
        cors: {
            origin: ['http://localhost:3000'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, users_repository_1.UsersRepository, conversation_repository_1.converationRepositroy, message_repository_1.messageRepository, chat_service_1.ChannelsService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map