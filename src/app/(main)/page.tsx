import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Welcome to BlueCaller</h1>
      <div className={styles.content}>
        <div className={styles.icon}>🚧</div>
        <p>Eventually this will offer online tools for BlueCaller</p>
        <p>Right now it will only be an admin portal</p>
      </div>
    </div>
  );
}
