package model

case class Encoding(format: String, url: String, rawFormat: String)

object Encoding {

  val typeMapping = Map(
    "mp4" -> "video/mp4"
  )

  def apply(url: String, rawFormat:String): Encoding = {
    val format = typeMapping.get(rawFormat).getOrElse(rawFormat)
    Encoding(format, url, rawFormat)
  }
}

object EncodingOrdering extends Ordering[Encoding] {

  // put these in the order you want the encodings to appear
  private val precedence = Seq(
    "video/m3u8",
    "video/mp4",
    "video/3gpp:small",
    "video/3gpp:large",
    "video/mp4:720"
  )

  private def precedenceOf(s: Encoding) = {
    val p = precedence.indexOf(s.rawFormat)
    if (p < 0) precedence.length else p
  }

  //Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
  def compare(x: Encoding, y: Encoding): Int = precedenceOf(x) - precedenceOf(y)
}