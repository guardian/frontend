package common.editions

import java.util.Locale
import common._
import org.joda.time.DateTimeZone

object Us
    extends Edition(
      id = "US",
      displayName = "US edition",
      timezone = DateTimeZone.forID("America/New_York"),
      locale = Locale.forLanguageTag("en-us"),
      networkFrontId = "us",
    ) {

  implicit val US = Us
}
