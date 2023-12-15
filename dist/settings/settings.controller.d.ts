/// <reference types="multer" />
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Request, Response } from 'express';
import { UserDto } from 'src/DTOs/User/user.dto';
import { settingsDto } from 'src/DTOs/settings/setting.dto';
import { TwoFAService } from 'src/auth/Services/2FA.service';
export declare class settingsController {
    private user;
    private Cloudinary;
    private TwoFaService;
    constructor(user: UsersRepository, Cloudinary: CloudinaryService, TwoFaService: TwoFAService);
    GetUserData(id: string): Promise<UserDto>;
    uploadFile(file: Express.Multer.File, req: Request & {
        user: UserDto;
    }): Promise<void>;
    updateUsername(res: Response, data: settingsDto, req: Request & {
        user: UserDto;
    }): Promise<void>;
}
