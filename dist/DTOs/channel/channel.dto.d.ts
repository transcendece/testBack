export declare class channelDto {
    id?: string;
    name: string;
    users?: string[];
    admins?: string[];
    mutedUsersId?: string[];
    bannedUsers?: string[];
    owner?: string;
    IsPrivate?: boolean;
    IsProtected?: boolean;
    password?: string;
    passwordHash?: string;
}
