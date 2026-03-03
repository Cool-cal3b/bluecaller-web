"use client";

import { MeetingService } from "@/services/page-services.ts/feature-services";
import { useEffect, useRef, useState, useMemo } from "react";
import { BlueCallerMeeting } from "@/responses/feature-responses";
import Link from "next/link";
import styles from "./page.module.css";

function toLocalDateInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function fromLocalDateInputValue(value: string): Date {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function MeetingCard({ meeting }: { meeting: BlueCallerMeeting }) {
    return (
        <Link href={`/admin/features/meetings/${meeting.id}`} className={styles.meetingCard}>
            <span className={styles.meetingCardDot} />
            <div className={styles.meetingCardBody}>
                <span className={styles.meetingCardDate}>
                    {meeting.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className={styles.meetingCardMeta}>
                    {meeting.meetingItems.length} item{meeting.meetingItems.length !== 1 ? "s" : ""}
                </span>
            </div>
            <svg className={styles.meetingCardArrow} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </Link>
    );
}

function MeetingList({ meetings, emptyMessage }: { meetings: BlueCallerMeeting[]; emptyMessage: string }) {
    if (meetings.length === 0) {
        return <p className={styles.emptyState}>{emptyMessage}</p>;
    }
    return (
        <div className={styles.meetingList}>
            {meetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
        </div>
    );
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<BlueCallerMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newMeetingDate, setNewMeetingDate] = useState<string>(toLocalDateInputValue(new Date()));
    const [isCreating, setIsCreating] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);

    const today = useMemo(() => startOfDay(new Date()), []);
    const threeMonthsAgo = useMemo(() => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - 3);
        return d;
    }, [today]);

    const [rangeStart, setRangeStart] = useState<string>(toLocalDateInputValue(threeMonthsAgo));
    const [rangeEnd, setRangeEnd] = useState<string>(toLocalDateInputValue(today));

    const meetingServiceRef = useRef<MeetingService>(new MeetingService());

    useEffect(() => {
        setIsLoading(true);
        meetingServiceRef.current.getMeetings().then(setMeetings).finally(() => setIsLoading(false));
    }, [refreshCounter]);

    const upcomingMeetings = useMemo(() => {
        return meetings
            .filter((m) => startOfDay(m.date) >= today)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [meetings, today]);

    const lastThreeMonthsMeetings = useMemo(() => {
        return meetings
            .filter((m) => {
                const d = startOfDay(m.date);
                return d >= threeMonthsAgo && d < today;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [meetings, threeMonthsAgo, today]);

    const rangeStartDate = fromLocalDateInputValue(rangeStart);
    const rangeEndDate = fromLocalDateInputValue(rangeEnd);
    const rangeMeetings = useMemo(() => {
        const start = startOfDay(rangeStartDate);
        const end = startOfDay(rangeEndDate);
        if (start > end) return [];
        return meetings
            .filter((m) => {
                const d = startOfDay(m.date);
                return d >= start && d <= end;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [meetings, rangeStart, rangeEnd]);

    const openModal = () => {
        setNewMeetingDate(toLocalDateInputValue(new Date()));
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) closeModal();
    };

    const handleCreateMeeting = async () => {
        if (!newMeetingDate) return;
        setIsCreating(true);
        try {
            const date = fromLocalDateInputValue(newMeetingDate);
            await meetingServiceRef.current.createMeeting({ date: date.toISOString(), notes: "" });
            closeModal();
            setRefreshCounter((c) => c + 1);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    All Founder's Meetings
                </div>
                <h1 className={styles.title}>Meetings</h1>
                <p className={styles.description}>
                    Plan and review founder meeting notes, agenda items, and action items.
                </p>
            </div>

            <Link href="/admin/features" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Features
            </Link>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Upcoming Meetings</span>
                    <button className={styles.createButton} onClick={openModal}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                        Plan New Meeting
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingPulse} />
                        <div className={styles.loadingPulse} style={{ width: "85%" }} />
                        <div className={styles.loadingPulse} style={{ width: "70%" }} />
                    </div>
                ) : (
                    <MeetingList meetings={upcomingMeetings} emptyMessage="No upcoming meetings. Plan one above." />
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Last 3 Months</span>
                </div>

                {!isLoading && (
                    <MeetingList meetings={lastThreeMonthsMeetings} emptyMessage="No meetings in the last 3 months." />
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Search by Date Range</span>
                </div>

                <div className={styles.dateRangeRow}>
                    <div className={styles.dateRangeField}>
                        <label className={styles.dateRangeLabel} htmlFor="range-start">From</label>
                        <input
                            id="range-start"
                            className={styles.dateRangeInput}
                            type="date"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                        />
                    </div>
                    <div className={styles.dateRangeField}>
                        <label className={styles.dateRangeLabel} htmlFor="range-end">To</label>
                        <input
                            id="range-end"
                            className={styles.dateRangeInput}
                            type="date"
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(e.target.value)}
                        />
                    </div>
                </div>

                {!isLoading && (
                    <MeetingList
                        meetings={rangeMeetings}
                        emptyMessage={
                            rangeStartDate > rangeEndDate
                                ? "Select a valid date range (From must be before To)."
                                : "No meetings in this date range."
                        }
                    />
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Plan New Meeting</h2>
                            <p className={styles.modalSubtitle}>Select a date for the upcoming founder meeting.</p>
                        </div>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel} htmlFor="meeting-date">Meeting Date</label>
                            <input
                                id="meeting-date"
                                className={styles.modalInput}
                                type="date"
                                value={newMeetingDate}
                                onChange={(e) => setNewMeetingDate(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={closeModal} disabled={isCreating}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleCreateMeeting}
                                disabled={isCreating || !newMeetingDate}
                            >
                                {isCreating ? "Creating…" : "Create Meeting"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
