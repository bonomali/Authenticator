import * as CryptoJS from "crypto-js";

export class Encryption implements IEncryption {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  getEncryptedString(data: string): string {
    if (!this.password) {
      return data;
    } else {
      return CryptoJS.AES.encrypt(data, this.password).toString();
    }
  }

  getDecryptedSecret(entry: { secret: string; hash: string }) {
    try {
      const decryptedSecret = CryptoJS.AES.decrypt(
        entry.secret,
        this.password
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedSecret) {
        return null;
      }

      if (decryptedSecret.length < 8) {
        return null;
      }

      if (
        !/^[a-z2-7]+=*$/i.test(decryptedSecret) &&
        !/^[0-9a-f]+$/i.test(decryptedSecret) &&
        !/^blz\-/.test(decryptedSecret) &&
        !/^bliz\-/.test(decryptedSecret) &&
        !/^stm\-/.test(decryptedSecret)
      ) {
        return null;
      }

      if (
        /^\$argon2(?:d|i|di|id)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]*)$/.test(
          entry.hash
        )
      ) {
        return decryptedSecret;
      } else if (entry.hash === CryptoJS.MD5(decryptedSecret).toString()) {
        return decryptedSecret;
      }

      console.warn(
        `Account ${entry.hash} may have secret ${decryptedSecret.replace(
          / /g,
          ""
        )}, but hash did not match.`
      );
      return null;
    } catch (error) {
      return null;
    }
  }

  getEncryptionStatus(): boolean {
    return this.password ? true : false;
  }

  updateEncryptionPassword(password: string) {
    this.password = password;
  }
}
