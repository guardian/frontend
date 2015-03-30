import common.ExecutionContexts
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}

package object dfp extends ExecutionContexts {

  def printLondonTime(timestamp: DateTime): String =
    DateTimeFormat.forPattern("d MMM YYYY HH:mm:ss z").withZone(DateTimeZone.forID("Europe/London")).print(timestamp)

  def printDate(timestamp: DateTime): String =
    DateTimeFormat.forPattern("dd MMM YYYY").print(timestamp)

}
