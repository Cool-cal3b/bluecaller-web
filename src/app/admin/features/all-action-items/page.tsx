"use client";

import { GetMeetingItemResponse, MeetingItemType } from "@/responses/feature-responses";
import { MeetingService } from "@/services/page-services.ts/feature-services";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function AllActionItemsPage() {
    const meetingServiceRef = useRef(new MeetingService());

    const [allOpenActionItems, setAllOpenActionItems] = useState<GetMeetingItemResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        meetingServiceRef.current.getAllOpenActionItems().then((res) => {
            setAllOpenActionItems(res.meetingItems.filter((item) => item.type === MeetingItemType.ACTION));
        }).finally(() => setIsLoading(false));
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    Action Items
                </div>
                <h1 className={styles.title}>All Action Items</h1>
                <p className={styles.description}>Open action items across all meetings.</p>
            </div>

            <Link href="/admin/features" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Features
            </Link>

            <div>
                <p className={styles.sectionTitle}>Open Items</p>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingPulse} />
                        <div className={styles.loadingPulse} style={{ width: "85%" }} />
                        <div className={styles.loadingPulse} style={{ width: "70%" }} />
                    </div>
                ) : allOpenActionItems.length === 0 ? (
                    <p className={styles.emptyState}>No open action items.</p>
                ) : (
                    <div className={styles.itemList}>
                        {allOpenActionItems.map((item) => (
                            <Link key={item.id} href={`/admin/features/all-action-items/${item.id}`} className={styles.itemCard}>
                                <span className={`${styles.itemDot} ${item.isCompleted ? styles.itemDotDone : ""}`} />
                                <div className={styles.itemCardBody}>
                                    <span className={styles.itemCardName}>{item.itemName}</span>
                                    {item.itemText && <span className={styles.itemCardText}>{item.itemText}</span>}
                                </div>
                                {item.isCompleted && <span className={styles.completedBadge}>Done</span>}
                                <svg className={styles.itemCardArrow} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}