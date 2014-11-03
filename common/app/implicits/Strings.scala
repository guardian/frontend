package implicits

import java.net.{URLEncoder, URLDecoder}
import org.apache.commons.lang.StringEscapeUtils

trait Strings {

  def nullsafeString[A](a: A) = Option(a) map { _.toString } getOrElse ""

  implicit class String2ToOptions(s: String) {
    lazy val toIntOption: Option[Int] = try { Some(s.toInt) } catch { case _: Throwable => None }
    lazy val toBooleanOption: Option[Boolean] = try { Some(s.toBoolean) } catch { case _: Throwable => None }
  }

  implicit class String2Dequote(s: String) {
    lazy val dequote = s.replace("\"", "")
  }

  implicit class String2FromLast(s: String) {
    def fromLast(regex: String): String = s.split(regex).last
  }

  implicit class string2encodings(s: String) {
    lazy val urlEncoded = URLEncoder.encode(s, "utf-8")
    lazy val javascriptEscaped = StringEscapeUtils.escapeJavaScript(s)
    lazy val encodeURIComponent = {
      URLEncoder.encode(s, "UTF-8")
        .replaceAll("\\+", "%20")
        .replaceAll("\\%21", "!")
        .replaceAll("\\%27", "'")
        .replaceAll("\\%28", "(")
        .replaceAll("\\%29", ")")
        .replaceAll("\\%7E", "~")
    }
  }

  implicit class string2decodings(s: String) {
    lazy val stringDecoded = URLDecoder.decode(s, "UTF-8")
  }
}