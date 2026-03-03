"use client";

import { Feature, FeaturePriority, GetMeetingItemResponse } from "@/responses/feature-responses";
import styles from "./page.module.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FeatureService, MeetingService } from "@/services/page-services.ts/feature-services";

export default function FeaturePage() {
    const params: { featureId: string } = useParams();
    const getFeatureId = () => parseInt(params.featureId);

    const featureServiceRef = useRef(new FeatureService());
    const meetingServiceRef = useRef(new MeetingService());

    const [feature, setFeature] = useState<Feature | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [actionItems, setActionItems] = useState<GetMeetingItemResponse[]>([]);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const [showAddModal, setShowAddModal] = useState(false);
    const [modalTab, setModalTab] = useState<"new" | "existing">("existing");
    const [modalActionItems, setModalActionItems] = useState<GetMeetingItemResponse[]>([]);
    const [modalActionItemsToShow, setModalActionItemsToShow] = useState<GetMeetingItemResponse[]>([]);
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemText, setNewItemText] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = getFeatureId();
        if (isNaN(id)) return;
        setIsLoading(true);
        featureServiceRef.current.getFeature(id).then(setFeature).finally(() => setIsLoading(false));
        
        const fetchActionItems = async () => {
            const actionItemsResponse = await featureServiceRef.current.getActionItemsForFeature(id);
            if (!actionItemsResponse) return;
            setActionItems(actionItemsResponse.meetingItems);
        };

        const fetchActionItemsNotAssignedForModal = async () => {
            const actionItemsNotAssignedForModalResponse = await meetingServiceRef.current.getAllActionItemsNotAssigned();
            if (!actionItemsNotAssignedForModalResponse) return;
            setModalActionItems(actionItemsNotAssignedForModalResponse.meetingItems);
            setModalActionItemsToShow(actionItemsNotAssignedForModalResponse.meetingItems.slice(0, 20));
        };

        fetchActionItems();
        fetchActionItemsNotAssignedForModal();
    }, [params.featureId, refreshCounter]);

    const patch = (changes: Partial<Feature>) => {
        setFeature((prev) => (prev ? { ...prev, ...changes } : prev));
    };

    const saveFeature = async () => {
        if (!feature) return;
        await featureServiceRef.current.updateFeature(feature.id, {
            featureName: feature.name,
            featureDescription: feature.description,
            priority: feature.priority,
            yearGoal: feature.yearGoal,
            quarterGoal: feature.quarterGoal,
        });
        setSavedAt(new Date());
    };

    const openAddModal = () => {
        setModalTab("existing");
        setModalSearchTerm("");
        setModalActionItemsToShow(modalActionItems.slice(0, 20));
        setNewItemName("");
        setNewItemText("");
        setShowAddModal(true);
    };

    const closeAddModal = () => setShowAddModal(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) closeAddModal();
    };

    const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setModalSearchTerm(term);
        setModalActionItemsToShow(
            modalActionItems.filter((item) => item.itemName.toLowerCase().includes(term.toLowerCase())).slice(0, 20)
        );
    };

    const handleAddActionItemToFeature = async (actionItemId: number) => {
        await featureServiceRef.current.addActionItemToFeature(actionItemId, getFeatureId());
        closeAddModal();
        setRefreshCounter((c) => c + 1);
    };

    const handleCreateAndAssignActionItem = async () => {
        if (!newItemName.trim()) return;
        setIsCreating(true);
        try {
            await featureServiceRef.current.createActionItem(newItemName, newItemText, getFeatureId());
            closeAddModal();
            setRefreshCounter((c) => c + 1);
        } finally {
            setIsCreating(false);
        }
    };

    const handleRemoveActionItemFromFeature = async (actionItemId: number) => {
        await featureServiceRef.current.removeActionItemFromFeature(actionItemId, getFeatureId());
        setRefreshCounter((c) => c + 1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    Features
                </div>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>{isLoading ? "Loading…" : (feature?.name ?? "Feature")}</h1>
                    {savedAt && <span className={styles.savedAt}>Saved at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
            </div>

            <Link href="/admin/features/all-features" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to All Features
            </Link>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.loadingPulse} />
                    <div className={styles.loadingPulse} style={{ width: "70%" }} />
                    <div className={styles.loadingPulse} style={{ width: "50%" }} />
                </div>
            ) : feature && (
                <div className={styles.form}>
                    <div className={styles.formSection}>
                        <p className={styles.sectionTitle}>Details</p>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="feature-name">Name</label>
                            <input
                                id="feature-name"
                                className={styles.input}
                                type="text"
                                value={feature.name}
                                onChange={(e) => patch({ name: e.target.value })}
                                onBlur={saveFeature}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="feature-description">Description</label>
                            <textarea
                                id="feature-description"
                                className={styles.textarea}
                                value={feature.description}
                                onChange={(e) => patch({ description: e.target.value })}
                                onBlur={saveFeature}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <p className={styles.sectionTitle}>Goal</p>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.fieldLabel} htmlFor="feature-priority">Priority</label>
                                <select
                                    id="feature-priority"
                                    className={styles.select}
                                    value={feature.priority}
                                    onChange={(e) => patch({ priority: Number(e.target.value) })}
                                    onBlur={saveFeature}
                                >
                                    <option value={FeaturePriority.HIGH}>High</option>
                                    <option value={FeaturePriority.MEDIUM}>Medium</option>
                                    <option value={FeaturePriority.LOW}>Low</option>
                                    <option value={FeaturePriority.BACKLOG}>Backlog</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel} htmlFor="feature-quarter">Quarter</label>
                                <select
                                    id="feature-quarter"
                                    className={styles.select}
                                    value={feature.quarterGoal}
                                    onChange={(e) => patch({ quarterGoal: Number(e.target.value) })}
                                    onBlur={saveFeature}
                                >
                                    <option value={1}>Q1</option>
                                    <option value={2}>Q2</option>
                                    <option value={3}>Q3</option>
                                    <option value={4}>Q4</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.fieldLabel} htmlFor="feature-year">Year</label>
                                <input
                                    id="feature-year"
                                    className={styles.input}
                                    type="number"
                                    value={feature.yearGoal}
                                    onChange={(e) => patch({ yearGoal: Number(e.target.value) })}
                                    onBlur={saveFeature}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <p className={styles.sectionTitle}>Action Items</p>
                            <button className={styles.addButton} onClick={openAddModal}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                </svg>
                                Add
                            </button>
                        </div>

                        {actionItems.length === 0 ? (
                            <p className={styles.emptyState}>No action items linked to this feature yet.</p>
                        ) : (
                            <div className={styles.itemList}>
                                {actionItems.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <span className={styles.itemDot} />
                                        <div className={styles.itemBody}>
                                            <span className={styles.itemName}>{item.itemName}</span>
                                            {item.itemText && <span className={styles.itemText}>{item.itemText}</span>}
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveActionItemFromFeature(item.id)}
                                            aria-label="Remove action item"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Add Action Item</h2>
                        </div>

                        <div className={styles.modalTabs}>
                            <button
                                className={`${styles.modalTab} ${modalTab === "existing" ? styles.modalTabActive : ""}`}
                                onClick={() => setModalTab("existing")}
                            >
                                Add Existing
                            </button>
                            <button
                                className={`${styles.modalTab} ${modalTab === "new" ? styles.modalTabActive : ""}`}
                                onClick={() => setModalTab("new")}
                            >
                                Create New
                            </button>
                        </div>

                        {modalTab === "existing" ? (
                            <>
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="action-search">Search</label>
                                    <input
                                        id="action-search"
                                        className={styles.modalInput}
                                        type="text"
                                        placeholder="Filter by name…"
                                        value={modalSearchTerm}
                                        onChange={handleSearchTermChange}
                                        autoFocus
                                    />
                                </div>

                                {modalActionItemsToShow.length === 0 ? (
                                    <p className={styles.modalEmpty}>No unassigned action items found.</p>
                                ) : (
                                    <div className={styles.modalList}>
                                        {modalActionItemsToShow.map((item) => (
                                            <button
                                                key={item.id}
                                                className={styles.modalItem}
                                                onClick={() => handleAddActionItemToFeature(item.id)}
                                            >
                                                <span className={styles.modalItemName}>{item.itemName}</span>
                                                {item.itemText && <span className={styles.modalItemText}>{item.itemText}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    <button className={styles.cancelButton} onClick={closeAddModal}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="new-item-name">Name</label>
                                    <input
                                        id="new-item-name"
                                        className={styles.modalInput}
                                        type="text"
                                        placeholder="Short title for this action item…"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="new-item-text">Description</label>
                                    <textarea
                                        id="new-item-text"
                                        className={styles.modalTextarea}
                                        placeholder="Additional details or context…"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button className={styles.cancelButton} onClick={closeAddModal} disabled={isCreating}>
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.confirmButton}
                                        onClick={handleCreateAndAssignActionItem}
                                        disabled={isCreating || !newItemName.trim()}
                                    >
                                        {isCreating ? "Creating…" : "Create & Assign"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}