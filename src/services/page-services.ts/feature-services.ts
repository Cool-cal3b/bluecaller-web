import { BlueCallerMeeting, Feature, GetAllMeetingsResponse, GetFeaturesResponse, GetMeetingItemResponse, GetMeetingResponse, GetMeetingItemsResponse } from "@/responses/feature-responses";
import { CreateFounderMeetingItemRequest, CreateFounderMeetingRequest, CreateFeatureRequest } from "@/requests/feature-requests";
import { GeneralResponse } from "@/responses/shared-responses";
import { getAPIService } from "../shared-services/api-service";

class FeatureService {
    constructor() {}

    public async getFeatures(): Promise<Feature[]> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetFeaturesResponse>('/bc-features/features');
        if (!response) return [];
        return response.features;
    }

    public async getFeature(id: number): Promise<Feature> {
        const apiService = await getAPIService();
        const response = await apiService.get<Feature>(`/bc-features/features/${id}`);
        if (!response) throw new Error(`Failed to get feature with id ${id}`);
        return response;
    }

    public async createFeature(createFeatureRequest: CreateFeatureRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>('/bc-features/features', createFeatureRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async updateFeature(id: number, updateFeatureRequest: CreateFeatureRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/features/${id}`, updateFeatureRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async createActionItem(itemName: string, itemText: string, featureId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>('/bc-features/meeting-items', {
            itemName,
            itemText,
            type: 'ACTION',
            featureId,
        });
        if (!response?.success) throw new Error(response?.message);
    }

    public async addActionItemToFeature(meetingItemId: number, featureId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/meeting-items/${meetingItemId}/feature/${featureId}`, null);
        if (!response?.success) throw new Error(response?.message);
    }

    public async removeActionItemFromFeature(meetingItemId: number, featureId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.delete<GeneralResponse>(`/bc-features/meeting-items/${meetingItemId}/feature/${featureId}`);
        if (!response?.success) throw new Error(response?.message);
    }

    public async getActionItemsForFeature(featureId: number): Promise<GetMeetingItemsResponse> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetMeetingItemsResponse>(`/bc-features/features/${featureId}/action-items`);
        if (!response) return { meetingItems: [] };
        return response;
    }
}

class MeetingService {
    constructor() {}

    public async getMeetings(): Promise<BlueCallerMeeting[]> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetAllMeetingsResponse>('/bc-features/founder-meetings');
        if (!response) return [];
        return response.meetings.map(meeting => new BlueCallerMeeting(meeting));
    }

    public async getMeeting(id: number): Promise<BlueCallerMeeting> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetMeetingResponse>(`/bc-features/founder-meetings/${id}`);
        if (!response) throw new Error(`Failed to get meeting with id ${id}`);
        return new BlueCallerMeeting(response);
    }

    public async createMeeting(createMeetingRequest: CreateFounderMeetingRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/founder-meetings`, createMeetingRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async updateMeeting(id: number, updateMeetingRequest: CreateFounderMeetingRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/founder-meetings/${id}`, updateMeetingRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async getActionItem(itemId: number): Promise<GetMeetingItemResponse> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetMeetingItemResponse>(`/bc-features/meeting-items/${itemId}`);
        if (!response) throw new Error(`Failed to get action item with id ${itemId}`);
        return response;
    }

    public async createMeetingItem(meetingId: number, createMeetingItemRequest: CreateFounderMeetingItemRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/meeting-items`, createMeetingItemRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async updateMeetingItem(meetingItemId: number, updateMeetingItemRequest: CreateFounderMeetingItemRequest): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/meeting-items/${meetingItemId}`, updateMeetingItemRequest);
        if (!response?.success) throw new Error(response?.message);
    }

    public async deleteMeetingItem(meetingItemId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.delete<GeneralResponse>(`/bc-features/meeting-items/${meetingItemId}`);
        if (!response?.success) throw new Error(response?.message);
    }

    public async setIfMeetingItemIsCompleted(meetingItemId: number, isCompleted: boolean): Promise<void> {
        const apiService = await getAPIService();
        const url = `/bc-features/meeting-items/${meetingItemId}/complete/${isCompleted}`;
        
        const response = await apiService.post<GeneralResponse>(url, null);
        if (!response?.success) throw new Error(response?.message);
    }

    public async addItemToMeeting(meetingItemId: number, meetingId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.post<GeneralResponse>(`/bc-features/founder-meetings/${meetingId}/meeting-items/${meetingItemId}`, null);
        if (!response?.success) throw new Error(response?.message);
    }

    public async removeItemFromMeeting(meetingItemId: number, meetingId: number): Promise<void> {
        const apiService = await getAPIService();
        const response = await apiService.delete<GeneralResponse>(`/bc-features/founder-meetings/${meetingId}/meeting-items/${meetingItemId}`);
        if (!response?.success) throw new Error(response?.message);
    }

    public async getAllActionItemsNotAssigned(): Promise<GetMeetingItemsResponse> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetMeetingItemsResponse>(`/bc-features/meeting-items/not-assigned`);
        if (!response) return { meetingItems: [] };
        return response;
    }

    public async getAllOpenActionItems(): Promise<GetMeetingItemsResponse> {
        const apiService = await getAPIService();
        const response = await apiService.get<GetMeetingItemsResponse>(`/bc-features/meeting-items/open`);
        if (!response) return { meetingItems: [] };
        return response;
    }
}

export { FeatureService, MeetingService };