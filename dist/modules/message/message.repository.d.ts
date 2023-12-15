import { ConversationDto } from "src/DTOs/conversation/conversation.dto";
import { messageDto } from "src/DTOs/message/message.dto";
import { PrismaService } from "src/modules/database/prisma.service";
export declare class messageRepository {
    private Primsa;
    constructor(Primsa: PrismaService);
    CreateMesasge(message: messageDto): Promise<messageDto>;
    getMessages(_conversation: ConversationDto, requesterId: string): Promise<any>;
    DeleteMessage(id: string): Promise<string>;
}
