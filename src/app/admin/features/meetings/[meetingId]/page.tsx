"use client";

import { MeetingService, FeatureService } from "@/services/page-services.ts/feature-services";
import { useEffect, useRef, useState } from "react";
import { Feature, GetMeetingItemResponse, MeetingItemType } from "@/responses/feature-responses";
import styles from "./page.module.css";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

type ModalItem = Omit<GetMeetingItemResponse, "id"> & { id: number | null };

export default function MeetingPage() {
    const params: { meetingId: string } = useParams();
    const router = useRouter();
    const getMeetingId = () => parseInt(params.meetingId);
    const meetingServiceRef = useRef(new MeetingService());
    const featureServiceRef = useRef(new FeatureService());

    const [loading, setLoading] = useState(true);
    const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
    const [meetingDate, setMeetingDate] = useState<Date | null>(null);
    const [meetingItems, setMeetingItems] = useState<GetMeetingItemResponse[]>([]);
    const [notes, setNotes] = useState<string>("");
    const [completingId, setCompletingId] = useState<number | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteOverlayRef = useRef<HTMLDivElement>(null);

    // View/edit modal (clicking an existing item)
    const [modalItem, setModalItem] = useState<ModalItem | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editFeatureSearch, setEditFeatureSearch] = useState("");
    const [editFeaturePickerOpen, setEditFeaturePickerOpen] = useState(false);
    const viewOverlayRef = useRef<HTMLDivElement>(null);

    // Add modal (the + button)
    const [showAddModal, setShowAddModal] = useState(false);
    const [addModalTab, setAddModalTab] = useState<"new" | "existing">("new");
    const [addModalDefaultType, setAddModalDefaultType] = useState<MeetingItemType>(MeetingItemType.ACTION);
    const [newItemName, setNewItemName] = useState("");
    const [newItemText, setNewItemText] = useState("");
    const [newItemType, setNewItemType] = useState<MeetingItemType>(MeetingItemType.ACTION);
    const [newItemFeatureId, setNewItemFeatureId] = useState<number | null>(null);
    const [newFeatureSearch, setNewFeatureSearch] = useState("");
    const [newFeaturePickerOpen, setNewFeaturePickerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [openItems, setOpenItems] = useState<GetMeetingItemResponse[]>([]);
    const [openItemsToShow, setOpenItemsToShow] = useState<GetMeetingItemResponse[]>([]);
    const [existingSearchTerm, setExistingSearchTerm] = useState("");
    const addOverlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        featureServiceRef.current.getFeatures().then(setAllFeatures);
    }, []);

    useEffect(() => {
        const id = getMeetingId();
        if (isNaN(id)) return;
        setLoading(true);
        meetingServiceRef.current.getMeeting(id).then((meeting) => {
            setMeetingDate(meeting.date);
            setMeetingItems(meeting.meetingItems);
            setNotes(meeting.notes);
        }).finally(() => setLoading(false));
    }, [params.meetingId, refreshCounter]);

    const handleNotesBlur = async () => {
        if (!meetingDate) return;
        await meetingServiceRef.current.updateMeeting(getMeetingId(), {
            date: meetingDate.toISOString(),
            notes,
        });
    };

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const [y, m, d] = e.target.value.split("-").map(Number);
        const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
        setMeetingDate(utcNoon);
        await meetingServiceRef.current.updateMeeting(getMeetingId(), {
            date: utcNoon.toISOString(),
            notes,
        });
    };

    const handleToggleCompleted = async (e: React.MouseEvent, item: GetMeetingItemResponse) => {
        e.stopPropagation();
        setCompletingId(item.id);
        try {
            const next = !item.isCompleted;
            await meetingServiceRef.current.setIfMeetingItemIsCompleted(item.id, next);
            setMeetingItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, isCompleted: next } : i))
            );
        } finally {
            setCompletingId(null);
        }
    };

    // View/edit modal
    const openViewItemModal = (item: GetMeetingItemResponse) => {
        setModalItem({ ...item });
        setEditFeatureSearch("");
        setEditFeaturePickerOpen(false);
        setIsEditMode(false);
    };

    const closeViewModal = () => {
        setModalItem(null);
        setIsEditMode(false);
        setEditFeaturePickerOpen(false);
    };

    const handleViewOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === viewOverlayRef.current) closeViewModal();
    };

    const handleCancelEdit = () => {
        if (modalItem?.id) {
            setIsEditMode(false);
        } else {
            closeViewModal();
        }
    };

    const handleSaveMeetingItem = async () => {
        if (!modalItem?.id) return;
        setIsSaving(true);
        try {
            await meetingServiceRef.current.updateMeetingItem(modalItem.id, {
                meetingId: getMeetingId(),
                itemName: modalItem.itemName ?? "",
                itemText: modalItem.itemText ?? "",
                type: modalItem.type ?? MeetingItemType.AGENDA,
            });

            const originalFeatureId = meetingItems.find((i) => i.id === modalItem.id)?.featureId ?? null;
            if (modalItem.featureId !== originalFeatureId) {
                if (originalFeatureId) {
                    await featureServiceRef.current.removeActionItemFromFeature(modalItem.id, originalFeatureId);
                }
                if (modalItem.featureId) {
                    await featureServiceRef.current.addActionItemToFeature(modalItem.id, modalItem.featureId);
                }
            }

            setMeetingItems((prev) =>
                prev.map((item) =>
                    item.id === modalItem.id ? { ...item, ...modalItem, id: modalItem.id! } : item
                )
            );
            setIsEditMode(false);
            setEditFeaturePickerOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Add modal
    const openAddModal = (defaultType: MeetingItemType) => {
        setAddModalDefaultType(defaultType);
        setAddModalTab("new");
        setNewItemName("");
        setNewItemText("");
        setNewItemType(defaultType);
        setNewItemFeatureId(null);
        setNewFeatureSearch("");
        setNewFeaturePickerOpen(false);
        setExistingSearchTerm("");
        meetingServiceRef.current.getAllOpenActionItems().then((res) => {
            setOpenItems(res.meetingItems);
            setOpenItemsToShow(res.meetingItems.filter((item) => !meetingItems.some((i) => i.id === item.id)).slice(0, 20));
        });
        setShowAddModal(true);
    };

    const closeAddModal = () => setShowAddModal(false);

    const handleAddOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === addOverlayRef.current) closeAddModal();
    };

    const handleExistingSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setExistingSearchTerm(term);
        setOpenItemsToShow(
            openItems.filter((i) => i.itemName.toLowerCase().includes(term.toLowerCase())).slice(0, 20)
        );
    };

    const handleAddExistingItem = async (itemId: number) => {
        await meetingServiceRef.current.addItemToMeeting(itemId, getMeetingId());
        closeAddModal();
        setRefreshCounter((c) => c + 1);
    };

    const handleCreateNewItem = async () => {
        if (!newItemName.trim()) return;
        setIsCreating(true);
        try {
            await meetingServiceRef.current.createMeetingItem(getMeetingId(), {
                meetingId: getMeetingId(),
                itemName: newItemName,
                itemText: newItemText,
                type: newItemType,
                featureId: newItemFeatureId ?? undefined,
            });
            closeAddModal();
            setRefreshCounter((c) => c + 1);
        } finally {
            setIsCreating(false);
        }
    };

    const agendaItems = meetingItems.filter((item) => item.type === MeetingItemType.AGENDA);
    const actionItems = meetingItems.filter((item) => item.type === MeetingItemType.ACTION);

    const displayDate = meetingDate
        ? meetingDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : "Meeting";

    const handleDeleteMeeting = async () => {
        setIsDeleting(true);
        try {
            await meetingServiceRef.current.deleteMeeting(getMeetingId());
            router.push("/admin/features/meetings");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === deleteOverlayRef.current) setShowDeleteConfirm(false);
    };

    const handleUnassignItem = async (e: React.MouseEvent, itemId: number) => {
        e.stopPropagation();
        await meetingServiceRef.current.removeItemFromMeeting(itemId, getMeetingId());
        setRefreshCounter((c) => c + 1);
    };

    const renderItemList = (items: GetMeetingItemResponse[], isAction: boolean) => (
        <ul className={styles.itemList}>
            {items.map((item) => (
                <li
                    key={item.id}
                    className={`${styles.item} ${item.isCompleted ? styles.itemCompleted : ""}`}
                    onClick={() => openViewItemModal(item)}
                >
                    <span className={`${styles.itemDot} ${isAction ? styles.itemDotAction : ""}`} />
                    <span className={styles.itemName}>{item.itemName}</span>
                    <button
                        className={`${styles.completeButton} ${item.isCompleted ? styles.completeButtonDone : ""}`}
                        onClick={(e) => handleToggleCompleted(e, item)}
                        disabled={completingId === item.id}
                        title={item.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        className={styles.unassignButton}
                        onClick={(e) => handleUnassignItem(e, item.id)}
                        title="Remove from meeting"
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    Founder's Meeting
                </div>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>
                        {loading ? "Loading…" : displayDate}
                    </h1>
                    <button
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete meeting"
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2 3.5h9M5 3.5V2.5h3v1M4.5 3.5v6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            <Link href="/admin/features/meetings" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Meetings
            </Link>

            <div className={styles.dateField}>
                <label className={styles.dateLabel} htmlFor="meeting-date">Meeting Date</label>
                <input
                    id="meeting-date"
                    className={styles.dateInput}
                    type="date"
                    value={meetingDate ? toLocalDateInputValue(meetingDate) : ""}
                    onChange={handleDateChange}
                />
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.loadingPulse} />
                    <div className={styles.loadingPulse} style={{ width: "60%" }} />
                    <div className={styles.loadingPulse} style={{ width: "80%" }} />
                </div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Notes</div>
                        <textarea
                            className={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={handleNotesBlur}
                            placeholder="Add notes for this meeting…"
                        />
                    </div>

                    <div className={styles.columnsGrid}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionTitle}>Agenda Items</div>
                                <button className={styles.addItemButton} onClick={() => openAddModal(MeetingItemType.AGENDA)}>
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                            {agendaItems.length === 0 ? (
                                <p className={styles.emptyState}>No agenda items.</p>
                            ) : renderItemList(agendaItems, false)}
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionTitle}>Action Items</div>
                                <button className={styles.addItemButton} onClick={() => openAddModal(MeetingItemType.ACTION)}>
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                            {actionItems.length === 0 ? (
                                <p className={styles.emptyState}>No action items.</p>
                            ) : renderItemList(actionItems, true)}
                        </div>
                    </div>
                </div>
            )}

            {/* View / edit modal */}
            {modalItem && (
                <div className={styles.modalOverlay} ref={viewOverlayRef} onClick={handleViewOverlayClick}>
                    <div className={styles.modal}>
                        {isEditMode ? (
                            <>
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>Edit Item</h2>
                                    <select
                                        className={styles.modalTypeSelect}
                                        value={modalItem.type}
                                        onChange={(e) => setModalItem({ ...modalItem, type: e.target.value as MeetingItemType })}
                                    >
                                        <option value={MeetingItemType.AGENDA}>Agenda Item</option>
                                        <option value={MeetingItemType.ACTION}>Action Item</option>
                                    </select>
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="edit-item-name">Name</label>
                                    <input
                                        id="edit-item-name"
                                        className={styles.modalInput}
                                        type="text"
                                        value={modalItem.itemName ?? ""}
                                        onChange={(e) => setModalItem({ ...modalItem, itemName: e.target.value })}
                                        placeholder="Short title for this item…"
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="edit-item-text">Description</label>
                                    <textarea
                                        id="edit-item-text"
                                        className={styles.modalTextarea}
                                        value={modalItem.itemText ?? ""}
                                        onChange={(e) => setModalItem({ ...modalItem, itemText: e.target.value })}
                                        placeholder="Additional details or context…"
                                        rows={3}
                                    />
                                </div>

                                {modalItem.type === MeetingItemType.ACTION && (
                                    <div className={styles.modalField}>
                                        <label className={styles.modalLabel}>Feature</label>
                                        {modalItem.featureId ? (
                                            <div className={styles.featureSelected}>
                                                <span className={styles.featureSelectedName}>
                                                    {allFeatures.find((f) => f.id === modalItem.featureId)?.name ?? "Unknown feature"}
                                                </span>
                                                <button
                                                    className={styles.featureClearButton}
                                                    onClick={() => setModalItem({ ...modalItem, featureId: undefined })}
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.featurePicker}>
                                                <input
                                                    className={styles.modalInput}
                                                    type="text"
                                                    placeholder="Search features…"
                                                    value={editFeatureSearch}
                                                    onChange={(e) => setEditFeatureSearch(e.target.value)}
                                                    onFocus={() => setEditFeaturePickerOpen(true)}
                                                />
                                                {editFeaturePickerOpen && (
                                                    <div className={styles.featureDropdown}>
                                                        {allFeatures
                                                            .filter((f) => f.name.toLowerCase().includes(editFeatureSearch.toLowerCase()))
                                                            .slice(0, 10)
                                                            .map((f) => (
                                                                <button
                                                                    key={f.id}
                                                                    className={styles.featureDropdownItem}
                                                                    onClick={() => {
                                                                        setModalItem({ ...modalItem, featureId: f.id });
                                                                        setEditFeatureSearch("");
                                                                        setEditFeaturePickerOpen(false);
                                                                    }}
                                                                >
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        {allFeatures.filter((f) => f.name.toLowerCase().includes(editFeatureSearch.toLowerCase())).length === 0 && (
                                                            <p className={styles.featureDropdownEmpty}>No features found.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    <button className={styles.cancelButton} onClick={handleCancelEdit} disabled={isSaving}>
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.confirmButton}
                                        onClick={handleSaveMeetingItem}
                                        disabled={isSaving || !modalItem.itemName?.trim()}
                                    >
                                        {isSaving ? "Saving…" : "Save Changes"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.modalViewHeader}>
                                    <span className={`${styles.modalTypeBadge} ${modalItem.type === MeetingItemType.ACTION ? styles.modalTypeBadgeAction : ""}`}>
                                        {modalItem.type === MeetingItemType.AGENDA ? "Agenda Item" : "Action Item"}
                                    </span>
                                    {modalItem.isCompleted && (
                                        <span className={styles.modalCompletedBadge}>Completed</span>
                                    )}
                                </div>

                                <div className={styles.modalViewBody}>
                                    <h3 className={styles.modalViewName}>{modalItem.itemName}</h3>
                                    {modalItem.itemText ? (
                                        <p className={styles.modalViewText}>{modalItem.itemText}</p>
                                    ) : (
                                        <p className={styles.modalViewTextEmpty}>No description.</p>
                                    )}
                                    {modalItem.featureId && (
                                        <div className={styles.modalViewFeature}>
                                            <span className={styles.modalViewFeatureLabel}>Feature</span>
                                            <span className={styles.modalViewFeatureName}>
                                                {allFeatures.find((f) => f.id === modalItem.featureId)?.name ?? "Unknown feature"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.modalActions}>
                                    <button className={styles.cancelButton} onClick={closeViewModal}>
                                        Close
                                    </button>
                                    <button className={styles.editButton} onClick={() => setIsEditMode(true)}>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className={styles.modalOverlay} ref={deleteOverlayRef} onClick={handleDeleteOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Delete Meeting</h2>
                        </div>
                        <p className={styles.deleteConfirmText}>
                            Are you sure you want to delete <strong>{displayDate}</strong>? This cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                                Cancel
                            </button>
                            <button className={styles.deleteConfirmButton} onClick={handleDeleteMeeting} disabled={isDeleting}>
                                {isDeleting ? "Deleting…" : "Delete Meeting"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add item modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} ref={addOverlayRef} onClick={handleAddOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Add Item</h2>
                        </div>

                        <div className={styles.modalTabs}>
                            <button
                                className={`${styles.modalTab} ${addModalTab === "new" ? styles.modalTabActive : ""}`}
                                onClick={() => setAddModalTab("new")}
                            >
                                Create New
                            </button>
                            <button
                                className={`${styles.modalTab} ${addModalTab === "existing" ? styles.modalTabActive : ""}`}
                                onClick={() => setAddModalTab("existing")}
                            >
                                Add Existing
                            </button>
                        </div>

                        {addModalTab === "new" ? (
                            <>
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="new-item-type">Type</label>
                                    <select
                                        id="new-item-type"
                                        className={styles.modalTypeSelect}
                                        value={newItemType}
                                        onChange={(e) => setNewItemType(e.target.value as MeetingItemType)}
                                    >
                                        <option value={MeetingItemType.AGENDA}>Agenda Item</option>
                                        <option value={MeetingItemType.ACTION}>Action Item</option>
                                    </select>
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="new-item-name">Name</label>
                                    <input
                                        id="new-item-name"
                                        className={styles.modalInput}
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="Short title for this item…"
                                        autoFocus
                                    />
                                </div>

                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="new-item-text">Description</label>
                                    <textarea
                                        id="new-item-text"
                                        className={styles.modalTextarea}
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        placeholder="Additional details or context…"
                                        rows={3}
                                    />
                                </div>

                                {newItemType === MeetingItemType.ACTION && (
                                    <div className={styles.modalField}>
                                        <label className={styles.modalLabel}>Feature</label>
                                        {newItemFeatureId ? (
                                            <div className={styles.featureSelected}>
                                                <span className={styles.featureSelectedName}>
                                                    {allFeatures.find((f) => f.id === newItemFeatureId)?.name ?? "Unknown feature"}
                                                </span>
                                                <button
                                                    className={styles.featureClearButton}
                                                    onClick={() => setNewItemFeatureId(null)}
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.featurePicker}>
                                                <input
                                                    className={styles.modalInput}
                                                    type="text"
                                                    placeholder="Search features…"
                                                    value={newFeatureSearch}
                                                    onChange={(e) => setNewFeatureSearch(e.target.value)}
                                                    onFocus={() => setNewFeaturePickerOpen(true)}
                                                />
                                                {newFeaturePickerOpen && (
                                                    <div className={styles.featureDropdown}>
                                                        {allFeatures
                                                            .filter((f) => f.name.toLowerCase().includes(newFeatureSearch.toLowerCase()))
                                                            .slice(0, 10)
                                                            .map((f) => (
                                                                <button
                                                                    key={f.id}
                                                                    className={styles.featureDropdownItem}
                                                                    onClick={() => {
                                                                        setNewItemFeatureId(f.id);
                                                                        setNewFeatureSearch("");
                                                                        setNewFeaturePickerOpen(false);
                                                                    }}
                                                                >
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        {allFeatures.filter((f) => f.name.toLowerCase().includes(newFeatureSearch.toLowerCase())).length === 0 && (
                                                            <p className={styles.featureDropdownEmpty}>No features found.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.modalActions}>
                                    <button className={styles.cancelButton} onClick={closeAddModal} disabled={isCreating}>
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.confirmButton}
                                        onClick={handleCreateNewItem}
                                        disabled={isCreating || !newItemName.trim()}
                                    >
                                        {isCreating ? "Creating…" : "Add Item"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.modalField}>
                                    <label className={styles.modalLabel} htmlFor="existing-search">Search</label>
                                    <input
                                        id="existing-search"
                                        className={styles.modalInput}
                                        type="text"
                                        placeholder="Filter by name…"
                                        value={existingSearchTerm}
                                        onChange={handleExistingSearch}
                                        autoFocus
                                    />
                                </div>

                                {openItemsToShow.length === 0 ? (
                                    <p className={styles.modalEmpty}>No open action items found.</p>
                                ) : (
                                    <div className={styles.modalList}>
                                        {openItemsToShow.map((item) => (
                                            <button
                                                key={item.id}
                                                className={styles.modalItem}
                                                onClick={() => handleAddExistingItem(item.id)}
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
