package common.editions

import java.util.Locale
import common._
import navigation.{EditionNavLinks, NavLinks}
import org.joda.time.DateTimeZone

object International
    extends Edition(
      id = "INT",
      displayName = "International edition",
      timezone = DateTimeZone.forID("Europe/London"),
      locale = Some(Locale.forLanguageTag("en")),
      networkFrontId = "international",
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

  implicit val INT = International
}
