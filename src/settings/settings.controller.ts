import { Body, Controller, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UsersRepository } from 'src/modules/users/users.repository';
import { Request, Response } from 'express';
import { UserDto } from 'src/DTOs/User/user.dto';
import { settingsDto } from 'src/DTOs/settings/setting.dto';
import { JwtAuth } from 'src/auth/Guards/jwt.guard';
import { TwoFAService } from 'src/auth/Services/2FA.service';

@Controller('Settings')
export class settingsController {
    constructor (private user: UsersRepository, private Cloudinary: CloudinaryService, private TwoFaService: TwoFAService) {}
    @Get(':id')
    async GetUserData(@Param('id') id: string) : Promise<UserDto> {
        return await this.user.getUserById(id);
    }

    @Put('upload')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuth)
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req:Request & {user: UserDto}) {
        let achievements : string[] = (await this.user.getUserById(req.user.id)).achievements
        if (!achievements.includes('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322922/ds3v9fsgo1dlujvh8otp.png'))
            await this.user.updateAcheivement('https://res.cloudinary.com/dvmxfvju3/image/upload/v1699322922/ds3v9fsgo1dlujvh8otp.png', req.user.id)
        const tmp = await this.Cloudinary.uploadImage(file, req.user.id)
        console.log(tmp);
        const heha = await this.user.updateAvatar(req.user.id, tmp.url)
        console.log(heha);
    }

    @Post('username')
    @UseGuards(JwtAuth)
    async   updateUsername(@Res() res: Response, @Body() data : settingsDto, @Req() req: Request & {user : UserDto}) {

        try {
            const user = req.user
            var userData = await this.user.updateUsername(user.id, data.username)
            if (data.checked_ === false && data.checked_ !== req.user.IsEnabled) {

                userData = await this.user.updateIsEnabled(user.id, data.checked_);
                res.status(201).json(userData);
            }
            else if (data.checked_ === true && data.checked_ !== req.user.IsEnabled) {

                var code = await this.TwoFaService.generate2FASecret(userData);
                userData = await this.user.getUserById(userData.id);
                res.status(201).json({code, userData});
            }
            else
                res.status(201).json(userData)
        }
        catch (error) {

            throw Error(error)
        }
    }
}
