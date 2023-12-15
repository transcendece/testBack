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
exports.ChannelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../modules/database/prisma.service");
const bcrypt = require("bcrypt");
const console_1 = require("console");
let ChannelsService = class ChannelsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createChannel(channelData, id) {
        try {
            console.log(`the users id ${id}`);
            let tmp = [id];
            let check = await this.getChannelByName(channelData.name);
            let tmpUser = await this.prisma.user.findUnique({ where: { id: id } });
            let users = [tmpUser.username];
            if (check || !tmpUser) {
                return `couldn't creat channel`;
            }
            console.log(channelData);
            if (channelData.name) {
                let _tmp = ['', ''];
                if (channelData.IsProtected) {
                    _tmp = await this.hashPassword(channelData.password);
                }
                else {
                    _tmp[0] = '';
                    _tmp[1] = '';
                }
                console.log("ahahahaahahh", _tmp);
                let channel = await this.prisma.channel.create({ data: {
                        name: channelData.name,
                        admins: users,
                        users: users,
                        owner: tmpUser.id,
                        IsPrivate: channelData.IsPrivate,
                        IsProtected: channelData.IsProtected,
                        password: _tmp[1],
                        passwordHash: _tmp[0]
                    } });
                tmpUser.channels.push(channel.name);
                await this.prisma.user.update({
                    where: { id: id },
                    data: { channels: tmpUser.channels },
                });
                return channel;
            }
            else
                return 'wrong data';
        }
        catch (error) {
            console.log(error);
        }
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt();
        let tmp = [];
        tmp.push(salt);
        console.log("hash : ", salt);
        let pass = await bcrypt.hash(password, salt);
        tmp.push(pass);
        console.log("pass : ", pass);
        return tmp;
    }
    async checkPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async muteUser(id, channel) {
        try {
            const now = new Date();
            let channelData = await this.prisma.channel.findFirst({ where: {
                    name: channel
                } });
            if (!channelData || channelData.mutedUsersId.includes(id))
                return null;
            let mute = await this.isMuted(id, channel);
            if (mute)
                return null;
            let tmp = channelData.mutedUsersId;
            tmp.push(id);
            let check = await this.prisma.mutedUser.create({
                data: {
                    userId: id,
                    channelId: channelData.id,
                    until: new Date(now.getTime() + 1 * 60 * 1000)
                }
            });
            console.log("muted User : ", check);
            await this.prisma.channel.update({ where: { id: channelData.id }, data: { mutedUsersId: tmp, } });
        }
        catch (error) {
            console.log(error);
        }
    }
    async isMuted(id, channel) {
        try {
            const now = new Date();
            const tmp = await this.prisma.mutedUser.findFirst({
                where: {
                    userId: id,
                    channelId: channel,
                },
            });
            console.log("--------***>>", tmp);
            if (tmp) {
                console.log("ban duration : ", tmp.until, " current time : ", now);
                if (tmp.until > now) {
                    return true;
                }
                else {
                    await this.unMuteUser(id, channel);
                }
            }
            else {
                await this.unMuteUser(id, channel);
            }
            return false;
        }
        catch (error) {
            console.log(error);
        }
    }
    async unMuteUser(id, channel) {
        let channelData = await this.prisma.channel.findFirst({ where: {
                id: channel,
            } });
        console.log("recieved Id : ", id, "recieverd channel name : ", channel);
        console.log("channel fetched data : ", channelData);
        if (channelData) {
            console.log("444444444444");
            let users = channelData.mutedUsersId;
            let index = users.indexOf(id);
            if (index != -1)
                users.splice(index, 1);
            await this.prisma.channel.update({ where: { id: channelData.id }, data: { mutedUsersId: users } });
            console.log("updated : ===> ", users);
            let tmp = await this.prisma.mutedUser.findFirst({ where: {
                    userId: id,
                    channelId: channel
                } });
            if (tmp) {
                await this.prisma.mutedUser.delete({ where: { id: tmp.id } });
                console.log("deleted : ===> ", tmp);
            }
        }
    }
    async createChannelMessage(message) {
        console.log('message recieved in channel : ', message);
        if (message) {
            console.log('creating channel message', message);
            return this.prisma.channelMessage.create({ data: {
                    sender: message.sender,
                    content: message.content,
                    channelName: message.channelName,
                } });
        }
    }
    async getUserChannels(id) {
        return await this.prisma.channel.findMany({ where: {
                users: {
                    has: id,
                }
            } });
    }
    async getChannelSettingsData(id) {
        return await this.prisma.channel.findMany({ where: {
                admins: {
                    has: id,
                }
            } });
    }
    async addUserToChannel(userId, _channel) {
        try {
            const user = await this.prisma.user.findFirst({ where: { username: userId } });
            const channel = await this.prisma.channel.findUnique({ where: { id: _channel.id } });
            let tmp = [];
            let userChannels = [];
            if (user && channel && !tmp.includes(userId) && !channel.bannedUsers.includes(userId)) {
                tmp = channel.users;
                userChannels = user.channels;
                userChannels.push(_channel.name);
                tmp.push(userId);
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { channels: userChannels },
                });
                return await this.prisma.channel.update({
                    where: { id: _channel.id },
                    data: { users: tmp },
                });
            }
        }
        catch (error) {
            console.log(`no such user or channel`);
            return 'error';
        }
    }
    async removeUserFromChannel(userId, channelId) {
        try {
            console.log('adam : ', userId, channelId);
            const user = await this.prisma.user.findFirst({ where: { username: userId } });
            const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
            let tmpUser = [];
            let tmpChannel = [];
            let adminChannel = [];
            if (user && channel && channel.users.includes(userId)) {
                for (let index = 0; index < user.channels.length; index++) {
                    if (user.channels[index] != channelId)
                        tmpUser.push(user.channels[index]);
                }
                for (let index = 0; index < channel.users.length; index++) {
                    if (channel.users[index] != userId)
                        tmpChannel.push(channel.users[index]);
                }
                console.log("channel Admins : ", channel.admins);
                if (channel.admins.includes(userId)) {
                    for (let index = 0; index < channel.admins.length; index++) {
                        console.log("<><><><><><><><><> ", index, channel.admins[index]);
                        if (channel.admins[index] != userId)
                            adminChannel.push(channel.admins[index]);
                    }
                    if (adminChannel.length == 0)
                        adminChannel = [];
                    await this.prisma.channel.update({
                        where: { id: channelId },
                        data: { admins: adminChannel },
                    });
                }
                if (tmpUser.length == 0) {
                    tmpUser = [];
                }
                if (tmpChannel.length == 0) {
                    tmpChannel = [];
                }
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { channels: tmpUser },
                });
                await this.prisma.channel.update({
                    where: { id: channelId },
                    data: { users: tmpChannel },
                });
            }
        }
        catch {
            console_1.error;
        }
        {
            console.log("error: //////////////////////////////////////////////////////////////////", console_1.error);
        }
    }
    async banUserFromChannel(username, channelName) {
        const user = await this.prisma.user.findFirst({ where: { username: username } });
        const channel = await this.prisma.channel.findUnique({ where: { name: channelName } });
        let Ban;
        console.log(channel);
        if (user && channel && !channel.bannedUsers.includes(user.username)) {
            Ban = channel.bannedUsers;
            await this.removeUserFromChannel(user.username, channel.id);
            Ban.push(user.username);
            console.log(Ban);
            return await this.prisma.channel.update({
                where: { id: channel.id },
                data: { bannedUsers: Ban }
            });
        }
    }
    async unBanUserFromChannel(username, channelName) {
        try {
            console.log('got here .....');
            let user = await this.prisma.user.findFirst({ where: { username: username } });
            let channel = await this.prisma.channel.findUnique({ where: { name: channelName } });
            let tmp = [];
            let _return;
            if (user && channel) {
                if (channel.bannedUsers.includes(user.username)) {
                    for (let index = 0; index < channel.bannedUsers.length; index++) {
                        if (user.username != channel.bannedUsers[index])
                            tmp.push(channel.bannedUsers[index]);
                    }
                    console.log(tmp);
                    _return = await this.prisma.channel.update({ where: { id: channel.id },
                        data: { bannedUsers: tmp } });
                }
                await this.addUserToChannel(user.username, channel);
                return _return;
            }
        }
        catch (error) {
            console.log('failed to unbanned user');
        }
    }
    async getChannelByName(channelName) {
        return await this.prisma.channel.findFirst({ where: { name: channelName } });
    }
    async assignAdminToChannel(user, channelName) {
        const channel = await this.prisma.channel.findUnique({ where: { name: channelName } });
        if (user && channel && channel.users.includes(user.id) && !channel.admins.includes(user.id)) {
            console.log('ghehehe');
            channel.admins.push(user.id);
            return await this.prisma.channel.update({ where: { id: channel.id },
                data: {
                    admins: channel.admins,
                } });
        }
    }
    async removeAdminPrivilageToUser(username, channelName) {
        let channel = await this.getChannelByName(channelName);
        let user = await this.prisma.user.findFirst({ where: { username: username } });
        let tmp = [];
        if (user && channel) {
            if (channel.admins.includes(user.id) && user.id != channel.owner) {
                for (let index = 0; index < channel.admins.length; index++) {
                    if (user.id != channel.admins[index])
                        tmp.push(channel.admins[index]);
                }
                return await this.prisma.channel.update({ where: { id: channel.id },
                    data: { admins: tmp } });
            }
        }
    }
    async deleteChannel(channelId) {
        await this.prisma.channel.delete({ where: { id: channelId } });
    }
    async setPasswordToChannel(password, channelName) {
        console.log('testing', password);
        let channel = await this.getChannelByName(channelName);
        if (channel && password.length) {
            return await this.prisma.channel.update({ where: { id: channel.id },
                data: {
                    IsProtected: true,
                    password: password,
                } });
        }
    }
    async unsetPasswordToChannel(channelName) {
        let channel = await this.getChannelByName(channelName);
        if (channel) {
            return await this.prisma.channel.update({ where: { id: channel.id },
                data: {
                    IsProtected: false,
                    password: '',
                } });
        }
    }
    async BanUser(user, ban) {
        let tmp = [];
        if (user && ban) {
            tmp = user.bandUsers;
            tmp.push(ban.id);
            let check = await this.prisma.user.update({ where: { id: user.id },
                data: { bandUsers: tmp },
            });
            console.log(check);
            return `user banned succesfully.`;
        }
        return `user already banned or dosen't exist.`;
    }
    async unBanUser(user, ban) {
        let tmp = [];
        if (user && ban) {
            user.bandUsers.forEach((user) => {
                if (user != ban.username)
                    tmp.push(user);
            });
            let check = await this.prisma.user.update({ where: { id: user.id },
                data: { bandUsers: tmp },
            });
            console.log(check);
            return `user unbanned succesfully.`;
        }
        return `user is not in the ban list.`;
    }
    async getChannelMessages(channel) {
        console.log('getting messages of : ', channel);
        let tmp = await this.prisma.channelMessage.findMany({ where: { channelName: channel } });
        console.log(tmp);
        return tmp;
    }
};
exports.ChannelsService = ChannelsService;
exports.ChannelsService = ChannelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChannelsService);
//# sourceMappingURL=chat.service.js.map