package model

import views.support.HttpsUrl

case class Encoding(format: String, url: String, rawFormat: String)

object Encoding extends HttpsUrl {

  val typeMapping = Map(
    "mp4" -> "video/mp4",
  )

  def apply(url: String, rawFormat: String): Encoding = {
    val format = typeMapping.getOrElse(rawFormat, rawFormat)
    Encoding(format, ensureHttps(url), rawFormat)
  }
}

object EncodingOrdering extends Ordering[Encoding] {

  // put these in the order you want the encodings to appear
  // Browsers play <video> sources in order of appearance
  // m3u8 first for Apple devices, mp4 second as the default encoding for non-Apple devices
  // other encodings will only be reached iff mp4 fails
  private val precedence = Seq(
    "video/m3u8",
    "video/mp4",
    "video/webm",
    "video/3gpp:small",
    "video/3gpp:large",
    "video/mp4:720",
  )

  private def precedenceOf(s: Encoding) = {
    val p = precedence.indexOf(s.rawFormat)
    if (p < 0) precedence.length else p
  }

  //Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
  def compare(x: Encoding, y: Encoding): Int = precedenceOf(x) - precedenceOf(y)
}
