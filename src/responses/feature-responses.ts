interface GetFeaturesResponse {
    features: Feature[];
}

interface Feature {
    id: number;
    name: string;
    description: string;
    priority: number;
    yearGoal: number;
    quarterGoal: number;
    createdAt: string;
}

interface GetAllMeetingsResponse {
    meetings: GetMeetingResponse[];
}

interface GetMeetingResponse {
    id: number;
    date: string;
    notes: string;
    meetingItems: GetMeetingItemResponse[];
}

interface GetMeetingItemResponse {
    id: number;
    itemName: string;
    itemText: string;
    isCompleted: boolean;
    type: MeetingItemType;
    featureId?: number;
}

enum MeetingItemType {
    AGENDA = "AGENDA",
    ACTION = "ACTION",
}

enum FeaturePriority {
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3,
    BACKLOG = 4,
}

class BlueCallerMeeting {
    public date: Date;
    public id: number;
    public notes: string;
    public meetingItems: GetMeetingItemResponse[];

    constructor(meetingResponse: GetMeetingResponse) {
        this.date = new Date(meetingResponse.date);
        this.id = meetingResponse.id;
        this.notes = meetingResponse.notes;
        this.meetingItems = meetingResponse.meetingItems;
    }
}

export type { GetFeaturesResponse, Feature, GetAllMeetingsResponse, GetMeetingResponse, GetMeetingItemResponse };
export { BlueCallerMeeting, MeetingItemType, FeaturePriority };