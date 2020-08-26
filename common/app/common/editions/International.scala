package common.editions

import java.util.Locale
import common._
import org.joda.time.DateTimeZone

object International
    extends Edition(
      id = "INT",
      displayName = "International edition",
      timezone = DateTimeZone.forID("Europe/London"),
      locale = Locale.forLanguageTag("en"),
      networkFrontId = "international",
      editionalisedSections = Seq(""), // only the home page
    ) {

  implicit val INT = International
}
