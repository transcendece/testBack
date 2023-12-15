import { Request, Response } from "express";
import { UserDto } from "src/DTOs/User/user.dto";
import { UsersRepository } from "src/modules/users/users.repository";
export declare class SearchController {
    private user;
    constructor(user: UsersRepository);
    Search(data: string, req: Request & {
        user: UserDto;
    }, res: Response): Promise<any>;
}
