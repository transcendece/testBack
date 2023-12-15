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
exports.messageRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let messageRepository = class messageRepository {
    constructor(Primsa) {
        this.Primsa = Primsa;
    }
    async CreateMesasge(message) {
        this.Primsa.conversation.update({ where: { id: message.conversationId },
            data: {
                updatedAt: new Date
            }
        });
        return await this.Primsa.message.create({ data: {
                senderId: message.senderId,
                conversationId: message.conversationId,
                recieverId: message.recieverId,
                content: message.content,
                date: new Date()
            } });
    }
    async getMessages(_conversation, requesterId) {
        let messages = await this.Primsa.message.findMany({ where: {
                conversationId: _conversation.id
            },
            orderBy: {
                date: 'asc',
            },
        });
        let _user = await this.Primsa.user.findFirst({ where: { id: requesterId } });
        let _sender = await this.Primsa.user.findUnique({ where: { id: _conversation.senderId } });
        let _reciever = await this.Primsa.user.findUnique({ where: { id: _conversation.recieverId } });
        if (messages && _sender && _reciever && _user) {
            let data = [];
            messages.forEach((message) => {
                data.push({
                    isOwner: message.senderId == _user.username,
                    content: message.content,
                    avatar: (_sender.username == message.senderId) ? _sender.avatar : _reciever.avatar,
                    sender: (_sender.username == message.senderId) ? _sender.username : _reciever.username,
                    date: message.date,
                    conversationId: message.conversationId
                });
            });
            return data;
        }
        else if (!_sender || !_reciever || !_user)
            throw ('invalid data.');
    }
    async DeleteMessage(id) {
        await this.Primsa.message.delete({ where: { id } });
        return "deleted";
    }
};
exports.messageRepository = messageRepository;
exports.messageRepository = messageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], messageRepository);
//# sourceMappingURL=message.repository.js.map