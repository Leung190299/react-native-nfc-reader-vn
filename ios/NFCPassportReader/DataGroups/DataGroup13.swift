//
//  DataGroup13.swift
//  NFCPassportReader
//
//  Created by Andy Qua on 01/02/2021.
//  Modified for Vietnamese CCCD support.
//

import Foundation

@available(iOS 13, macOS 10.15, *)
public class DataGroup13 : DataGroup {
    
    public private(set) var identityNumber : String?
    public private(set) var fullName : String?
    public private(set) var dateOfBirth : String?
    public private(set) var gender : String?
    public private(set) var nationality : String?
    public private(set) var ethnicity : String?
    public private(set) var religion : String?
    public private(set) var placeOfOrigin : String?
    public private(set) var placeOfResidence : String?
    public private(set) var personalIdentification : String?
    public private(set) var issueDate : String?
    public private(set) var expiryDate : String?
    public private(set) var fatherName : String?
    public private(set) var motherName : String?
    public private(set) var spouseName : String?
    public private(set) var oldIdentityNumber : String?

    public override var datagroupType: DataGroupId { .DG13 }

    required init( _ data : [UInt8] ) throws {
        try super.init(data)
    }

    override func parse(_ data: [UInt8]) throws {
        var rootTag = try getNextTag()
        
        // Check if we have the Tag List (0x5C) or if we are straight into the data
        if rootTag == 0x5C {
            _ = try getNextValue() // Skip the list of tags
            rootTag = try getNextTag()
        }
        
        repeat {
            let valData = try getNextValue()
            let val = String( bytes:valData, encoding:.utf8) ?? ""
            
            switch rootTag {
            case 0x01: identityNumber = val
            case 0x02: fullName = val
            case 0x03: dateOfBirth = val
            case 0x04: gender = val
            case 0x05: nationality = val
            case 0x06: ethnicity = val
            case 0x07: religion = val
            case 0x08: placeOfOrigin = val
            case 0x09: placeOfResidence = val
            case 0x0A: personalIdentification = val
            case 0x0B: issueDate = val
            case 0x0C: expiryDate = val
            case 0x0D: fatherName = val
            case 0x0E: motherName = val
            case 0x0F: spouseName = val
            case 0x10: oldIdentityNumber = val
            default: break
            }
            
            if pos < data.count {
                rootTag = try getNextTag()
            }
        } while pos < data.count
    }
}
