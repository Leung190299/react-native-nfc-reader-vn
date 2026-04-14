# NFC Passport Reader for React Native

This React Native plugin enables the reading of NFC-enabled passports using native device capabilities. It provides a user-friendly interface for initiating and handling NFC operations, including reading passport data, checking NFC support, and managing NFC settings.

## Features

- Start and stop NFC passport reading
- Basic Access Control (BAC) support for secure passport reading
- Check if NFC is supported and enabled on the device
- Open device NFC settings
- Support for both iOS and Android platforms
- Optional image extraction from passport

## Installation

To use the NFC Passport Reader in your React Native project, follow these steps:

1. **Install the Plugin**:
   ```sh
   npm install react-native-nfc-passport-reader
   ```
2. **Link Native Modules (if required for versions below React Native 0.60)**:
   ```sh
   npx react-native link react-native-nfc-passport-reader
   ```
3. **iOS Additional Setup**:
   - Modify your Info.plist to include necessary NFC usage descriptions.
     ```xml
     <key>NFCReaderUsageDescription</key>
     <string>This app requires NFC access to verify your identity.</string>
     <key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
     <array>
      <string>A0000000041010</string>
     <string>A0000000042010</string>
     <string>A0000000043060</string>
     <string>A0000000031010</string>
     <string>A000000003101001</string>
     <string>A000000003101002</string>
     <string>A0000000032010</string>
     <string>A0000000651010</string>
     <string>A0000000250000</string>
     <string>A0000001523010</string>
     <string>A0000000046000</string>
     <string>A0000006723010</string>
     <string>A0000000042203</string>
     <string>A0000002471001</string>
     <string>E80704007F00070302</string>
     <string>A0000002472001</string>
     <string>A00000024710</string>
     <string>D4100000030001</string>
     <string>D2760000850100</string>
     <string>D2760000850101</string>
     <string>A000000529101</string>
     <string>A0000003974349445F01</string>
     <string>F849524153204149442056</string>
     <string>A0000000871002</string>
     <string>A0000000871004</string>
     <string>A0000000871006</string>
     <string>A0000000871008</string>
     <string>A000000308</string>
     <string>D27600012401</string>
     <string>A000000167455349474E</string>
     <string>A0000001510000</string>
     <string>A0000001810001</string>
     <string>A0000005591010</string>
     <string>D156000005</string>
     <string>E828BD080FD25372456339206F6</string>
     <string>A0000002280000</string>
     <string>D2760000012401</string>
     <string>A0000003082E68BF</string>
     <string>A0000002480100</string>
     <string>A0000002480200</string>
     <string>A0000002480300</string>
     <string>A00000045645444C2D3031</string>
     </array>
     ```
   - Ensure your entitlements include NFC tag reading capability.
   - Add the following pod to your Podfile:
     ```ruby
     pod 'OpenSSL-Universal', '~> 1.1.1900'
     ```
   - Disable Flipper in your Podfile (required for proper functionality)

4. **Android Additional Setup**:
   - Add NFC permissions in your AndroidManifest.xml.
     ```xml
     <uses-feature android:name="android.hardware.nfc" android:required="false" />
     <uses-permission android:name="android.permission.NFC" />
     ```
   - Ensure your device has NFC capabilities and that NFC is enabled.

## Usage

Import and use the NFC Passport Reader as follows:

```ts
import NfcPassportReader from 'react-native-nfc-passport-reader';
import type { NfcResult } from 'react-native-nfc-passport-reader';
```

### Basic Methods

- **startReading**: Initiates the NFC passport reading process.
  ```ts
  const result: NfcResult = await NfcPassportReader.startReading({
    bacKey: {
      documentNo: '123456789', // Document Number
      expiryDate: '2025-03-09', // YYYY-MM-DD
      birthDate: '2025-03-09', // YYYY-MM-DD
    },
    includeImages: true, // Include images in the result (default: false)
  });
  ```
- **stopReading**: Stops the NFC passport reading process. **_(Only Android)_**
  ```ts
  NfcPassportReader.stopReading();
  ```

### Event Listeners (Only Android)

- **addOnTagDiscoveredListener**: Triggers when an NFC tag is discovered.
  ```ts
  NfcPassportReader.addOnTagDiscoveredListener(() => {
    console.log('Tag Discovered');
  });
  ```
- **addOnNfcStateChangedListener**: Monitors changes in NFC state.
  ```ts
  NfcPassportReader.addOnNfcStateChangedListener((state: 'on' | 'off') => {
    console.log('NFC State Changed:', state);
  });
  ```

### Check Device Support

- **isNfcSupported**: Checks if NFC is supported by the device.
  ```ts
  const supported = await NfcPassportReader.isNfcSupported();
  ```
- **isNfcEnabled**: Checks if NFC is enabled on the device.
  ```ts
  const enabled = await NfcPassportReader.isNfcEnabled();
  ```

### Settings

- **openNfcSettings**: Opens the device's NFC settings. **_(Only Android)_**
  ```ts
  NfcPassportReader.openNfcSettings();
  ```

## Example

For a detailed example of how to use the NFC Passport Reader, please see the [Example App](example/src/App.tsx).

## Acknowledgments

Special thanks to [Andy Qua](https://github.com/AndyQ) for his excellent [NFCPassportReader](https://github.com/AndyQ/NFCPassportReader) library that powers the iOS implementation of this package. His work on implementing BAC, Secure Messaging, and various passport data group readings has been instrumental in making this React Native wrapper possible.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
