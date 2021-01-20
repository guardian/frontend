package common.editions

import java.util.Locale
import common._
import org.joda.time.DateTimeZone

object Uk
    extends Edition(
      id = "UK",
      displayName = "UK edition",
      timezone = DateTimeZone.forID("Europe/London"),
      locale = Locale.forLanguageTag("en-gb"),
      networkFrontId = "uk",
    ) {

  implicit val UK = Uk
}
