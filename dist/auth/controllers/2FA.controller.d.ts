import { Response } from "express";
import { TwoFaV, UserDto } from "src/DTOs/User/user.dto";
import { TwoFAService } from "../Services/2FA.service";
import { UserService } from "../Services/user.service";
export declare class TwoFAConroller {
    private readonly TwoFAService;
    private readonly userService;
    constructor(TwoFAService: TwoFAService, userService: UserService);
    register(response: Response, req: Request & {
        user: UserDto;
    }): Promise<void>;
    validate2FA(req: Request & {
        user: UserDto;
    }, body: TwoFaV, res: Response): Promise<void>;
}
