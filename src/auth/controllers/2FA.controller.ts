import { Controller, Post, Res, Req, Body, UnauthorizedException, UseGuards, Get } from "@nestjs/common";
import { Response } from "express";
import { TwoFaV, UserDto } from "src/DTOs/User/user.dto";
import { JwtAuth } from "../Guards/jwt.guard";
import { TwoFAService } from "../Services/2FA.service";
import { UserService } from "../Services/user.service";

@Controller('2FA')
export class TwoFAConroller {
    constructor(private readonly TwoFAService: TwoFAService, private readonly userService: UserService) {}

    @Post('generate')
    @UseGuards(JwtAuth)
    async register(@Res() response:Response, @Req() req: Request & {user: UserDto}) {

        try {
            const user = req.user;

            const code = await this.TwoFAService.generate2FASecret(user);
            response.status(200).json({code});
        }
        catch (error) {
            response.status(400).json(error);
        }
    }

    @Post('validation')
    @UseGuards(JwtAuth)
    async validate2FA(@Req() req:Request & {user: UserDto}, @Body() body : TwoFaV, @Res() res: Response) {

        const user = req.user;
        const id = user.id;
        const Pin = body.code;
        console.log(body)
        console.log("pin : ", Pin);

        console.log("ZEBIIII", body.code);

        console.log(`hello : ${body.code}, hello : ${id}`)
        try {

            const user = await this.userService.getUser(id);

            const isValid = await this.TwoFAService.TwoFACodeValidation(Pin, user.TwoFASecret);

            if (!isValid)
                res.status(401).send('invalid otp, try again.')
                // throw new UnauthorizedException('Wrong Authentication code');
            else {
                res.status(200).json(user)
            }
        }
        catch (error){
            res.status(401).json(error);
        }
    }
}