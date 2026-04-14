import type { TurboModule } from 'react-native';
export interface Spec extends TurboModule {
    startReading(params: {
        bacKey: {
            documentNo: string;
            expiryDate: string;
            birthDate: string;
        };
        includeImages?: boolean;
    }): Promise<{
        birthDate: string;
        placeOfBirth?: string;
        documentNo: string;
        expiryDate: string;
        firstName: string;
        gender: string;
        identityNo?: string;
        lastName: string;
        mrz: string;
        nationality: string;
        originalFacePhoto?: string;
    }>;
    stopReading(): void;
    isNfcEnabled(): Promise<boolean>;
    isNfcSupported(): Promise<boolean>;
    openNfcSettings(): Promise<boolean>;
    addListener(eventName: string): void;
    removeListeners(count: number): void;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeNfcPassportReader.d.ts.map