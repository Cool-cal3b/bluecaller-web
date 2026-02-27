export class UserInfoStorageService {
    private userInfo: UserInfo | null;
    private readonly USER_INFO_KEY = 'userInfo';

    public constructor() {
        this.userInfo = null;
    }

    public getUserInfo(): UserInfo | null {
        if (this.userInfo) return this.userInfo;

        const userInfoJSON = localStorage.getItem(this.USER_INFO_KEY);
        if (!userInfoJSON) return null;

        this.userInfo = JSON.parse(userInfoJSON);
        return this.userInfo;
    }

    public setUserInfo(userInfo: UserInfo): void {
        this.userInfo = userInfo;
        localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    }

    public clearUserInfo(): void {
        this.userInfo = null;
        localStorage.removeItem(this.USER_INFO_KEY);
    }
}

export interface UserInfo {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bearer: string;
    isAdmin: boolean;
}