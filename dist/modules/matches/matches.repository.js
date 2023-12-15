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
exports.MatchesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const users_repository_1 = require("../users/users.repository");
let MatchesRepository = class MatchesRepository {
    constructor(prisma, user) {
        this.prisma = prisma;
        this.user = user;
    }
    async CreateMatch(playerA, playerB, _playerAScore, _playerBScore) {
        try {
            return await this.prisma.match.create({ data: {
                    playerAId: playerA.id,
                    playerBId: playerB.id,
                    playerAScore: _playerAScore,
                    playerBScore: _playerBScore,
                } });
        }
        catch (error) {
            console.log("error creating game");
        }
    }
    async GetMatches() {
        return await this.prisma.match.findMany();
    }
    async findMatchesByUserId(id) {
        console.log(id);
        return await this.prisma.match.findMany({
            where: {
                OR: [
                    { playerAId: id },
                    { playerBId: id },
                ],
            },
        });
    }
    async CheckForGamesAchievements(matches, _id) {
        let user = await this.prisma.user.findUnique({ where: { id: _id } });
        console.log(user);
        if (!user)
            return;
        if (matches.length > 0 && !user.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322232/umkxxvgtxbe2bowynp8v.png')) {
            if (!user.achievements.includes("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322232/umkxxvgtxbe2bowynp8v.png"))
                this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322232/umkxxvgtxbe2bowynp8v.png", _id);
        }
        if (matches.length > 2 && !user.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322411/fuentssbawcfsdbzgvzu.png')) {
            if (!user.achievements.includes("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322411/fuentssbawcfsdbzgvzu.png"))
                this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322411/fuentssbawcfsdbzgvzu.png", _id);
        }
        if (matches.length > 9 && !user.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322764/ixv9svidceql0yox2ils.png')) {
            if (!user.achievements.includes("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322764/ixv9svidceql0yox2ils.png"))
                this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322764/ixv9svidceql0yox2ils.png", _id);
        }
        if (matches.length > 99 && !user.achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322889/mmgus4h0unnnj3lvhw2v.png')) {
            if (!user.achievements.includes("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322889/mmgus4h0unnnj3lvhw2v.png"))
                this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322889/mmgus4h0unnnj3lvhw2v.png", _id);
        }
        matches.forEach((match) => {
            if (!user.achievements.includes("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322378/qdat4wgumpjsvbtcisd6.png")) {
                if (match.playerAId == _id) {
                    if (match.playerAScore > match.playerBScore)
                        this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322378/qdat4wgumpjsvbtcisd6.png", _id);
                }
                else {
                    if (match.playerAScore < match.playerBScore)
                        this.user.updateAcheivement("https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322378/qdat4wgumpjsvbtcisd6.png", _id);
                }
            }
        });
        return;
    }
};
exports.MatchesRepository = MatchesRepository;
exports.MatchesRepository = MatchesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, users_repository_1.UsersRepository])
], MatchesRepository);
//# sourceMappingURL=matches.repository.js.map