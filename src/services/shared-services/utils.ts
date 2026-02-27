import { APIService } from "./api-service";

export class Utils {
    private static readonly IN_DEV_MODE_KEY = 'inDevMode';
    private static inDevModeTrueValue = 'true';
    private static readonly isInDevModeFalseValue = 'false';

    public static async isDevMode(): Promise<boolean> {
        if (typeof window === "undefined") return false;

        const inDevModeFromLocalStorage = localStorage.getItem(this.IN_DEV_MODE_KEY);
        if (inDevModeFromLocalStorage) return inDevModeFromLocalStorage === this.inDevModeTrueValue;

        const response = await fetch('/api/in-dev-mode');
        const { inDevMode }: { inDevMode: boolean } = await response.json();

        const inDevModeValue = inDevMode ? this.inDevModeTrueValue : this.isInDevModeFalseValue;
        localStorage.setItem(this.IN_DEV_MODE_KEY, inDevModeValue);

        return inDevMode;
    }
}