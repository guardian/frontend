package model

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import org.scala_tools.time.Imports._

class DateTimeTest extends FlatSpec with Matchers {

  //http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1

  "Date pimps" should "understand HTTP date time" in {

    val theDate = new DateTime(2001, 5, 20, 12, 3, 4, 555)
    theDate.toHttpDateTimeString should be("Sun, 20 May 2001 11:03:04 GMT")
  }

  it should "always be in GMT" in {

    val theDate = new DateTime(2001, 5, 20, 12, 3, 4, 555).withZone(DateTimeZone.forID("Asia/Yerevan"))
    theDate.toHttpDateTimeString should be("Sun, 20 May 2001 11:03:04 GMT")
  }
}