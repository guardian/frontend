package client.filters

import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

case class DateRange(from: Option[DateTime] = None, datePath: String, to: Option[DateTime] = None) extends ApiFilter {
  require(from.isDefined || to.isDefined, "Neither from nor to date supplied to date range")

  val dateTimeFormat = ISODateTimeFormat.dateTime

  override def parameters: Iterable[(String, String)] = {
    if (from.isDefined && to.isDefined)
      List(("dateRange", "%s<%s<%s".format(dateTimeFormat.print(from.get), datePath, dateTimeFormat.print(to.get))))
    else if (from.isDefined && to.isEmpty)
      List(("dateRange", "%s<%s".format(dateTimeFormat.print(from.get), datePath)))
    else if (from.isEmpty && to.isDefined)
      List(("dateRange", "%s<%s".format(datePath, dateTimeFormat.print(to.get))))
    else
      throw new IllegalArgumentException("Neither from nor to date supplied to date range")
  }
}
