import { FeaturePriority, MeetingItemType } from "@/responses/feature-responses";

interface CreateFounderMeetingRequest {
    date: string;
    notes: string;
}

interface CreateFounderMeetingItemRequest {
    itemName: string;
    itemText: string;
    type: MeetingItemType;
    featureId?: number;
    meetingId?: number;
}

interface CreateFeatureRequest {
    featureName: string;
    featureDescription: string;
    priority: FeaturePriority;
    yearGoal: number;
    quarterGoal: number;
}

export type { CreateFounderMeetingRequest, CreateFounderMeetingItemRequest, CreateFeatureRequest };