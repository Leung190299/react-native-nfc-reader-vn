export type StartReadingParams = {
    bacKey: {
        documentNo: string;
        expiryDate: string;
        birthDate: string;
    };
    includeImages?: boolean;
};
export type NfcResult = {
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
};
export default class NfcPassportReader {
    static startReading(params: StartReadingParams): Promise<NfcResult>;
    static stopReading(): void;
    static addOnTagDiscoveredListener(callback: () => void): void;
    static addOnNfcStateChangedListener(callback: (state: 'off' | 'on') => void): void;
    static isNfcEnabled(): Promise<boolean>;
    static isNfcSupported(): Promise<boolean>;
    static openNfcSettings(): Promise<boolean>;
    private static addListener;
    static removeListeners(): void;
}
//# sourceMappingURL=index.d.ts.map