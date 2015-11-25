import common.ExecutionContexts
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import org.joda.time.{DateTime, DateTimeZone}

package object dfp extends ExecutionContexts {

  private def timeFormatter: DateTimeFormatter = {
    DateTimeFormat.forPattern("d MMM YYYY HH:mm:ss z")
  }

  def printLondonTime(timestamp: DateTime): String = {
    timeFormatter.withZone(DateTimeZone.forID("Europe/London")).print(timestamp)
  }

  def printUniversalTime(timestamp: DateTime): String = {
    timeFormatter.withZoneUTC().print(timestamp)
  }

  def printDate(timestamp: DateTime): String = {
    DateTimeFormat.forPattern("dd MMM YYYY").print(timestamp)
  }
}
