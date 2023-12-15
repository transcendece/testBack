import { Request } from "express";
import { UserDto } from "src/DTOs/User/user.dto";
import { AchievementRepository } from "src/modules/achievement/achievement.repository";
import { FriendsRepository } from "src/modules/friends/friends.repository";
import { MatchesRepository } from "src/modules/matches/matches.repository";
import { FileService } from "src/modules/readfile/readfile";
import { UsersRepository } from "src/modules/users/users.repository";
export declare class LeaderboardController {
    private user;
    private achievement;
    private match;
    private file;
    private friend;
    constructor(user: UsersRepository, achievement: AchievementRepository, match: MatchesRepository, file: FileService, friend: FriendsRepository);
    getLeaderboard(req: Request & {
        user: UserDto;
    }): Promise<any>;
}
