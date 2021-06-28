import java.text.SimpleDateFormat
import java.time.{ZoneId, LocalDateTime}
import java.util.TimeZone

package object dfp {

  private def timeFormatter: SimpleDateFormat = {
    new SimpleDateFormat("d MMM YYYY HH:mm:ss z")
  }

  def printLondonTime(date: LocalDateTime): String = {
    timeFormatter.setTimeZone(TimeZone.getTimeZone("Europe/London"))
    timeFormatter.format(date)
  }

  def printUniversalTime(date: LocalDateTime): String = {
    timeFormatter.setTimeZone(TimeZone.getTimeZone(ZoneId.of("UTC")))
    timeFormatter.format(date)
  }

  def printDate(date: LocalDateTime): String = {
    val timeFormatter = new SimpleDateFormat("dd MMM YYYY")
    timeFormatter.setTimeZone(TimeZone.getTimeZone("Europe/London"))
    timeFormatter.format(date)
  }
}
