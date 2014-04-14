package services

import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac
import org.apache.commons.codec.digest.DigestUtils.md5Hex
import org.apache.commons.codec.binary.Base64.{encodeBase64URLSafeString => toBase64, decodeBase64}
import model.AvatarData
import scala.language.implicitConversions
import play.libs.Json.{parse => parseJson}

class AvatarSigningService(keyString: String) {

  private val key = new SecretKeySpec(md5Hex(keyString), "HmacSHA1")

  private[services] def _sign(message: String) = {
    val mac = Mac getInstance "HmacSHA1"
    mac.init(key)
    toBase64(mac.doFinal(message))
  }

  def sign(data: AvatarData) = {
    val base64Json = toBase64(data.toJson)
    s"$base64Json.${_sign(base64Json)}"
  }

  def wasUploadSuccessful(signedString: String): Either[String, Boolean] = {

    val msgAndSig = signedString split "\\." match {
      case Array(message, signature) => Right(message, signature)
      case _ => Left("Bad response from upload:\n" + signedString)
    }

    val validMsg = msgAndSig.right flatMap {
      case (msg, sig) => checkSig(msg, sig)
    }

    validMsg.right flatMap getUploadStatus
  }


  private def getUploadStatus(base64Response: String): Either[String, Boolean] = {

    val jsonString: String = decodeBase64(base64Response)
    val parsedJson = parseJson(jsonString)
    val status = (parsedJson get "image_upload_success").booleanValue

    if (status)
      Right(true)
    else {
      val errorMsg = (parsedJson get "image_upload_failure_message").asText
      Left(errorMsg)
    }
  }

  private def checkSig(message: String, signature: String): Either[String, String] = {
    if (_sign(message) == signature) Right(message)
    else Left("Invalid signature")
  }

  private implicit def stringToBytes(str: String): Array[Byte] = str getBytes "UTF-8"
  private implicit def bytesToString(bytes: Array[Byte]): String = new String(bytes, "UTF-8")
}


