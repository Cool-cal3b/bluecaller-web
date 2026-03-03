"use client";

import { Feature, FeaturePriority } from "@/responses/feature-responses";
import styles from "./page.module.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FeatureService } from "@/services/page-services.ts/feature-services";

export default function FeaturePage() {
    const params: { featureId: string } = useParams();
    const getFeatureId = () => parseInt(params.featureId);

    const featureServiceRef = useRef(new FeatureService());

    const [feature, setFeature] = useState<Feature | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    useEffect(() => {
        const id = getFeatureId();
        if (isNaN(id)) return;
        setIsLoading(true);
        featureServiceRef.current.getFeature(id).then(setFeature).finally(() => setIsLoading(false));
    }, [params.featureId]);

    const patch = (changes: Partial<Feature>) => {
        setFeature((prev) => (prev ? { ...prev, ...changes } : prev));
    };

    const saveFeature = async () => {
        if (!feature) return;
        setIsSaving(true);
        try {
            await featureServiceRef.current.updateFeature(feature.id, {
                featureName: feature.name,
                featureDescription: feature.description,
                priority: feature.priority,
                yearGoal: feature.yearGoal,
                quarterGoal: feature.quarterGoal,
            });
            setSavedAt(new Date());
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    Features
                </div>
                <h1 className={styles.title}>{isLoading ? "Loading…" : (feature?.name ?? "Feature")}</h1>
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

                    <div className={styles.formFooter}>
                        <button className={styles.saveButton} onClick={saveFeature} disabled={isSaving}>
                            {isSaving ? "Saving…" : "Save"}
                        </button>
                        {savedAt && !isSaving && (
                            <span className={styles.savedAt}>
                                Saved at {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}