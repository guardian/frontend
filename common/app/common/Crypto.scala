package common

import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.{IvParameterSpec, SecretKeySpec}
import org.apache.commons.codec.binary.Base64

object Crypto {

  private def secretKeyWithSha256(privateKey: String, algorithm: String) = {
    val messageDigest = MessageDigest.getInstance("SHA-256")
    messageDigest.update(privateKey.getBytes("utf-8"))
    val maxAllowedKeyLength =
      Cipher.getMaxAllowedKeyLength(algorithm) / 8 // max allowed length in bits / (8 bits to a byte)
    val raw = messageDigest.digest().slice(0, maxAllowedKeyLength)
    new SecretKeySpec(raw, algorithm)
  }

  def encryptAES(value: String, key: String): String = {
    val skeySpec = secretKeyWithSha256(key, "AES")
    val cipher = Cipher.getInstance("AES/CTR/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, skeySpec)
    val encryptedValue = cipher.doFinal(value.getBytes("utf-8"))
    Base64.encodeBase64String(cipher.getIV() ++ encryptedValue)
  }

  def decryptAES(value: String, key: String): String = {
    val data = Base64.decodeBase64(value)
    val skeySpec = secretKeyWithSha256(key, "AES")
    val cipher = Cipher.getInstance("AES/CTR/NoPadding")
    val blockSize = cipher.getBlockSize
    val iv = data.slice(0, blockSize)
    val payload = data.slice(blockSize, data.size)
    cipher.init(Cipher.DECRYPT_MODE, skeySpec, new IvParameterSpec(iv))
    new String(cipher.doFinal(payload), "utf-8")
  }
}
