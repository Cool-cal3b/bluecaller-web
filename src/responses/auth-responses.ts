interface LoginResponse {
    bearer: string | null;
    message: string;
    success: boolean;
} 

interface UserInfoResponse {
    first_name: string;
	last_name: string;
	email: string;
	username: string;
}

export type { LoginResponse, UserInfoResponse };