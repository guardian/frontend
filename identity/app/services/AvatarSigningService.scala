package services

import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac
import org.apache.commons.codec.digest.DigestUtils.md5Hex
import org.apache.commons.codec.binary.Base64.{encodeBase64URLSafeString => toBase64}
import model.AvatarData
import scala.language.implicitConversions

class AvatarSigningService(keyString: String) {

  private val key = new SecretKeySpec(md5Hex(keyString), "HmacSHA1")

  private def _sign(message: String) = {
    val mac = Mac getInstance "HmacSHA1"
    mac.init(key)
    toBase64(mac.doFinal(message))
  }

  def sign(data: AvatarData) = {
    val base64Json = toBase64(data.toJson)
    s"$base64Json.${_sign(base64Json)}"
  }

  private implicit def stringToBytes(str: String): Array[Byte] = str getBytes "UTF-8"
}


