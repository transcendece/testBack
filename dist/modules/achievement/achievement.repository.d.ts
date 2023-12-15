import { AchievementDto } from "src/DTOs/achievement/achievement.dto";
import { PrismaService } from "src/modules/database/prisma.service";
import { FileService } from "../readfile/readfile";
export declare class AchievementRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    CreateAchievment(file: FileService): Promise<AchievementDto[]>;
    getAchievementImage(id: string): Promise<string | null>;
    getAchievements(): Promise<AchievementDto[]>;
}
