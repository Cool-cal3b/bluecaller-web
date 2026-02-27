import { LoginResponse, UserInfoResponse } from "@/responses/auth-responses";
import { APIService, getAPIService } from "../shared-services/api-service";
import { IsAdminResponse } from "@/responses/roles-responses";
import { UserInfo, UserInfoStorageService } from "../shared-services/user-info-storage";

export class LoginPageService {
    private apiService: APIService|null = null;
    private userInfoStorageService: UserInfoStorageService;

    public constructor() {
        this.userInfoStorageService = new UserInfoStorageService();
    }

    public async login(username: string, password: string): Promise<void> {
        this.apiService = await getAPIService();

        const response = await this.apiService.post<LoginResponse>('/auth/login', { username, password });
        if (!response.success) {
            throw new Error(response.message);
        }

        this.userInfoStorageService.setUserInfo({
            username: username,
            firstName: '',
            lastName: '',
            email: '',
            bearer: response.bearer || '',
            isAdmin: false,
        });

        this.apiService.refreshJWT();
        const userInfoResponse = await this.apiService.get<UserInfoResponse>('/user');
        if (!userInfoResponse) {
            throw new Error('Failed to get user info');
        }

        const isAdminResponse = await this.apiService.get<IsAdminResponse>('/roles/is-admin');
        if (!isAdminResponse) {
            throw new Error('Failed to get is admin');
        }

        this.userInfoStorageService.setUserInfo({
            username: userInfoResponse.username,
            firstName: userInfoResponse.first_name,
            lastName: userInfoResponse.last_name,
            email: userInfoResponse.email,
            bearer: response.bearer || '',
            isAdmin: isAdminResponse.isAdmin,
        });
    }

    public async loginWithGoogle(idToken: string): Promise<void> {
        this.apiService = await getAPIService();
        if (!this.apiService) throw new Error('Failed to get API service');

        const response = await this.apiService.post<LoginResponse>('/auth/login/google', { idToken });
        if (!response.success || !response.bearer) {
            throw new Error(response.message);
        }

        this.userInfoStorageService.setUserInfo({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            bearer: response.bearer || '',
            isAdmin: false,
        });

        this.apiService.refreshJWT();
        const userInfoResponse = await this.apiService.get<UserInfoResponse>('/user');
        if (!userInfoResponse) {
            throw new Error('Failed to get user info');
        }

        const isAdminResponse = await this.apiService.get<IsAdminResponse>('/roles/is-admin');
        if (!isAdminResponse) {
            throw new Error('Failed to get is admin');
        }

        this.userInfoStorageService.setUserInfo({
            username: userInfoResponse.username,
            firstName: userInfoResponse.first_name,
            lastName: userInfoResponse.last_name,
            email: userInfoResponse.email,
            bearer: response.bearer || '',
            isAdmin: isAdminResponse.isAdmin,
        });
    }

    public logout(): void {
        this.userInfoStorageService.clearUserInfo();
    }

    public getUserInfo(): UserInfo | null {
        return this.userInfoStorageService.getUserInfo();
    }

    public isLoggedIn(): boolean {
        console.log(this.userInfoStorageService.getUserInfo());
        return this.userInfoStorageService.getUserInfo() !== null;
    }
}