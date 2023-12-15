import { UserDto } from "src/DTOs/User/user.dto";
import { converationRepositroy } from "src/modules/conversation/conversation.repository";
import { FriendsRepository } from "src/modules/friends/friends.repository";
import { InvitesRepository } from "src/modules/invites/invites.repository";
import { UsersRepository } from "src/modules/users/users.repository";
import { ChannelsService } from "./chat.service";
import { channelDto } from "src/DTOs/channel/channel.dto";
import { Request, Response } from "express";
import { channelParams } from "src/DTOs/channel/channel.params.dto";
import { messageRepository } from "src/modules/message/message.repository";
export declare class ChatController {
    private conversation;
    private user;
    private invite;
    private friend;
    private channel;
    private message;
    constructor(conversation: converationRepositroy, user: UsersRepository, invite: InvitesRepository, friend: FriendsRepository, channel: ChannelsService, message: messageRepository);
    getUserMessages(req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    getChannels(req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    getChannelsMessages(req: Request & {
        user: UserDto;
    }, _channel: string, res: Response): Promise<any>;
    channelSettings(req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    getUserDataForSettings(req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    removeFriend(req: Request & {
        user: UserDto;
    }, username: string): Promise<any>;
    SendInvitation(username: string, req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    createChannel(channelData: channelDto, req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    BanUser(req: Request & {
        user: UserDto;
    }, username: string, res: Response): Promise<any>;
    unBanUser(req: Request & {
        user: UserDto;
    }, username: string, res: Response): Promise<any>;
    muteUser(req: Request & {
        user: UserDto;
    }, channel: string, username: string, res: Response): Promise<any>;
    addUserToChannel(channelName: channelDto, username: string, req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
    removeUserFromChannel(req: Request & {
        user: UserDto;
    }, data: channelParams, res: Response): Promise<any>;
    banUserFromChannel(req: Request & {
        user: UserDto;
    }, data: channelParams, res: Response): Promise<void>;
    deleteInvite(req: Request & {
        user: UserDto;
    }, username: string, res: Response): Promise<any>;
    unBanUserFromChannel(req: Request & {
        user: UserDto;
    }, data: channelParams, res: Response): Promise<void>;
    accepteInvite(req: Request & {
        user: UserDto;
    }, username: string, res: Response): Promise<any>;
    addAdminToChannel(req: Request & {
        user: UserDto;
    }, data: channelParams, res: Response): Promise<void>;
    removeAdminFromChannel(req: Request & {
        user: UserDto;
    }, data: channelParams, res: Response): Promise<void>;
    addPasswordToChannel(channleData: channelDto, req: Request & {
        user: UserDto;
    }, res: Response): Promise<void>;
    removePasswordToChannel(data: channelParams, req: Request & {
        user: UserDto;
    }, res: Response): Promise<void>;
    getChannelMessages(data: channelParams, req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
}
