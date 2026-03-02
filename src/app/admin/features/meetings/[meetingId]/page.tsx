"use client";

import { MeetingService } from "@/services/page-services.ts/feature-services";
import { useEffect, useRef, useState } from "react";
import { GetMeetingItemResponse, MeetingItemType } from "@/responses/feature-responses";
import styles from "./page.module.css";
import { useParams } from "next/navigation";
import Link from "next/link";

const meetingService = new MeetingService();

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
    const getMeetingId = () => parseInt(params.meetingId);

    const [loading, setLoading] = useState(true);
    const [meetingDate, setMeetingDate] = useState<Date | null>(null);
    const [meetingItems, setMeetingItems] = useState<GetMeetingItemResponse[]>([]);
    const [notes, setNotes] = useState<string>("");
    const [modalItem, setModalItem] = useState<ModalItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [completingId, setCompletingId] = useState<number | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = getMeetingId();
        if (isNaN(id)) return;
        setLoading(true);
        meetingService.getMeeting(id).then((meeting) => {
            setMeetingDate(meeting.date);
            setMeetingItems(meeting.meetingItems);
            setNotes(meeting.notes);
        }).finally(() => setLoading(false));
    }, [params.meetingId, refreshCounter]);

    const handleNotesBlur = async () => {
        if (!meetingDate) return;
        await meetingService.updateMeeting(getMeetingId(), {
            date: meetingDate.toISOString(),
            notes,
        });
    };

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = fromLocalDateInputValue(e.target.value);
        setMeetingDate(newDate);
        await meetingService.updateMeeting(getMeetingId(), {
            date: newDate.toISOString(),
            notes,
        });
    };

    const handleToggleCompleted = async (e: React.MouseEvent, item: GetMeetingItemResponse) => {
        e.stopPropagation();
        setCompletingId(item.id);
        try {
            const next = !item.isCompleted;
            await meetingService.setIfMeetingItemIsCompleted(item.id, next);
            setMeetingItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, isCompleted: next } : i))
            );
        } finally {
            setCompletingId(null);
        }
    };

    const openNewItemModal = (type: MeetingItemType) => {
        setModalItem({ id: null, itemName: "", itemText: "", isCompleted: false, type });
    };

    const openEditItemModal = (item: GetMeetingItemResponse) => {
        setModalItem({ ...item });
    };

    const closeModal = () => setModalItem(null);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) closeModal();
    };

    const handleSaveMeetingItem = async () => {
        if (!modalItem) return;
        setIsSaving(true);
        try {
            const payload = {
                meetingId: getMeetingId(),
                itemName: modalItem.itemName ?? "",
                itemText: modalItem.itemText ?? "",
                type: modalItem.type ?? MeetingItemType.AGENDA,
            };

            if (modalItem.id) {
                await meetingService.updateMeetingItem(modalItem.id, payload);
                setMeetingItems((prev) =>
                    prev.map((item) =>
                        item.id === modalItem.id ? { ...item, ...modalItem, id: modalItem.id! } : item
                    )
                );
            } else {
                await meetingService.createMeetingItem(getMeetingId(), payload);
                setRefreshCounter((c) => c + 1);
            }
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const agendaItems = meetingItems.filter((item) => item.type === MeetingItemType.AGENDA);
    const actionItems = meetingItems.filter((item) => item.type === MeetingItemType.ACTION);

    const displayDate = meetingDate
        ? meetingDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : "Meeting";

    const renderItemList = (items: GetMeetingItemResponse[], isAction: boolean) => (
        <ul className={styles.itemList}>
            {items.map((item) => (
                <li
                    key={item.id}
                    className={`${styles.item} ${item.isCompleted ? styles.itemCompleted : ""}`}
                    onClick={() => openEditItemModal(item)}
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
                <h1 className={styles.title}>
                    {loading ? "Loading…" : displayDate}
                </h1>
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
                                <button className={styles.addItemButton} onClick={() => openNewItemModal(MeetingItemType.AGENDA)}>
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
                                <button className={styles.addItemButton} onClick={() => openNewItemModal(MeetingItemType.ACTION)}>
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

            {modalItem && (
                <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {modalItem.id ? "Edit Item" : "New Item"}
                            </h2>
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
                            <label className={styles.modalLabel} htmlFor="item-name">Name</label>
                            <input
                                id="item-name"
                                className={styles.modalInput}
                                type="text"
                                value={modalItem.itemName ?? ""}
                                onChange={(e) => setModalItem({ ...modalItem, itemName: e.target.value })}
                                placeholder="Short title for this item…"
                                autoFocus
                            />
                        </div>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel} htmlFor="item-text">Description</label>
                            <textarea
                                id="item-text"
                                className={styles.modalTextarea}
                                value={modalItem.itemText ?? ""}
                                onChange={(e) => setModalItem({ ...modalItem, itemText: e.target.value })}
                                placeholder="Additional details or context…"
                                rows={3}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={closeModal} disabled={isSaving}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleSaveMeetingItem}
                                disabled={isSaving || !modalItem.itemName?.trim()}
                            >
                                {isSaving ? "Saving…" : modalItem.id ? "Save Changes" : "Add Item"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
