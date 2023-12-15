import { chatDto } from "./chat.dto";
export declare class frontData {
    Conversationid: string;
    avatar: string;
    username: string;
    owner: string;
    online: boolean;
    updatedAt: Date;
    id: number;
    messages: chatDto[];
}
