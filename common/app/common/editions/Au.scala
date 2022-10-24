package common.editions

import java.util.Locale
import org.joda.time.DateTimeZone
import common._
import navigation.{EditionNavLinks, NavLinks}

object Au
    extends Edition(
      id = "AU",
      displayName = "Australia edition",
      DateTimeZone.forID("Australia/Sydney"),
      locale = Some(Locale.forLanguageTag("en-au")),
      networkFrontId = "au",
      navigationLinks = EditionNavLinks(
        NavLinks.auNewsPillar,
        NavLinks.auOpinionPillar,
        NavLinks.auSportPillar,
        NavLinks.auCulturePillar,
        NavLinks.auLifestylePillar,
        NavLinks.auOtherLinks,
        NavLinks.auBrandExtensions,
      ),
    ) {

  implicit val AU = Au
}
