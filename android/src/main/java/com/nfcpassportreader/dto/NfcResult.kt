package com.nfcpassportreader.dto

data class NfcResult(
  var birthDate: String? = null,
  var placeOfBirth: String? = null,
  var documentNo: String? = null,
  var expiryDate: String? = null,
  var firstName: String? = null,
  var gender: String? = null,
  var identityNo: String? = null,
  var lastName: String? = null,
  var mrz: String? = null,
  var nationality: String? = null,
  var originalFacePhoto: NfcImage? = null,
  var LDSVersion: String? = null,
  var unicodeVersion: String? = null,
  var dataGroupsPresent: List<String>? = null,
  var dataGroupsAvailable: List<String>? = null,
  var rawDump: Map<String, String>? = null,
  var dataGroupHashes: Map<String, Map<String, Any>>? = null,
  var passportCorrectlySigned: Boolean? = null,
  var documentSigningCertificateVerified: Boolean? = null,
  var passportDataNotTampered: Boolean? = null,
  var verificationErrors: List<String>? = null,
  var data_object: Map<String, Map<String, String>>? = null
)
