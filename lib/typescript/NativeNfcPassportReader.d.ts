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
        rawDump?: Object;
        unicodeVersion?: string;
        verificationErrors?: string[];
        dataGroupHashes?: Object;
        data_object?: Object;
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