import { DeviceEventEmitter, Platform } from 'react-native';
import NativeNfcPassportReader from './NativeNfcPassportReader';
import { DG13Decoder, DG13Data, DG13_LABELS } from './dg13Decoder';

export { DG13Decoder, DG13Data, DG13_LABELS };

const LINKING_ERROR =
  `The package 'react-native-nfc-passport-reader' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';
const NfcPassportReaderNativeModule = NativeNfcPassportReader
  ? NativeNfcPassportReader
  : new Proxy({} as any, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
enum NfcPassportReaderEvent {
  TAG_DISCOVERED = 'onTagDiscovered',
  NFC_STATE_CHANGED = 'onNfcStateChanged',
}
export type StartReadingParams = {
  bacKey: {
    documentNo: string;
    expiryDate: string;
    birthDate: string;
  };
  includeImages?: boolean; // default: false
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
  originalFacePhoto?: string; // base64
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
  dg13?: DG13Data;
};
export default class NfcPassportReader {
  static async startReading(params: StartReadingParams): Promise<NfcResult> {
    const result = await NfcPassportReaderNativeModule.startReading(params);
    const rawDG13 = result.rawDump?.DG13 || result.rawDump?.dg13;
    if (rawDG13) {
      result.dg13 = DG13Decoder.decode(rawDG13);
    }
    return result;
  }
  static stopReading() {
    if (Platform.OS === 'android') {
      NfcPassportReaderNativeModule.stopReading();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static addOnTagDiscoveredListener(callback: () => void) {
    if (Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.TAG_DISCOVERED, callback);
    }
  }
  static addOnNfcStateChangedListener(callback: (state: 'off' | 'on') => void) {
    if (Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.NFC_STATE_CHANGED, callback);
    }
  }
  static isNfcEnabled(): Promise<boolean> {
    if (Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.isNfcEnabled();
    } else if (Platform.OS === 'ios') {
      return NfcPassportReaderNativeModule.isNfcSupported();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static isNfcSupported(): Promise<boolean> {
    return NfcPassportReaderNativeModule.isNfcSupported();
  }
  static openNfcSettings(): Promise<boolean> {
    if (Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.openNfcSettings();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  private static addListener(
    event: NfcPassportReaderEvent,
    callback: (data: any) => void
  ) {
    DeviceEventEmitter.addListener(event, callback);
  }
  static removeListeners() {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.removeAllListeners(
        NfcPassportReaderEvent.TAG_DISCOVERED
      );
      DeviceEventEmitter.removeAllListeners(
        NfcPassportReaderEvent.NFC_STATE_CHANGED
      );
    }
  }
}
