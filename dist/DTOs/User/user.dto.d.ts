export declare class UserDto {
    id: string;
    username: string;
    email?: string;
    avatar: string;
    achievements: string[];
    TwoFASecret: string;
    IsEnabled: boolean;
    channels: string[];
    bandUsers: string[];
    online: boolean;
    level: number;
}
export declare class TwoFaV {
    code: string;
}
