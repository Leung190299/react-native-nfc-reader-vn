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
    LDSVersion?: string;
    dataGroupsPresent?: string[];
    passportCorrectlySigned?: boolean;
    documentSigningCertificateVerified?: boolean;
    passportDataNotTampered?: boolean;
    activeAuthenticationPassed?: boolean;
    documentType?: string;
    documentSubType?: string;
    issuingAuthority?: string;
    residenceAddress?: string;
    phoneNumber?: string;
    dataGroupsAvailable?: string[];
    rawDump?: Record<string, string>;
    unicodeVersion?: string;
    verificationErrors?: string[];
    dataGroupHashes?: Record<string, {
        id: string;
        sodHash: string;
        computedHash: string;
        match: boolean;
    }>;
    data_object?: Record<string, Record<string, string>>;
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