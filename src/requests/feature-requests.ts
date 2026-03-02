import { MeetingItemType } from "@/responses/feature-responses";

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

export type { CreateFounderMeetingRequest, CreateFounderMeetingItemRequest };