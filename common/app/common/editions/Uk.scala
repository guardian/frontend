package common.editions

import java.util.Locale
import common._
import navigation.{EditionNavLinks, NavLinks}
import org.joda.time.DateTimeZone

object Uk
    extends Edition(
      id = "UK",
      displayName = "UK edition",
      timezone = DateTimeZone.forID("Europe/London"),
      locale = Some(Locale.forLanguageTag("en-gb")),
      networkFrontId = "uk",
      navigationLinks = EditionNavLinks(
        NavLinks.ukNewsPillar,
        NavLinks.ukOpinionPillar,
        NavLinks.ukSportPillar,
        NavLinks.ukCulturePillar,
        NavLinks.ukLifestylePillar,
        NavLinks.ukOtherLinks,
        NavLinks.ukBrandExtensions,
      ),
    ) {

  implicit val UK = Uk
}
