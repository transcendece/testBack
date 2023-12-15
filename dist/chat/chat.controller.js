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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const friend_dto_1 = require("../DTOs/friends/friend.dto");
const conversation_repository_1 = require("../modules/conversation/conversation.repository");
const friends_repository_1 = require("../modules/friends/friends.repository");
const invites_repository_1 = require("../modules/invites/invites.repository");
const users_repository_1 = require("../modules/users/users.repository");
const chat_service_1 = require("./chat.service");
const channel_dto_1 = require("../DTOs/channel/channel.dto");
const channel_params_dto_1 = require("../DTOs/channel/channel.params.dto");
const conversation_dto_1 = require("../DTOs/chat/conversation.dto");
const message_repository_1 = require("../modules/message/message.repository");
const jwt_guard_1 = require("../auth/Guards/jwt.guard");
const settings_user_dto_1 = require("../DTOs/settings/settings.user.dto");
let ChatController = class ChatController {
    constructor(conversation, user, invite, friend, channel, message) {
        this.conversation = conversation;
        this.user = user;
        this.invite = invite;
        this.friend = friend;
        this.channel = channel;
        this.message = message;
    }
    async getUserMessages(req, res) {
        try {
            let _user = await this.user.getUserById(req.user.id);
            let data = [];
            if (_user) {
                let conversations = await this.conversation.getConversations(_user.id);
                if (conversations) {
                    for (let index = 0; index < conversations.length; index++) {
                        let tmp = new conversation_dto_1.frontData;
                        let _sender = await this.user.getUserById(conversations[index].senderId);
                        let _reciever = await this.user.getUserById(conversations[index].recieverId);
                        if (_sender && _reciever && !_sender.bandUsers.includes(_reciever.id) && !_reciever.bandUsers.includes(_sender.id)) {
                            tmp.Conversationid = conversations[index].id;
                            tmp.owner = _user.username;
                            tmp.avatar = (_user.username == _sender.username) ? _reciever.avatar : _sender.avatar;
                            tmp.username = (_user.username == _sender.username) ? _reciever.username : _sender.username;
                            tmp.online = false;
                            tmp.id = 0;
                            tmp.updatedAt = conversations[index].updatedAt;
                            tmp.messages = await this.message.getMessages(conversations[index], req.user.id);
                            data.push(tmp);
                        }
                    }
                }
                else {
                    let empty;
                    empty.messages = [];
                    empty.Conversationid = null;
                    empty.avatar = null;
                    empty.online = false;
                    empty.owner = null;
                    empty.username = null;
                    res.status(200).json(empty);
                    return;
                }
                data.sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf());
                let index = 0;
                data.forEach((_data) => {
                    _data.id = index++;
                });
                res.status(200).json(data);
                return;
            }
            else
                throw ('invalid User .');
        }
        catch (error) {
            res.status(400).json('invalid User ...');
        }
    }
    async getChannels(req, res) {
        try {
            console.log("Sending data to : ", req.user.username);
            let channelRes = {
                channels: [],
                username: req.user.username,
            };
            let data = await this.channel.getUserChannels(req.user.username);
            if (data) {
                for (let index = 0; index < data.length; index++) {
                    channelRes.channels.push({
                        messages: [],
                        channelName: data[index].name
                    });
                }
                res.status(200).json(channelRes);
                return;
            }
            else {
                res.sendStatus(400);
                throw "invalid data ..";
            }
        }
        catch (error) {
            res.status(400);
        }
    }
    async getChannelsMessages(req, _channel, res) {
        try {
            console.log("recieved : ", _channel);
            let data = await this.channel.getChannelMessages(_channel);
            res.status(200).json(data);
        }
        catch (error) {
            console.log("erroriiiiiii ");
            res.status(400);
        }
    }
    async channelSettings(req, res) {
        let tmpUser = await this.user.getUserById(req.user.id);
        if (!tmpUser) {
            return;
        }
        console.log("requster ======>  : ", tmpUser);
        let data = await this.channel.getChannelSettingsData(tmpUser.username);
        let SettingsData = [];
        data.forEach((channel) => {
            SettingsData.push({
                channelName: channel.name,
                users: channel.users,
                admins: channel.admins,
                bandUsers: channel.bannedUsers,
                mutedUsers: channel.mutedUsersId
            });
        });
        res.status(200).json(SettingsData);
    }
    async getUserDataForSettings(req, res) {
        try {
            let data = new settings_user_dto_1.UserSettingsDto();
            let userData = await this.user.getUserById(req.user.id);
            let invitations = await this.invite.getUserInviations(req.user.id);
            let friends = await this.friend.getFriends(req.user.id);
            if (userData) {
                data.bandUsers = userData.bandUsers;
                if (invitations) {
                    for (let index = 0; index < invitations.length; index++) {
                        if (!data.bandUsers.includes(invitations[index].invitationSenderId)) {
                            let tmp = await this.user.getUserById(invitations[index].invitationSenderId);
                            if (tmp) {
                                data.invitations.push(tmp.username);
                            }
                        }
                    }
                }
                if (friends) {
                    let tmp;
                    for (let index = 0; index < friends.length; index++) {
                        if (friends[index].inviteRecieverId == req.user.id && !data.bandUsers.includes(friends[index].inviteSenderId)) {
                            tmp = await this.user.getUserById(friends[index].inviteSenderId);
                            if (tmp)
                                data.friends.push(tmp.username);
                        }
                        else if (friends[index].inviteSenderId == req.user.id && !data.bandUsers.includes(friends[index].inviteRecieverId)) {
                            tmp = await this.user.getUserById(friends[index].inviteRecieverId);
                            if (tmp)
                                data.friends.push(tmp.username);
                        }
                    }
                }
                let banUsernames = [];
                if (data.bandUsers) {
                    for (let index = 0; index < data.bandUsers.length; index++) {
                        let tmpUser = await this.user.getUserById(data.bandUsers[index]);
                        if (tmpUser)
                            banUsernames.push(tmpUser.username);
                    }
                }
                data.bandUsers = banUsernames;
                data.user = req.user.id;
                res.status(200).json({ data });
            }
            else {
                res.status(400).json({ message: "User dosen't exist in database ..." });
            }
        }
        catch (error) {
            res.status(400).json({ message: "Error ..." });
        }
    }
    async removeFriend(req, username) {
        try {
            console.log("recived a request ////////////   ===> ", username);
            let tmp = await this.user.getUserByUsername(username);
            if (tmp)
                return await this.friend.deleteFriend(tmp.id, req.user.id);
        }
        catch (error) {
            console.log(error);
        }
    }
    async SendInvitation(username, req, res) {
        try {
            if (req.user.username == username) {
                res.status(400).json("Sir tel3eb");
                return;
            }
            let invitation = {
                invitationRecieverId: "",
                invitationSenderId: "",
                inviteStatus: 0,
            };
            let tmpUser = await this.user.getUserByUsername(username);
            if (!tmpUser) {
                res.sendStatus(400);
                return;
            }
            invitation.invitationSenderId = req.user.id;
            invitation.invitationRecieverId = tmpUser.id;
            let tmp = await this.invite.createInvite(invitation);
            if (tmp == null) {
                res.status(400).json("Already friends .");
                return;
            }
            else {
                console.log("succes");
                res.status(200).json(tmp);
                return;
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ message: "Error ..." });
        }
    }
    async createChannel(channelData, req, res) {
        try {
            console.log(channelData);
            let test = await this.channel.createChannel(channelData, req.user.id);
            console.log(test);
            let data = {
                bandUsers: [],
                admins: [],
                channelName: "",
                mutedUsers: [],
                users: []
            };
            this.user.updateAcheivement('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699323620/qodwzbr6cxd74m14i4ad.png', req.user.id);
            if (test) {
                data.admins = test.admins;
                data.bandUsers = test.bannedUsers;
                data.channelName = test.name;
                data.mutedUsers = test.mutedUsersId;
                data.users = test.users;
            }
            res.status(200).json(data);
        }
        catch (error) {
            res.status(400).json("invalid Data .");
        }
    }
    async BanUser(req, username, res) {
        try {
            console.log("hahowaaaa ====> ", username);
            let userToBan = await this.user.getUserByUsername(username);
            let requester = await this.user.getUserById(req.user.id);
            if (userToBan && requester && !requester.bandUsers.includes(userToBan.id)) {
                let tmp = await this.channel.BanUser(req.user, userToBan);
                res.status(200).json(username);
                return;
            }
            else {
                res.status(400).json("user dosen't exist in database .");
            }
        }
        catch (error) {
            res.status(400).json("user dosen't exist in database .");
        }
    }
    async unBanUser(req, username, res) {
        try {
            let userTounBan = await this.user.getUserByUsername(username);
            let requester = await this.user.getUserById(req.user.id);
            if (userTounBan && requester && requester.bandUsers.includes(userTounBan.username)) {
                let tmp = await this.channel.unBanUser(req.user, userTounBan);
                console.log(tmp);
                res.status(200).json(userTounBan);
            }
            else
                res.status(400).json("user dosen't exist in database .");
        }
        catch (error) {
            res.status(400).json("user dosen't exist in database .");
        }
    }
    async muteUser(req, channel, username, res) {
        try {
            console.log("params to mute :  username :", username, " channel : ", channel);
            let UsernameToMute = await this.user.getUserByUsername(username);
            let tmpChannel = await this.channel.getChannelByName(channel);
            console.log(UsernameToMute, tmpChannel);
            if (UsernameToMute && tmpChannel) {
                if (!tmpChannel.admins.includes(req.user.username))
                    throw ("not channel owner.");
                if (!tmpChannel.bannedUsers.includes(UsernameToMute.username)) {
                    await this.channel.muteUser(UsernameToMute.username, channel);
                    res.status(200).json(username);
                    return;
                }
                else {
                    res.status(200).json("Already Muted ...");
                    return;
                }
            }
            res.status(400).json("unauthorized ...");
        }
        catch (error) {
            res.status(400).json("NEED AUTH ...");
        }
    }
    async addUserToChannel(channelName, username, req, res) {
        try {
            let channel = await this.channel.getChannelByName(channelName.name);
            let tmpUser = await this.user.getUserByUsername(username);
            if (tmpUser && channel) {
                console.log("protection : ", channel.IsProtected);
                if (channel.users.includes(tmpUser.id))
                    return "already in channel .";
                if (channel.IsProtected) {
                    console.log(channelName.password, channel.passwordHash);
                    await this.channel.checkPassword(channelName.password, channel.password).then(isMatch => {
                        if (!isMatch) {
                            res.status(400).json("INVALID PASSWORD ...");
                            return;
                        }
                    });
                }
                if (channel.IsPrivate && req.user.id == channel.owner) {
                    await this.channel.addUserToChannel(tmpUser.username, channel);
                }
                else if (!channel.IsPrivate) {
                    await this.channel.addUserToChannel(tmpUser.username, channel);
                }
            }
            res.status(200).json(username);
        }
        catch (error) {
            res.status(400).json("INVALID REQUEST ...");
        }
    }
    async removeUserFromChannel(req, data, res) {
        try {
            let tmpUser = await this.user.getUserByUsername(data.username);
            let tmpchannel = await this.channel.getChannelByName(data.channelName);
            if (tmpUser && tmpchannel && tmpchannel.admins.includes(req.user.username) && tmpchannel.users.includes(tmpUser.username)) {
                if (tmpUser.username == tmpchannel.owner && req.user.username == tmpchannel.owner)
                    await this.channel.removeUserFromChannel(tmpUser.username, tmpchannel.id);
                else if (tmpUser.username != tmpchannel.owner)
                    await this.channel.removeUserFromChannel(tmpUser.username, tmpchannel.id);
                let check = await this.channel.getChannelByName(data.channelName);
                if (check && !check.users.length)
                    await this.channel.deleteChannel(check.id);
                console.log(check.users);
            }
            res.status(200).json(data.username);
        }
        catch (error) {
            res.status(400).json("KO");
        }
    }
    async banUserFromChannel(req, data, res) {
        try {
            let channelTmp = await this.channel.getChannelByName(data.channelName);
            let userTmp = await this.user.getUserByUsername(data.username);
            console.log(req.user.username);
            if (channelTmp && userTmp && channelTmp.admins.includes(req.user.username)) {
                console.log('here ...');
                if (userTmp.id == channelTmp.owner && userTmp.id == req.user.id)
                    await this.channel.banUserFromChannel(data.username, data.channelName);
                else if (userTmp.id != channelTmp.owner)
                    await this.channel.banUserFromChannel(data.username, data.channelName);
                res.status(200).json(data.username);
            }
            else {
                res.status(400).json("UnAuthorized action ...");
            }
        }
        catch (error) {
            res.status(400).json("can't ban user .");
        }
    }
    async deleteInvite(req, username, res) {
        try {
            let tmpUser = await this.user.getUserByUsername(username);
            if (!tmpUser) {
                res.status(400).json("user dosen't exist in database ...");
                return;
            }
            let find = await this.invite.getInviteToValidate(tmpUser.id, req.user.id);
            if (find)
                await this.invite.deleteInvite(find.id);
            console.log('deleted ...');
            res.status(200);
        }
        catch (error) {
            res.status(400);
        }
    }
    async unBanUserFromChannel(req, data, res) {
        try {
            console.log("recieved data ===> : ", data);
            let channelTmp = await this.channel.getChannelByName(data.channelName);
            let userTmp = await this.user.getUserByUsername(data.username);
            if (channelTmp && userTmp && channelTmp.admins.includes(req.user.username) && channelTmp.bannedUsers.includes(userTmp.username)) {
                await this.channel.unBanUserFromChannel(data.username, data.channelName);
                res.status(200).json(data.username);
                return;
            }
            res.status(200).json(data.username);
        }
        catch (error) {
            res.status(400).json("can't remove ban .");
        }
    }
    async accepteInvite(req, username, res) {
        try {
            console.log('at least got here ??');
            let tmpUser = await (await this.user.getUserByUsername(username));
            let invitationSenderId = tmpUser.id;
            let invitationRecieverId = req.user.id;
            let tmp = await this.invite.getInviteToValidate(invitationSenderId, invitationRecieverId);
            console.log("tmp ===> : ", tmp);
            if (!tmp) {
                res.status(400).json("no Invite to accepte");
                return;
            }
            console.log("invite ====> ", username);
            await this.invite.deleteInvite(tmp.id);
            let data = await this.friend.createFriend(new friend_dto_1.FriendDto(invitationRecieverId, invitationSenderId, ''), req.user.id);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(400);
        }
    }
    async addAdminToChannel(req, data, res) {
        try {
            let _user = await this.user.getUserByUsername(data.username);
            if (_user)
                await this.channel.assignAdminToChannel(_user, data.channelName);
            res.status(200).json(data.username);
        }
        catch (error) {
            res.status(400);
        }
    }
    async removeAdminFromChannel(req, data, res) {
        try {
            let channel = await this.channel.getChannelByName(data.channelName);
            let userTmp = await this.user.getUserByUsername(data.username);
            if (userTmp && channel && channel.admins.includes(req.user.id)) {
                if (channel.owner == userTmp.id && req.user.id == channel.owner)
                    await this.channel.removeAdminPrivilageToUser(data.username, data.channelName);
                else if (channel.owner != userTmp.id)
                    await this.channel.removeAdminPrivilageToUser(data.username, data.channelName);
            }
            res.status(200).json(data.username);
        }
        catch (error) {
            res.status(400);
        }
    }
    async addPasswordToChannel(channleData, req, res) {
        try {
            let channel = await this.channel.getChannelByName(channleData.name);
            if (channel && channel.owner == req.user.id) {
                await this.channel.setPasswordToChannel(channleData.password, channleData.name);
            }
            res.status(200);
        }
        catch (error) {
            res.status(400);
        }
    }
    async removePasswordToChannel(data, req, res) {
        try {
            let channel = await this.channel.getChannelByName(data.channelName);
            if (channel && channel.owner == req.user.id) {
                await this.channel.unsetPasswordToChannel(data.channelName);
            }
            res.status(200);
        }
        catch (error) {
            res.status(400);
        }
    }
    async getChannelMessages(data, req, res) {
        try {
            let endValue = [];
            let check_channel = await this.channel.getChannelByName(data.channelName);
            if (check_channel && check_channel.users.includes(req.user.id)) {
                endValue = await this.channel.getChannelMessages(data.channelName);
            }
            res.status(200).json(endValue);
        }
        catch (error) {
            res.status(400);
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserMessages", null);
__decorate([
    (0, common_1.Get)('channel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Post)('channel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('_channel')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannelsMessages", null);
__decorate([
    (0, common_1.Get)('channelSettings'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "channelSettings", null);
__decorate([
    (0, common_1.Get)('userSettings'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserDataForSettings", null);
__decorate([
    (0, common_1.Post)('removeFriend'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Body)('username')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "SendInvitation", null);
__decorate([
    (0, common_1.Post)('createChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_dto_1.channelDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Post)('BanUser'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "BanUser", null);
__decorate([
    (0, common_1.Post)('unBanUser'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unBanUser", null);
__decorate([
    (0, common_1.Post)('mute'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('channel')),
    __param(2, (0, common_1.Body)('username')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "muteUser", null);
__decorate([
    (0, common_1.Post)('ChannelAddUser'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_dto_1.channelDto, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addUserToChannel", null);
__decorate([
    (0, common_1.Post)('removeUserFromChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_params_dto_1.channelParams, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeUserFromChannel", null);
__decorate([
    (0, common_1.Post)('BanUserFromChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_params_dto_1.channelParams, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "banUserFromChannel", null);
__decorate([
    (0, common_1.Post)('deleteInvite'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteInvite", null);
__decorate([
    (0, common_1.Post)('unBanUserFromChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_params_dto_1.channelParams, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unBanUserFromChannel", null);
__decorate([
    (0, common_1.Post)('accepteInvite'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "accepteInvite", null);
__decorate([
    (0, common_1.Post)('addAdminToChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_params_dto_1.channelParams, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addAdminToChannel", null);
__decorate([
    (0, common_1.Post)('removeAdminToChannel'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_params_dto_1.channelParams, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeAdminFromChannel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    (0, common_1.Post)('addPasswordToChannel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_dto_1.channelDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addPasswordToChannel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    (0, common_1.Post)('removePasswordToChannel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_params_dto_1.channelParams, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removePasswordToChannel", null);
__decorate([
    (0, common_1.Post)('getChannelMessages'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_params_dto_1.channelParams, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannelMessages", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('Chat'),
    __metadata("design:paramtypes", [conversation_repository_1.converationRepositroy,
        users_repository_1.UsersRepository,
        invites_repository_1.InvitesRepository,
        friends_repository_1.FriendsRepository,
        chat_service_1.ChannelsService,
        message_repository_1.messageRepository])
], ChatController);
//# sourceMappingURL=chat.controller.js.map