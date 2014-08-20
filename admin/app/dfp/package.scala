import org.joda.time.{DateTimeZone, DateTime}
import org.joda.time.format.DateTimeFormat

package object dfp {

  def printLondonTime(timestamp: DateTime): String = DateTimeFormat.longDateTime().withZone(DateTimeZone.forID("Europe/London")).print(timestamp)
}
