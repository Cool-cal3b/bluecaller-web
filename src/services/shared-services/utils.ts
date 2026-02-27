import { APIService } from "./api-service";

export class Utils {
    private static readonly IN_DEV_MODE_KEY = 'inDevMode';
    private static inDevModeTrueValue = 'true';

    public static async isDevMode(): Promise<boolean> {
        const inDevModeFromLocalStorage = localStorage.getItem(this.IN_DEV_MODE_KEY);
        if (inDevModeFromLocalStorage) return inDevModeFromLocalStorage === this.inDevModeTrueValue;

        const response = await fetch('/api/in-dev-mode');
        const { inDevMode }: { inDevMode: boolean } = await response.json();
        console.log(`In dev mode: ${inDevMode}`);

        localStorage.setItem(this.IN_DEV_MODE_KEY, this.inDevModeTrueValue);
        return inDevMode;
    }
}