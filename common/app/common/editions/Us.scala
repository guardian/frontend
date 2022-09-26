package common.editions

import java.util.Locale
import common._
import navigation.{EditionNavLinks, NavLinks}
import org.joda.time.DateTimeZone

object Us
    extends Edition(
      id = "US",
      displayName = "US edition",
      timezone = DateTimeZone.forID("America/New_York"),
      locale = Locale.forLanguageTag("en-us"),
      networkFrontId = "us",
      navigationLinks = EditionNavLinks(
        NavLinks.usNewsPillar,
        NavLinks.usOpinionPillar,
        NavLinks.usSportPillar,
        NavLinks.usCulturePillar,
        NavLinks.usLifestylePillar,
        NavLinks.usOtherLinks,
        NavLinks.usBrandExtensions,
      ),
    ) {

  implicit val US = Us
}
