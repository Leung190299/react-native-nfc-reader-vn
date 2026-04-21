export const DG13_LABELS = {
  identityNo: 'Số CCCD',
  fullName: 'Họ và tên',
  dateOfBirth: 'Ngày sinh',
  gender: 'Giới tính',
  nationality: 'Quốc tịch',
  ethnicity: 'Dân tộc',
  religion: 'Tôn giáo',
  placeOfOrigin: 'Quê quán',
  placeOfResidence: 'Nơi thường trú',
  personalIdentification: 'Đặc điểm nhận dạng',
  issueDate: 'Ngày cấp',
  expiryDate: 'Ngày hết hạn',
  parentSpouseName: 'Họ tên cha/mẹ/vợ/chồng'
};
const TAG_MAP = {
  '01': 'fullName',
  '02': 'identityNo',
  '03': 'dateOfBirth',
  '04': 'gender',
  '05': 'nationality',
  '06': 'ethnicity',
  '07': 'religion',
  '08': 'placeOfOrigin',
  '09': 'placeOfResidence',
  '0A': 'personalIdentification',
  '0B': 'issueDate',
  '0C': 'expiryDate',
  '0D': 'parentSpouseName',
  '11': 'parentSpouseName',
  '13': 'identityNo'
};
export class DG13Decoder {
  static decode(base64Data) {
    if (!base64Data) return {};
    try {
      const bytes = this.base64ToBytes(base64Data);
      if (!bytes || bytes.length === 0) return {};
      return this.decodeBytes(bytes);
    } catch (error) {
      console.error('Error decoding DG13 data:', error);
      return {};
    }
  }
  static decodeBytes(bytes) {
    const result = {
      rawFields: {}
    };
    if (!bytes || bytes.length < 2) return result;
    try {
      this.parseFlat(bytes, result);
      this.extractFromSequence(bytes, result);
    } catch (e) {
      console.error('Safe decode failed:', e);
    }
    return result;
  }
  static parseFlat(bytes, result) {
    let pos = 0;
    let iterations = 0;
    while (pos < bytes.length - 1 && iterations < 200) {
      iterations++;
      const tagByte = bytes[pos++];
      if (tagByte === 0 || tagByte === 0xff) continue;
      const tag = tagByte.toString(16).toUpperCase().padStart(2, '0');
      const {
        length,
        newPos
      } = this.parseLength(bytes, pos);
      pos = newPos;
      if (pos + length > bytes.length || length < 0) break;
      const valueBytes = bytes.slice(pos, pos + length);
      if (tagByte === 0x6d || tagByte === 0x71) {
        this.parseFlat(valueBytes, result);
      } else if (tagByte === 0x30) {
        const value = this.bytesToString(valueBytes);
        if (result.rawFields) result.rawFields[tag] = value;
        this.extractFieldsFromCompound(value, result);
      } else {
        const value = this.bytesToString(valueBytes);
        if (value && value.length > 0 && value.length < 256) {
          const fieldName = TAG_MAP[tag];
          if (fieldName) result[fieldName] = value;
          if (result.rawFields) result.rawFields[tag] = value;
        } else if (value && value.length > 0) {
          if (result.rawFields) result.rawFields[tag] = value;
        }
      }
      pos += length;
    }
  }
  static extractFieldsFromCompound(compound, result) {
    if (!compound || compound.length < 10) return;
    let parts = compound.split('\x00').map(p => p.trim()).filter(p => p.length > 1);
    if (parts.length < 5) {
      parts = this.splitBySeparator(compound, '0');
    }
    this.parseFieldsByOrder(parts, result);
  }
  static splitBySeparator(str, sep) {
    const result = [];
    let current = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === sep) {
        const nextChar = str[i + 1];
        if (nextChar && /[\dA-Za-zÀ-ỹ]/.test(nextChar) && current.length > 0) {
          result.push(current.trim());
          current = '';
          continue;
        }
      }
      current += char;
    }
    if (current.length > 0) {
      result.push(current.trim());
    }
    return result.filter(p => p.length > 1);
  }
  static extractFromSequence(bytes, result) {
    const fullText = this.bytesToString(bytes);
    if (!fullText || fullText.length < 10) return;
    let parts = fullText.split('\x00').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length < 5) {
      parts = this.splitBySeparator(fullText, '0');
      if (parts.length >= 5) {
        this.parseFieldsByOrder(parts, result);
      }
      return;
    }
    this.parseFieldsByOrder(parts, result);
  }
  static parseFieldsByOrder(parts, result) {
    const cleanParts = parts.map(p => {
      let cleaned = p.replace(/[\x00-\x1F]/g, '').trim();
      while (cleaned.endsWith('0') || cleaned.endsWith('D')) {
        cleaned = cleaned.slice(0, -1);
      }
      return cleaned;
    }).filter(p => p.length > 1);
    for (let i = 0; i < cleanParts.length; i++) {
      const p = cleanParts[i];
      if (/^\d{12}$/.test(p)) {
        result.identityNo = p;
        continue;
      }
      const normalizedDate = p.replace(/^(\d)(\d{2}\/\d{2}\/\d{4})$/, '$2');
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedDate)) {
        const date = normalizedDate;
        if (date.endsWith('2039') || date.endsWith('2040') || date.endsWith('2045')) {
          result.expiryDate = date;
        } else if (!result.dateOfBirth) {
          result.dateOfBirth = date;
        } else if (!result.issueDate) {
          result.issueDate = date;
        }
        continue;
      }
      if (p === 'Nam' || p === 'Nữ') {
        result.gender = p;
        continue;
      }
      if (p === 'Việt Nam') {
        result.nationality = p;
        continue;
      }
      if (p === 'Kinh') {
        if (!result.ethnicity) {
          result.ethnicity = p;
        }
        continue;
      }
      if (p === 'Không' || p === 'Phật giáo' || p === 'Công giáo' || p === 'Hồi giáo' || p === 'Tin Lành' || p === 'Cao Đài' || p === 'Hòa Hảo') {
        result.religion = p;
        continue;
      }
      if (p.includes(',') || p.includes('.')) {
        const cleanedP = p.replace(/^[.\d]+\./, '').replace(/^0[0-9A-Fa-f]+/, '');
        if (!result.placeOfOrigin) {
          result.placeOfOrigin = cleanedP;
          continue;
        }
        if (!result.placeOfResidence) {
          result.placeOfResidence = cleanedP;
          continue;
        }
      }
      if (p.toLowerCase().includes('sẹo') || p.toLowerCase().includes('nốt ruồi') || p.toLowerCase().includes('vết')) {
        result.personalIdentification = p;
        continue;
      }
      if (/[À-ỹ]/.test(p) && p.length > 5 && !result.fullName) {
        if (!result.parentSpouseName || !result.parentSpouseName.includes(p)) {
          result.fullName = p;
        }
        continue;
      }
      if (/[À-ỹ]/.test(p) && p.length > 5 && result.fullName) {
        if (!result.parentSpouseName) {
          result.parentSpouseName = p;
        } else if (!result.parentSpouseName.includes(p)) {
          result.parentSpouseName += ` / ${p}`;
        }
      }
    }
  }
  static parseLength(bytes, pos) {
    if (pos >= bytes.length) return {
      length: 0,
      newPos: pos
    };
    let length = bytes[pos];
    let newPos = pos + 1;
    if (length > 0x80) {
      const lengthBytesCount = length & 0x7f;
      length = 0;
      if (newPos + lengthBytesCount > bytes.length) return {
        length: 0,
        newPos: bytes.length
      };
      for (let i = 0; i < lengthBytesCount; i++) {
        length = length << 8 | bytes[newPos + i];
      }
      newPos += lengthBytesCount;
    } else if (length === 0x80) {
      return {
        length: 0,
        newPos: newPos
      };
    }
    return {
      length,
      newPos
    };
  }
  static bytesToString(bytes, useDelimiters = false) {
    if (!bytes || bytes.length === 0) return '';
    try {
      let out = '';
      for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        if (c < 0x80) {
          if (c >= 32) {
            out += String.fromCharCode(c);
          } else if (useDelimiters && out.length > 0 && out[out.length - 1] !== '|') {
            out += '|';
          }
        } else if (c < 0xe0) {
          if (i + 1 < bytes.length) {
            out += String.fromCharCode((c & 0x1f) << 6 | bytes[++i] & 0x3f);
          }
        } else if (c < 0xf0) {
          if (i + 2 < bytes.length) {
            out += String.fromCharCode((c & 0x0f) << 12 | (bytes[++i] & 0x3f) << 6 | bytes[++i] & 0x3f);
          }
        }
      }
      return out.trim();
    } catch (e) {
      return '';
    }
  }
  static base64ToBytes(base64) {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      try {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = new Uint8Array(256);
        for (let i = 0; i < 64; i++) lookup[chars.charCodeAt(i)] = i;
        const len = base64.length;
        let bufferLength = Math.floor(len * 0.75);
        if (base64[len - 1] === '=') bufferLength--;
        if (base64[len - 2] === '=') bufferLength--;
        const bytes = new Uint8Array(bufferLength);
        for (let i = 0, p = 0; i < len; i += 4) {
          const e1 = lookup[base64.charCodeAt(i)];
          const e2 = lookup[base64.charCodeAt(i + 1)];
          const e3 = lookup[base64.charCodeAt(i + 2)];
          const e4 = lookup[base64.charCodeAt(i + 3)];
          bytes[p++] = e1 << 2 | e2 >> 4;
          if (p < bufferLength) bytes[p++] = (e2 & 15) << 4 | e3 >> 2;
          if (p < bufferLength) bytes[p++] = (e3 & 3) << 6 | e4;
        }
        return bytes;
      } catch (err) {
        return new Uint8Array(0);
      }
    }
  }
  static decodeFromDataGroups(dataGroupsAvailable, data_object) {
    if (!dataGroupsAvailable || !data_object) return {};
    const dg13Index = dataGroupsAvailable.find(dg => dg === 'DG13' || dg === '13');
    if (!dg13Index) return {};
    const dg13Data = data_object[dg13Index];
    if (!dg13Data) return {};
    const base64Data = dg13Data.base64 || dg13Data.DG13 || Object.values(dg13Data)[0];
    if (!base64Data) return {};
    return this.decode(base64Data);
  }
}
//# sourceMappingURL=dg13Decoder.js.map