export interface DG13Data {
    identityNo?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    ethnicity?: string;
    religion?: string;
    placeOfOrigin?: string;
    placeOfResidence?: string;
    personalIdentification?: string;
    issueDate?: string;
    expiryDate?: string;
    parentSpouseName?: string;
    rawFields?: Record<string, string>;
}
export declare const DG13_LABELS: Record<keyof Omit<DG13Data, 'rawFields'>, string>;
export declare class DG13Decoder {
    static decode(base64Data: string): DG13Data;
    static decodeBytes(bytes: Uint8Array): DG13Data;
    private static parseFlat;
    private static extractFieldsFromCompound;
    private static splitBySeparator;
    private static extractFromSequence;
    private static parseFieldsByOrder;
    private static parseLength;
    private static bytesToString;
    private static base64ToBytes;
    static decodeFromDataGroups(dataGroupsAvailable?: string[], data_object?: Record<string, Record<string, string>>): DG13Data;
}
//# sourceMappingURL=dg13Decoder.d.ts.map