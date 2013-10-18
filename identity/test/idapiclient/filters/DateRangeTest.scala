package client.filters

import org.scalatest.Matchers
import org.scalatest.FunSuite
import org.joda.time.format.ISODateTimeFormat
import org.joda.time.DateTime

class DateRangeTest extends FunSuite with Matchers {
  val dateTimeFormatter = ISODateTimeFormat.dateTime()
  val from = DateTime.now()
  val to = DateTime.now()
  val fromDateString = dateTimeFormatter.print(from)
  val toDateString = dateTimeFormatter.print(to)
  val field = "field"

  test("should apply fieldname from date and to date") {
    val dateRange = DateRange(Some(from), field, Some(to))
    dateRange.parameters should equal(List(("dateRange", "%s<%s<%s".format(fromDateString, field, toDateString))))
  }

  test("should apply fieldname and from date") {
    val dateRange = DateRange(Some(from), field)
    dateRange.parameters should equal(List(("dateRange", "%s<%s".format(fromDateString, field))))
  }

  test("should apply fieldname and to date") {
    val dateRange = DateRange(None, field, Some(to))
    dateRange.parameters should equal(List(("dateRange", "%s<%s".format(field, toDateString))))
  }

  test("fails if given neither from nor to date") {
    evaluating {
      DateRange(None, field, None)
    } should produce[IllegalArgumentException]
  }
}
