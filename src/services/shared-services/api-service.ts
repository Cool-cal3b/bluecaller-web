import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { UserInfoStorageService } from "./user-info-storage";
import { Utils } from "./utils";

export class APIService {
	private userInfoStorageService: UserInfoStorageService;
	private backendPath: string = '';
	private axiosInstance: AxiosInstance|null = null;

	public constructor() {
		this.userInfoStorageService = new UserInfoStorageService();
	}

	public async init(): Promise<void> {
		this.backendPath = await this.getBackendPath();
		this.axiosInstance = axios.create({
			baseURL: this.backendPath,
			timeout: 5000,
		});

		this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => { return this.useJWTFunc(config) })
	}

	private async getBackendPath(): Promise<string> {
		return (await Utils.isDevMode())
			? 'http://localhost:8082/api'
			: 'https://bc.calebwash.com/api';
	}

	public async refreshBackendPath(): Promise<void> {
		this.backendPath = await this.getBackendPath();
		if (!this.axiosInstance) return;
		this.axiosInstance.defaults.baseURL = this.backendPath;
	}

	public refreshJWT(): void {
		if (!this.axiosInstance) return;
		this.axiosInstance.interceptors.request.clear();
		this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => { return this.useJWTFunc(config) })
	}

	public async get<T>(endpoint: string, params = {}): Promise<T | null> {
		if (!this.axiosInstance) return null;

		try {
			const response = await this.axiosInstance.get(endpoint, { params });
			return response.data;
		} catch (ex: any) {
			console.log(`Endpoint: ${endpoint}, \nparams: ${JSON.stringify(params)}`);
			if (axios.isAxiosError(ex)) {
				console.log('Axios error message:', ex.message);
				console.log('Axios error request:', ex.request); // More details about what was sent
				console.log('Axios error response:', ex.response); // Response from the server (if any)
			} else {
				console.log('Unexpected error:', ex);
			}
			return null;
		}
	}

	public async post<T>(endpoint: string, data: any): Promise<T> {
		if (!this.axiosInstance) throw new Error('Axios instance not initialized');

		try {
			const response = await this.axiosInstance.post(endpoint, data);
			return response.data;
		} catch (ex: any) {
			console.log('Error URL that was sent:', this.axiosInstance.defaults.baseURL + endpoint);
			console.log(`In depth error: ${ex.message}`);
			console.log(`data sent: ${JSON.stringify(data)}`);
			throw ex;
		}
	}

	public async delete<T>(endpoint: string): Promise<T> {
		if (!this.axiosInstance) throw new Error('Axios instance not initialized');
		
		try {
			const response = await this.axiosInstance.delete(endpoint);
			return response.data;
		} catch (ex: any) {
			console.log('Error URL that was sent:', this.axiosInstance.defaults.baseURL + endpoint);
			throw ex;
		}
	}

	public async multipartPost<T>(endpoint: string, formData: FormData): Promise<T> {
		if (!this.axiosInstance) throw new Error('Axios instance not initialized');
		
		try {
			const response = await this.axiosInstance.post(endpoint, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		} catch (ex: any) {
			console.log('Error URL that was sent:', this.axiosInstance.defaults.baseURL + endpoint);
			throw ex;
		}
	}

	private useJWTFunc(config: InternalAxiosRequestConfig<any>) {
		const userInfo = this.userInfoStorageService.getUserInfo();
		if (userInfo && userInfo.bearer) {
			config.headers.Authorization = userInfo.bearer;
		}

		return config;
	}
}

export async function getAPIService(): Promise<APIService> {
	const apiService = new APIService();
	await apiService.init();
	return apiService;
}