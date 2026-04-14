import { DeviceEventEmitter, Platform } from 'react-native';
import NativeNfcPassportReader from './NativeNfcPassportReader';
const LINKING_ERROR = `The package 'react-native-nfc-passport-reader' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const NfcPassportReaderNativeModule = NativeNfcPassportReader ? NativeNfcPassportReader : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var NfcPassportReaderEvent = /*#__PURE__*/function (NfcPassportReaderEvent) {
  NfcPassportReaderEvent["TAG_DISCOVERED"] = "onTagDiscovered";
  NfcPassportReaderEvent["NFC_STATE_CHANGED"] = "onNfcStateChanged";
  return NfcPassportReaderEvent;
}(NfcPassportReaderEvent || {});
export default class NfcPassportReader {
  static startReading(params) {
    return NfcPassportReaderNativeModule.startReading(params);
  }
  static stopReading() {
    if (Platform.OS === 'android') {
      NfcPassportReaderNativeModule.stopReading();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static addOnTagDiscoveredListener(callback) {
    if (Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.TAG_DISCOVERED, callback);
    }
  }
  static addOnNfcStateChangedListener(callback) {
    if (Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.NFC_STATE_CHANGED, callback);
    }
  }
  static isNfcEnabled() {
    if (Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.isNfcEnabled();
    } else if (Platform.OS === 'ios') {
      return NfcPassportReaderNativeModule.isNfcSupported();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static isNfcSupported() {
    return NfcPassportReaderNativeModule.isNfcSupported();
  }
  static openNfcSettings() {
    if (Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.openNfcSettings();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static addListener(event, callback) {
    DeviceEventEmitter.addListener(event, callback);
  }
  static removeListeners() {
    if (Platform.OS === 'android') {
      DeviceEventEmitter.removeAllListeners(NfcPassportReaderEvent.TAG_DISCOVERED);
      DeviceEventEmitter.removeAllListeners(NfcPassportReaderEvent.NFC_STATE_CHANGED);
    }
  }
}
//# sourceMappingURL=index.js.map