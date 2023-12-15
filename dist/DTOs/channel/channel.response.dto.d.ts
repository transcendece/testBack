import { channelMessageDto } from "./channel.messages.dto";
export declare class channelsAsConversations {
    channels: channelData[];
    username: string;
}
declare class channelData {
    messages: channelMessageDto[];
    channelName: string;
}
export default channelsAsConversations;
