package implicits

import java.net.{URLDecoder, URLEncoder}

import com.sun.jersey.api.uri.UriComponent
import org.apache.commons.lang.StringEscapeUtils

trait Strings {

  def nullsafeString[A](a: A): String = Option(a) map { _.toString } getOrElse ""

  implicit class String2ToOptions(s: String) {
    lazy val toIntOption: Option[Int] =
      try { Some(s.toInt) }
      catch { case _: Throwable => None }
    lazy val toBooleanOption: Option[Boolean] =
      try { Some(s.toBoolean) }
      catch { case _: Throwable => None }
  }

  implicit class String2Dequote(s: String) {
    lazy val dequote = s.replace("\"", "")
  }

  implicit class String2FromLast(s: String) {
    def fromLast(regex: String): String = s.split(regex).last
  }

  implicit class string2encodings(s: String) {
    // Note, this is idempotent - i.e. it will not double-encode %-escaped characters
    lazy val urlEncoded = UriComponent.contextualEncode(s, UriComponent.Type.UNRESERVED, false)
    lazy val javascriptEscaped = StringEscapeUtils.escapeJavaScript(s)
    lazy val encodeURIComponent = {
      // This can be used to encode parts of a URI, eg. "example-component/uk?parameter=unsafe-chars-such-as ://+ must-be-encoded#fragment"
      // The fragment part is optional.
      // Use encodeURI below for full URI strings like "http://www.theguardian.com/path with spaces".
      URLEncoder
        .encode(s, "UTF-8")
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

  // UriBuilder will treat '{' and '}' as attempts at variable substition,
  // leading to surprising errors. To avoid this, parameter values are
  // url-encoded before being added.
  //
  // Note, the queryParam method of UriBuilder also encodes values but is
  // sensible enough not to double-encode percent-encoded values.
  implicit class String2Uri(uri: String) {
    def appendQueryParams(queryParams: Map[String, String]): String = {
      queryParams.foldLeft(uri)((currentUri, queryParam) => {
        javax.ws.rs.core.UriBuilder
          .fromUri(currentUri)
          .queryParam(queryParam._1, queryParam._2.urlEncoded)
          .build()
          .toString()
      })
    }

    def addFragment(fragment: String): String = {
      javax.ws.rs.core.UriBuilder
        .fromUri(uri)
        .fragment(fragment)
        .build()
        .toString()
    }
  }

  implicit class string2decodings(s: String) {
    lazy val stringDecoded = URLDecoder.decode(s, "UTF-8")
  }
}

object Strings extends Strings
