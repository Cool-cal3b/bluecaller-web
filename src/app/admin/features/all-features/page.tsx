"use client";
import { Feature, FeaturePriority } from "@/responses/feature-responses";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { FeatureService } from "@/services/page-services.ts/feature-services";
import Link from "next/link";

const PRIORITY_LABEL: Record<FeaturePriority, string> = {
    [FeaturePriority.HIGH]: "High",
    [FeaturePriority.MEDIUM]: "Medium",
    [FeaturePriority.LOW]: "Low",
    [FeaturePriority.BACKLOG]: "Backlog",
};

const PRIORITY_CLASS: Record<FeaturePriority, string> = {
    [FeaturePriority.HIGH]: styles.badgeHigh,
    [FeaturePriority.MEDIUM]: styles.badgeMedium,
    [FeaturePriority.LOW]: styles.badgeLow,
    [FeaturePriority.BACKLOG]: styles.badgeBacklog,
};

export default function AllFeaturesPage() {
    const featureServiceRef = useRef(new FeatureService());

    const [modalFeatureName, setModalFeatureName] = useState("");
    const [modalFeatureDescription, setModalFeatureDescription] = useState("");
    const [modalFeaturePriority, setModalFeaturePriority] = useState<FeaturePriority>(FeaturePriority.HIGH);
    const [modalFeatureYearGoal, setModalFeatureYearGoal] = useState(new Date().getFullYear());
    const [modalFeatureQuarterGoal, setModalFeatureQuarterGoal] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        featureServiceRef.current.getFeatures().then(setAllFeatures).finally(() => setIsLoading(false));
    }, [refreshCounter]);

    const openModal = () => {
        setModalFeatureName("");
        setModalFeatureDescription("");
        setModalFeaturePriority(FeaturePriority.HIGH);
        setModalFeatureYearGoal(new Date().getFullYear());
        setModalFeatureQuarterGoal(1);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) closeModal();
    };

    const handleCreateFeature = async () => {
        if (!modalFeatureName.trim()) return;
        setIsCreating(true);
        try {
            await featureServiceRef.current.createFeature({
                featureName: modalFeatureName,
                featureDescription: modalFeatureDescription,
                priority: modalFeaturePriority,
                yearGoal: modalFeatureYearGoal,
                quarterGoal: modalFeatureQuarterGoal,
            });
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
                    Features
                </div>
                <h1 className={styles.title}>All Features</h1>
                <p className={styles.description}>Browse and create product features tracked across meetings.</p>
            </div>

            <Link href="/admin/features" className={styles.backLink}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Features
            </Link>

            <div>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>All Features</span>
                    <button className={styles.createButton} onClick={openModal}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                        New Feature
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingPulse} />
                        <div className={styles.loadingPulse} style={{ width: "85%" }} />
                        <div className={styles.loadingPulse} style={{ width: "70%" }} />
                    </div>
                ) : allFeatures.length === 0 ? (
                    <p className={styles.emptyState}>No features yet. Create your first feature above.</p>
                ) : (
                    <div className={styles.featureList}>
                        {allFeatures.map((feature) => (
                            <Link href={`/admin/features/all-features/${feature.id}`} key={feature.id} className={styles.featureCard}>
                                <span className={styles.featureCardDot} />
                                <div className={styles.featureCardBody}>
                                    <span className={styles.featureCardName}>{feature.name}</span>
                                    {feature.description && (
                                        <span className={styles.featureCardDesc}>{feature.description}</span>
                                    )}
                                    <div className={styles.featureCardMeta}>
                                        <span className={`${styles.badge} ${PRIORITY_CLASS[feature.priority as FeaturePriority]}`}>
                                            {PRIORITY_LABEL[feature.priority as FeaturePriority]}
                                        </span>
                                        <span className={styles.featureCardGoal}>Q{feature.quarterGoal} {feature.yearGoal}</span>
                                    </div>
                                </div>
                                <svg className={styles.featureCardArrow} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>New Feature</h2>
                            <p className={styles.modalSubtitle}>Add a new product feature to track.</p>
                        </div>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel} htmlFor="feature-name">Feature Name</label>
                            <input
                                id="feature-name"
                                className={styles.modalInput}
                                type="text"
                                placeholder="e.g. Dark mode"
                                value={modalFeatureName}
                                onChange={(e) => setModalFeatureName(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel} htmlFor="feature-description">Description</label>
                            <textarea
                                id="feature-description"
                                className={styles.modalTextarea}
                                placeholder="Brief description of the feature"
                                value={modalFeatureDescription}
                                onChange={(e) => setModalFeatureDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className={styles.modalRow}>
                            <div className={styles.modalField}>
                                <label className={styles.modalLabel} htmlFor="feature-priority">Priority</label>
                                <select
                                    id="feature-priority"
                                    className={styles.modalSelect}
                                    value={modalFeaturePriority}
                                    onChange={(e) => setModalFeaturePriority(Number(e.target.value) as FeaturePriority)}
                                >
                                    <option value={FeaturePriority.HIGH}>High</option>
                                    <option value={FeaturePriority.MEDIUM}>Medium</option>
                                    <option value={FeaturePriority.LOW}>Low</option>
                                    <option value={FeaturePriority.BACKLOG}>Backlog</option>
                                </select>
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel} htmlFor="feature-quarter">Quarter</label>
                                <select
                                    id="feature-quarter"
                                    className={styles.modalSelect}
                                    value={modalFeatureQuarterGoal}
                                    onChange={(e) => setModalFeatureQuarterGoal(Number(e.target.value))}
                                >
                                    <option value={1}>Q1</option>
                                    <option value={2}>Q2</option>
                                    <option value={3}>Q3</option>
                                    <option value={4}>Q4</option>
                                </select>
                            </div>

                            <div className={styles.modalField}>
                                <label className={styles.modalLabel} htmlFor="feature-year">Year</label>
                                <input
                                    id="feature-year"
                                    className={styles.modalInput}
                                    type="number"
                                    value={modalFeatureYearGoal}
                                    onChange={(e) => setModalFeatureYearGoal(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={closeModal} disabled={isCreating}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleCreateFeature}
                                disabled={isCreating || !modalFeatureName.trim()}
                            >
                                {isCreating ? "Creating…" : "Create Feature"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}