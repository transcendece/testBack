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
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../auth/Guards/jwt.guard");
const achievement_repository_1 = require("../achievement/achievement.repository");
const friends_repository_1 = require("../friends/friends.repository");
const matches_repository_1 = require("../matches/matches.repository");
const readfile_1 = require("../readfile/readfile");
const users_repository_1 = require("../users/users.repository");
let LeaderboardController = class LeaderboardController {
    constructor(user, achievement, match, file, friend) {
        this.user = user;
        this.achievement = achievement;
        this.match = match;
        this.file = file;
        this.friend = friend;
    }
    async getLeaderboard(req) {
        console.log("got leaderboard =============================> ");
        let users = await this.user.getAllUsers();
        console.log(users);
        let leaderboard = [];
        let _userAchievements = await this.achievement.getAchievements();
        users.forEach((user) => {
            user.achievements.map(async (achievement) => {
                achievement = await this.achievement.getAchievementImage(achievement);
                console.log("7777777777 ==> ", achievement);
            });
        });
        users.forEach((user) => {
            leaderboard.push({
                username: user.username,
                avatar: user.avatar,
                achievements: user.achievements,
                rank: 0,
                level: user.level
            });
        });
        return (leaderboard);
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getLeaderboard", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        achievement_repository_1.AchievementRepository,
        matches_repository_1.MatchesRepository,
        readfile_1.FileService,
        friends_repository_1.FriendsRepository])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map