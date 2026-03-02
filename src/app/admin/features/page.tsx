"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function FeaturesPage() {
  return (
    <div>
      <h1>Features</h1>
      <div>
        <Link href="/admin/features/meetings">Meetings</Link>
      </div>
    </div>
  );
}