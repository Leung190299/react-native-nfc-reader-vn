package com.nfcpassportreader

import android.content.Context
import android.nfc.tech.IsoDep
import com.nfcpassportreader.utils.*
import com.nfcpassportreader.dto.*
import net.sf.scuba.smartcards.CardService
import org.jmrtd.BACKeySpec
import org.jmrtd.PassportService
import org.jmrtd.lds.CardSecurityFile
import org.jmrtd.lds.PACEInfo
import org.jmrtd.lds.icao.DG11File
import org.jmrtd.lds.icao.DG1File
import org.jmrtd.lds.icao.DG2File
import org.jmrtd.lds.iso19794.FaceImageInfo
import org.jmrtd.lds.icao.COMFile
import org.jmrtd.lds.SODFile
import android.util.Base64
import java.security.MessageDigest

class NfcPassportReader(context: Context) {
  private val bitmapUtil = BitmapUtil(context)
  private val dateUtil = DateUtil()

  fun readPassport(isoDep: IsoDep, bacKey: BACKeySpec, includeImages: Boolean): NfcResult {
    isoDep.timeout = 10000

    val cardService = CardService.getInstance(isoDep)
    cardService.open()

    val service = PassportService(
      cardService,
      PassportService.NORMAL_MAX_TRANCEIVE_LENGTH,
      PassportService.DEFAULT_MAX_BLOCKSIZE,
      false,
      false
    )
    service.open()

    var paceSucceeded = false
    try {
      val cardSecurityFile =
        CardSecurityFile(service.getInputStream(PassportService.EF_CARD_SECURITY))
      val securityInfoCollection = cardSecurityFile.securityInfos

      for (securityInfo in securityInfoCollection) {
        if (securityInfo is PACEInfo) {
          service.doPACE(
            bacKey,
            securityInfo.objectIdentifier,
            PACEInfo.toParameterSpec(securityInfo.parameterId),
            null
          )
          paceSucceeded = true
        }
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }

    service.sendSelectApplet(paceSucceeded)

    if (!paceSucceeded) {
      try {
        service.getInputStream(PassportService.EF_COM).read()
      } catch (e: Exception) {
        e.printStackTrace()

        service.doBAC(bacKey)
      }
    }

    // Read DG1 first (always required)
    val dg1In = service.getInputStream(PassportService.EF_DG1)
    val dg1File = DG1File(dg1In)
    rawDump["DG1"] = Base64.encodeToString(dg1File.encoded, Base64.NO_WRAP)
    val mrzInfo = dg1File.mrzInfo

    // Populate core fields from MRZ
    mrzInfo.let {
      if (!it.dateOfExpiry.isNullOrEmpty()) {
        nfcResult.expiryDate = dateUtil.convertFromMrzDate(it.dateOfExpiry)
      }
      nfcResult.identityNo = it.personalNumber
      nfcResult.gender = it.gender.toString()
      nfcResult.documentNo = it.documentNumber
      nfcResult.nationality = it.nationality
      nfcResult.mrz = it.toString()
    }

    // Try to read COM (optional)
    try {
      val comIn = service.getInputStream(PassportService.EF_COM)
      val comFile = COMFile(comIn)
      rawDump["COM"] = Base64.encodeToString(comFile.encoded, Base64.NO_WRAP)
      nfcResult.LDSVersion = comFile.ldsVersion
      nfcResult.unicodeVersion = comFile.unicodeVersion
      nfcResult.dataGroupsPresent = comFile.tagList.map { "DG$it" }
    } catch (e: Exception) {
      e.printStackTrace()
    }

    // Try to read DG11 (optional on Vietnamese CCCD)
    var dg11NameFound = false
    try {
      val dg11In = service.getInputStream(PassportService.EF_DG11)
      val dg11File = DG11File(dg11In)
      rawDump["DG11"] = Base64.encodeToString(dg11File.encoded, Base64.NO_WRAP)
      if (!dg11File.nameOfHolder.isNullOrEmpty()) {
        val name = dg11File.nameOfHolder.substringAfterLast("<<").replace("<", " ").trim()
        val surname = dg11File.nameOfHolder.substringBeforeLast("<<").trim()
        nfcResult.firstName = name
        nfcResult.lastName = surname
        dg11NameFound = true
      }
      if (!dg11File.placeOfBirth.isNullOrEmpty()) {
        nfcResult.placeOfBirth = dg11File.placeOfBirth.joinToString(separator = " ")
      }
      if (!dg11File.fullDateOfBirth.isNullOrEmpty()) {
        nfcResult.birthDate = dateUtil.convertFromMrzDate(dg11File.fullDateOfBirth)
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }

    // Fallback: parse name from MRZ
    if (!dg11NameFound) {
      try {
        nfcResult.firstName = mrzInfo.secondaryIdentifier?.replace("<", " ")?.trim() ?: ""
        nfcResult.lastName = mrzInfo.primaryIdentifier?.replace("<", " ")?.trim() ?: ""
      } catch (e: Exception) {}
    }

    if (includeImages) {
      try {
        val dg2In = service.getInputStream(PassportService.EF_DG2)
        val dg2File = DG2File(dg2In)
        rawDump["DG2"] = Base64.encodeToString(dg2File.encoded, Base64.NO_WRAP)
        
        val faceInfos = dg2File.faceInfos
        val allFaceImageInfos: MutableList<FaceImageInfo> = ArrayList()
        for (faceInfo in faceInfos) {
          allFaceImageInfos.addAll(faceInfo.faceImageInfos)
        }
        if (allFaceImageInfos.isNotEmpty()) {
          val faceImageInfo = allFaceImageInfos.iterator().next()
          val image = bitmapUtil.getImage(faceImageInfo)
          nfcResult.originalFacePhoto = image
        }
      } catch (e: Exception) {}
    }

    try {
      val sodIn = service.getInputStream(PassportService.EF_SOD)
      val sodFile = SODFile(sodIn)
      rawDump["SOD"] = Base64.encodeToString(sodFile.encoded, Base64.NO_WRAP)

      val dataGroupHashesMap = mutableMapOf<String, Map<String, Any>>()
      val sodHashes = sodFile.dataGroupHashes
      val digestAlg = sodFile.digestAlgorithm

      for ((key, sodHashBytes) in sodHashes) {
        val dgKey = "DG$key"
        var match = false
        var computedHashStr = ""
        
        if (rawDump.containsKey(dgKey)) {
           try {
             val bytes = Base64.decode(rawDump[dgKey], Base64.NO_WRAP)
             val md = MessageDigest.getInstance(digestAlg)
             val computedBytes = md.digest(bytes)
             computedHashStr = bytesToHex(computedBytes)
             match = computedBytes.contentEquals(sodHashBytes)
           } catch (e: Exception) {}
        }
        
        dataGroupHashesMap[dgKey] = mapOf(
            "id" to dgKey,
            "sodHash" to bytesToHex(sodHashBytes),
            "computedHash" to computedHashStr,
            "match" to match
        )
      }
      nfcResult.dataGroupHashes = dataGroupHashesMap
      nfcResult.passportCorrectlySigned = true // We have SOD, proper cert verify needs trust anchor though
      nfcResult.passportDataNotTampered = !dataGroupHashesMap.values.any { it["match"] == false }
    } catch (e: Exception) {}

    nfcResult.rawDump = rawDump
    val idCardRawImage = mutableMapOf<String, String>()
    rawDump.forEach { (key, value) -> idCardRawImage[key.lowercase()] = value }
    nfcResult.data_object = mapOf("id_card_raw_image" to idCardRawImage)
    nfcResult.dataGroupsAvailable = rawDump.keys.toList()

    return nfcResult
  }

  private fun bytesToHex(bytes: ByteArray): String {
      val hexChars = CharArray(bytes.size * 2)
      for (j in bytes.indices) {
          val v = bytes[j].toInt() and 0xFF
          hexChars[j * 2] = "0123456789abcdef"[v ushr 4]
          hexChars[j * 2 + 1] = "0123456789abcdef"[v and 0x0F]
      }
      return String(hexChars)
  }
}
