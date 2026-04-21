"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DG13Data", {
  enumerable: true,
  get: function () {
    return _dg13Decoder.DG13Data;
  }
});
Object.defineProperty(exports, "DG13Decoder", {
  enumerable: true,
  get: function () {
    return _dg13Decoder.DG13Decoder;
  }
});
Object.defineProperty(exports, "DG13_LABELS", {
  enumerable: true,
  get: function () {
    return _dg13Decoder.DG13_LABELS;
  }
});
exports.default = void 0;
var _reactNative = require("react-native");
var _NativeNfcPassportReader = _interopRequireDefault(require("./NativeNfcPassportReader"));
var _dg13Decoder = require("./dg13Decoder");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LINKING_ERROR = `The package 'react-native-nfc-passport-reader' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const NfcPassportReaderNativeModule = _NativeNfcPassportReader.default ? _NativeNfcPassportReader.default : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var NfcPassportReaderEvent = /*#__PURE__*/function (NfcPassportReaderEvent) {
  NfcPassportReaderEvent["TAG_DISCOVERED"] = "onTagDiscovered";
  NfcPassportReaderEvent["NFC_STATE_CHANGED"] = "onNfcStateChanged";
  return NfcPassportReaderEvent;
}(NfcPassportReaderEvent || {});
class NfcPassportReader {
  static async startReading(params) {
    const result = await NfcPassportReaderNativeModule.startReading(params);
    if (result.dataGroupsAvailable && result.data_object) {
      result.dg13 = _dg13Decoder.DG13Decoder.decodeFromDataGroups(result.dataGroupsAvailable, result.data_object);
    }
    return result;
  }
  static stopReading() {
    if (_reactNative.Platform.OS === 'android') {
      NfcPassportReaderNativeModule.stopReading();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static addOnTagDiscoveredListener(callback) {
    if (_reactNative.Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.TAG_DISCOVERED, callback);
    }
  }
  static addOnNfcStateChangedListener(callback) {
    if (_reactNative.Platform.OS === 'android') {
      this.addListener(NfcPassportReaderEvent.NFC_STATE_CHANGED, callback);
    }
  }
  static isNfcEnabled() {
    if (_reactNative.Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.isNfcEnabled();
    } else if (_reactNative.Platform.OS === 'ios') {
      return NfcPassportReaderNativeModule.isNfcSupported();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static isNfcSupported() {
    return NfcPassportReaderNativeModule.isNfcSupported();
  }
  static openNfcSettings() {
    if (_reactNative.Platform.OS === 'android') {
      return NfcPassportReaderNativeModule.openNfcSettings();
    } else {
      throw new Error('Unsupported platform');
    }
  }
  static addListener(event, callback) {
    _reactNative.DeviceEventEmitter.addListener(event, callback);
  }
  static removeListeners() {
    if (_reactNative.Platform.OS === 'android') {
      _reactNative.DeviceEventEmitter.removeAllListeners(NfcPassportReaderEvent.TAG_DISCOVERED);
      _reactNative.DeviceEventEmitter.removeAllListeners(NfcPassportReaderEvent.NFC_STATE_CHANGED);
    }
  }
}
exports.default = NfcPassportReader;
//# sourceMappingURL=index.js.map