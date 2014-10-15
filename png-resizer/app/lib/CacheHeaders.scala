package lib

import play.api.mvc.SimpleResult
import org.joda.time.{Duration, DateTimeZone, DateTime}

object CacheHeaders {
  // http://tools.ietf.org/html/rfc2822#section-3.3
  private val DateTimePattern = "EEE, dd MMM yyyy HH:mm:ss 'GMT"
  private val GmtTimeZone = DateTimeZone.forID("GMT")

  private def rfc2822String(dateTime: DateTime) = dateTime.withZone(GmtTimeZone).toString(DateTimePattern)

  implicit class RichSimpleResult(result: SimpleResult) {
    def withLastModified(lastModified: DateTime) = result.withHeaders(
      "Last-Modified" -> rfc2822String(lastModified)
    )

    def withTimeToLive(timeToLive: Duration) = result.withHeaders(
      "Expires" -> rfc2822String(DateTime.now.plus(timeToLive))
    )
  }
}
