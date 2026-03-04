"use client";

import { FeatureService, MeetingService } from "@/services/page-services.ts/feature-services";
import { useEffect, useRef, useState } from "react";
import { Feature, GetMeetingItemResponse, MeetingItemType } from "@/responses/feature-responses";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function ActionItemPage() {
    const params: { itemId: string } = useParams();
    const getItemId = () => parseInt(params.itemId);

    const meetingServiceRef = useRef(new MeetingService());
    const featureServiceRef = useRef(new FeatureService());
    const router = useRouter();

    const [actionItem, setActionItem] = useState<GetMeetingItemResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTogglingComplete, setIsTogglingComplete] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feature, setFeature] = useState<Feature | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        meetingServiceRef.current.getActionItem(getItemId()).then((res) => {
            setActionItem(res);
            if (res.featureId) {
                featureServiceRef.current.getFeature(res.featureId).then(setFeature);
            }
        }).finally(() => setIsLoading(false));
    }, []);

    const handleSave = async (updated: GetMeetingItemResponse) => {
        await meetingServiceRef.current.updateMeetingItem(updated.id, {
            itemName: updated.itemName,
            itemText: updated.itemText,
            type: updated.type,
        });
    };

    const patch = (changes: Partial<GetMeetingItemResponse>) => {
        setActionItem((prev) => (prev ? { ...prev, ...changes } : prev));
    };

    const handleToggleComplete = async () => {
        if (!actionItem) return;
        setIsTogglingComplete(true);
        try {
            const next = !actionItem.isCompleted;
            await meetingServiceRef.current.setIfMeetingItemIsCompleted(actionItem.id, next);
            patch({ isCompleted: next });
        } finally {
            setIsTogglingComplete(false);
        }
    };

    const handleDeleteActionItem = async () => {
        setIsDeleting(true);
        try {
            await meetingServiceRef.current.deleteMeetingItem(getItemId());
            router.push("/admin/features/all-action-items");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) setShowDeleteConfirm(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    Action Items
                </div>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>{isLoading ? "Loading…" : (actionItem?.itemName || "Action Item")}</h1>
                    {actionItem && (
                        <span className={`${styles.statusBadge} ${actionItem.isCompleted ? styles.statusDone : styles.statusOpen}`}>
                            {actionItem.isCompleted ? "Done" : "Open"}
                        </span>
                    )}
                </div>
            </div>

            <Link href="/admin/features/all-action-items" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Action Items
            </Link>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.loadingPulse} />
                    <div className={styles.loadingPulse} style={{ width: "70%" }} />
                    <div className={styles.loadingPulse} style={{ width: "50%" }} />
                </div>
            ) : actionItem && (
                <div className={styles.form}>
                    <div className={styles.formSection}>
                        <p className={styles.sectionTitle}>Details</p>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="item-name">Name</label>
                            <input
                                id="item-name"
                                className={styles.input}
                                type="text"
                                value={actionItem.itemName}
                                onChange={(e) => patch({ itemName: e.target.value })}
                                onBlur={() => handleSave(actionItem)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="item-text">Description</label>
                            <textarea
                                id="item-text"
                                className={styles.textarea}
                                value={actionItem.itemText}
                                onChange={(e) => patch({ itemText: e.target.value })}
                                onBlur={() => handleSave(actionItem)}
                                rows={4}
                                placeholder="Add a description…"
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <p className={styles.sectionTitle}>Status & Feature</p>

                        <div className={styles.metaRow}>
                            <div className={styles.metaCard}>
                                <span className={styles.metaCardLabel}>Status</span>
                                <div className={styles.metaCardValue}>
                                    <span className={`${styles.statusBadgeLarge} ${actionItem.isCompleted ? styles.statusDone : styles.statusOpen}`}>
                                        {actionItem.isCompleted ? "Done" : "Open"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.metaCard}>
                                <span className={styles.metaCardLabel}>Type</span>
                                <div className={styles.metaCardValue}>
                                    <span className={styles.typeBadge}>
                                        {actionItem.type === MeetingItemType.ACTION ? "Action Item" : "Agenda Item"}
                                    </span>
                                </div>
                            </div>

                            {feature && (
                                <div className={styles.metaCard}>
                                    <span className={styles.metaCardLabel}>Feature</span>
                                    <Link href={`/admin/features/all-features/${feature.id}`} className={styles.featureLink}>
                                        {feature.name}
                                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                            <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formFooter}>
                        <div className={styles.formFooterInfo}>
                            <span className={styles.formFooterLabel}>Actions</span>
                            <span className={styles.formFooterHint}>
                                {actionItem.isCompleted ? "This item is marked as done." : "This item is currently open."}
                            </span>
                        </div>
                        <div className={styles.formFooterActions}>
                            <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v4M7.5 6v4M3.5 3.5l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Delete
                            </button>
                            <button
                                className={`${styles.toggleButton} ${actionItem.isCompleted ? styles.toggleButtonUndo : styles.toggleButtonComplete}`}
                                onClick={handleToggleComplete}
                                disabled={isTogglingComplete}
                            >
                                {actionItem.isCompleted ? (
                                    <>
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <path d="M2 6.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                        Mark as Open
                                    </>
                                ) : (
                                    <>
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Mark as Done
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Delete Action Item</h2>
                            <p className={styles.modalSubtitle}>This cannot be undone. The action item will be permanently removed.</p>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                                Cancel
                            </button>
                            <button className={styles.confirmDeleteButton} onClick={handleDeleteActionItem} disabled={isDeleting}>
                                {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}