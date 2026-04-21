import CoreNFC
import Foundation
import OpenSSL
import React
import UIKit

@objc(NfcPassportReader)
class NfcPassportReader: NSObject {
  private let passportReader = PassportReader()
  private let passportUtil = PassportUtil()

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc func isNfcSupported(
    _ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if #available(iOS 13.0, *) {
      resolve(NFCNDEFReaderSession.readingAvailable)
    } else {
      resolve(false)
    }
  }

  @objc func startReading(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let bacKey = options["bacKey"] as? NSDictionary
    let includeImages = options["includeImages"] as? Bool

    let documentNo = bacKey?["documentNo"] as? String
    let expiryDate = bacKey?["expiryDate"] as? String
    let birthDate = bacKey?["birthDate"] as? String

    if let documentNo = documentNo, let expiryDate = expiryDate, let birthDate = birthDate {
      if let birthDateFormatted = birthDate.convertToYYMMDD() {
        passportUtil.dateOfBirth = birthDateFormatted
      } else {
        reject("ERROR_INVALID_BIRTH_DATE", "Invalid birth date", nil)
      }

      if let expiryDateFormatted = expiryDate.convertToYYMMDD() {
        passportUtil.expiryDate = expiryDateFormatted
      } else {
        reject("ERROR_INVALID_EXPIRY_DATE", "Invalid expiry date", nil)
      }

      passportUtil.passportNumber = documentNo

      let mrzKey = passportUtil.getMRZKey()

      var tags: [DataGroupId] = [.COM, .SOD, .DG1, .DG11, .DG12, .DG13, .DG14, .DG15, .DG16]

      if includeImages ?? false {
        tags.append(.DG2)
      }

      let finalTags = tags // Create immutable copy

      let customMessageHandler: (NFCViewDisplayMessage) -> String? = { displayMessage in
        switch displayMessage {
        case .requestPresentPassport:
          return "Giữ iPhone gần Thẻ CCCD/CC gắn chip."
        case .successfulRead:
          return "Đọc thẻ thành công."
        case .readingDataGroupProgress(let dataGroup, let progress):
          let progressString = self.handleProgress(percentualProgress: progress)
          return "Đang đọc dữ liệu \(dataGroup) ...\n\(progressString)"
        case .authenticatingWithPassport(let progress):
          let progressString = self.handleProgress(percentualProgress: progress)
          return "Đang xác thực ...\n\(progressString)"
        case .activeAuthentication:
          return "Đang xác thực bảo mật ..."
        case .error(let error):
          switch error {
          case .TagNotValid:
            return "Thẻ không hợp lệ."
          case .MoreThanOneTagFound:
            return "Phát hiện nhiều thẻ. Vui lòng chỉ đặt một thẻ."
          case .ConnectionError:
            return "Lỗi kết nối. Vui lòng thử lại."
          case .InvalidMRZKey:
            return "Thông tin xác thực không chính xác."
          case .UserCanceled:
            return "Đã hủy quét thẻ."
          default:
            return error.errorDescription ?? "Lỗi không xác định."
          }
        }
      }

      Task {
        do {
          let passport = try await self.passportReader.readPassport(
            mrzKey: mrzKey, tags: finalTags, customDisplayMessage: customMessageHandler)
          let verificationErrors = passport.verificationErrors.map { $0.localizedDescription }
          var dgHashesDict = [String: Any]()
          for (id, hash) in passport.dataGroupHashes {
            dgHashesDict[id.getName()] = [
              "id": hash.id,
              "sodHash": hash.sodHash,
              "computedHash": hash.computedHash,
              "match": hash.match
            ]
          }
          
          var unicodeVersion = ""
          if let com = passport.getDataGroup(.COM) as? COM {
            unicodeVersion = com.unicodeVersion
          }

          let rawDumpBase = passport.dumpPassportData(selectedDataGroups: [.COM, .SOD, .DG1, .DG2, .DG3, .DG4, .DG5, .DG6, .DG7, .DG8, .DG9, .DG10, .DG11, .DG12, .DG13, .DG14, .DG15, .DG16], includeActiveAuthenticationData: false)
          var idCardRawImage: [String: String] = [:]
          for (key, value) in rawDumpBase {
              idCardRawImage[key.lowercased()] = value
          }
          let dataObject = [
              "id_card_raw_image": idCardRawImage
          ]

          let result: NSMutableDictionary = [
            "birthDate": passport.dateOfBirth.convertToYYYYMMDD(),
            "placeOfBirth": passport.placeOfBirth ?? "",
            "documentNo": passport.documentNumber,
            "expiryDate": passport.documentExpiryDate.convertToYYYYMMDD(),
            "firstName": passport.firstName,
            "gender": passport.gender,
            "identityNo": passport.personalNumber ?? "",
            "lastName": passport.lastName,
            "mrz": passport.passportMRZ,
            "nationality": passport.nationality,
            "LDSVersion": passport.LDSVersion,
            "dataGroupsPresent": passport.dataGroupsPresent,
            "passportCorrectlySigned": passport.passportCorrectlySigned,
            "documentSigningCertificateVerified": passport.documentSigningCertificateVerified,
            "passportDataNotTampered": passport.passportDataNotTampered,
            "activeAuthenticationPassed": passport.activeAuthenticationPassed,
            "documentType": passport.documentType,
            "documentSubType": passport.documentSubType,
            "issuingAuthority": passport.issuingAuthority,
            "residenceAddress": passport.residenceAddress ?? "",
            "phoneNumber": passport.phoneNumber ?? "",
            "dataGroupsAvailable": passport.dataGroupsAvailable.map { $0.getName() },
            "rawDump": passport.dumpPassportData(selectedDataGroups: passport.dataGroupsAvailable, includeActiveAuthenticationData: true),
            "dataGroupHashes": dgHashesDict,
            "unicodeVersion": unicodeVersion,
            "verificationErrors": verificationErrors,
            "data_object": dataObject
          ]

          if includeImages ?? false {
            if let passportImage = passport.passportImage,
               let imageData = passportImage.jpegData(compressionQuality: 0.8)
            {
              result["photo"] = imageData.base64EncodedString()
            }
          }

          resolve(result)
        } catch {
          reject("ERROR_READ_PASSPORT", "Error reading passport", nil)
        }
      }
    } else {
      reject("ERROR_INVALID_BACK_KEY", "Invalid bac key", nil)
    }
  }

  func handleProgress(percentualProgress: Int) -> String {
    let barWidth = 10
    let completedWidth = Int(Double(barWidth) * Double(percentualProgress) / 100.0)
    let remainingWidth = barWidth - completedWidth

    let completedBar = String(repeating: "🔵", count: completedWidth)
    let remainingBar = String(repeating: "⚪️", count: remainingWidth)

    return "[\(completedBar)\(remainingBar)] \(percentualProgress)%"
  }
}
