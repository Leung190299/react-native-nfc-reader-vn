//
//  NFCViewDisplayMessage.swift
//  NFCPassportReader
//
//  Created by Andy Qua on 09/02/2021.
//

import Foundation

@available(iOS 13, macOS 10.15, *)
public enum NFCViewDisplayMessage {
    case requestPresentPassport
    case authenticatingWithPassport(Int)
    case readingDataGroupProgress(DataGroupId, Int)
    case error(NFCPassportReaderError)
    case activeAuthentication
    case successfulRead
}

@available(iOS 13, macOS 10.15, *)
extension NFCViewDisplayMessage {
    public var description: String {
        switch self {
            case .requestPresentPassport:
                return "Giữ iPhone gần Thẻ CCCD gắn chip / Hộ chiếu."
            case .authenticatingWithPassport(let progress):
                let progressString = handleProgress(percentualProgress: progress)
                return "Đang xác thực.....\n\n\(progressString)"
            case .readingDataGroupProgress(let dataGroup, let progress):
                let progressString = handleProgress(percentualProgress: progress)
                return "Đang đọc \(dataGroup).....\n\n\(progressString)"
            case .error(let tagError):
                switch tagError {
                    case NFCPassportReaderError.TagNotValid:
                        return "Thẻ không hợp lệ."
                    case NFCPassportReaderError.MoreThanOneTagFound:
                        return "Phát hiện nhiều thẻ. Vui lòng chỉ đặt một thẻ."
                    case NFCPassportReaderError.ConnectionError:
                        return "Lỗi kết nối. Vui lòng thử lại."
                    case NFCPassportReaderError.InvalidMRZKey:
                        return "Thông tin xác thực không hợp lệ."
                    case NFCPassportReaderError.ResponseError(let description, _, _):
                        return "Lỗi khi đọc thẻ: \(description)"
                    default:
                        return "Rất tiếc, đã có lỗi khi đọc thẻ. Vui lòng thử lại"
                }
            case .activeAuthentication:
                return "Đang xác thực bảo mật....."
            case .successfulRead:
                return "Đọc thẻ thành công"
        }
    }
    
    func handleProgress(percentualProgress: Int) -> String {
        let p = (percentualProgress/20)
        let full = String(repeating: "🟢 ", count: p)
        let empty = String(repeating: "⚪️ ", count: 5-p)
        return "\(full)\(empty)"
    }
}
