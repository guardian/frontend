package model

import common.Edition
import org.scalatest.matchers.should.Matchers
import org.joda.time.DateTime
import com.github.nscala_time.time.Imports._
import org.scalatest.flatspec.AnyFlatSpec

class DateTimeTest extends AnyFlatSpec with Matchers with implicits.Dates {

  //http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1

  "Date pimps" should "understand HTTP date time" in {

    val theDate = new DateTime(2001, 5, 20, 12, 3, 4, 555, Edition.defaultEdition.timezone)
    theDate.toHttpDateTimeString should be("Sun, 20 May 2001 11:03:04 GMT")
  }

  it should "always be in GMT" in {

    val theDate = new DateTime(2001, 5, 20, 12, 3, 4, 555, Edition.defaultEdition.timezone)
      .withZone(DateTimeZone.forID("Asia/Yerevan"))
    theDate.toHttpDateTimeString should be("Sun, 20 May 2001 11:03:04 GMT")
  }
}
