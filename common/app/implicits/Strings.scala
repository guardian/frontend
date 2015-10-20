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
      // This can be used to encode parts of a URI, eg. "example-component/uk?parameter=unsafe-chars-such-as ://+ must-be-encoded#fragment"
      // The fragment part is optional.
      // Use encodeURI below for full URI strings like "http://theguardian.com/path with spaces".
      URLEncoder.encode(s, "UTF-8")
        .replaceAll("\\+", "%20")
        .replaceAll("\\%21", "!")
        .replaceAll("\\%27", "'")
        .replaceAll("\\%28", "(")
        .replaceAll("\\%29", ")")
        .replaceAll("\\%7E", "~")
    }
    lazy val encodeURI = {
      // For a URI like this, [scheme:][//authority][path][?query][#fragment]
      // The URI syntax rfc2396 does not permit encoding the [scheme:] and [//authority] components of the URI with % escape characters.

      // This helper uses Jersey's implementation of UriBuilder to encode the path, query and fragment legally.
      // We can't use java.net.URLEncoder here, it does not encode rfc2396 compliant urls (it actually encodes to application/x-www-form-urlencoded).
      val uri = javax.ws.rs.core.UriBuilder.fromPath(s).build()
      uri.toString
    }
  }

  implicit class string2decodings(s: String) {
    lazy val stringDecoded = URLDecoder.decode(s, "UTF-8")
  }
}