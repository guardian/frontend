package common.editions

import java.util.Locale
import common._
import navigation.{EditionNavLinks, NavLinks}
import org.joda.time.DateTimeZone

object Europe
    extends Edition(
      id = "EUR",
      displayName = "Europe edition",
      timezone = DateTimeZone.forID("Europe/London"),
      locale = Locale.forLanguageTag("en"),
      networkFrontId = "europe",
      editionalisedSections = Seq(""), // only the home page
      navigationLinks = EditionNavLinks(
        NavLinks.intNewsPillar,
        NavLinks.intOpinionPillar,
        NavLinks.intSportPillar,
        NavLinks.intCulturePillar,
        NavLinks.intLifestylePillar,
        NavLinks.intOtherLinks,
        NavLinks.intBrandExtensions,
      ),
    ) {

  implicit val EUR = Europe
}
