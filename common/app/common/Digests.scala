package common

import java.security.{MessageDigest, Security}
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.apache.commons.codec.binary.Hex

object Digests {
  /** Compute sha1 digest of array of bytes */
  def sha512(bytes: Array[Byte]) = {
    Security.addProvider(new BouncyCastleProvider)
    val mda = MessageDigest.getInstance("SHA-512", "BC")
    new String(Hex.encodeHex(mda.digest(bytes)))
  }

  def sha512(str: String) = sha512(str.getBytes("UTF-8"))
}