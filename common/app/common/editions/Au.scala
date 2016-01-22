package common.editions

import java.util.Locale

import common.editions.Uk._
import conf.switches.Switches
import org.joda.time.DateTimeZone
import common._
import contentapi.QueryDefaults
import common.NavItem

//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition(
  id = "AU",
  displayName = "Australia edition",
  DateTimeZone.forID("Australia/Sydney"),
  locale = Locale.forLanguageTag("en-au"),
  homePagePath = "/au",
  networkFrontId = "au"
) with QueryDefaults {

  implicit val AU = Au

  val cultureLocalNav: Seq[SectionLink] = Seq(
    film,
    music,
    games,
    books,
    televisionAndRadio,
    artanddesign,
    stage,
    classicalMusic
  )

  val economyLocalNav: Seq[SectionLink] = Seq(markets, money)

  override val navigation: Seq[NavItem] = {
    Seq(
      NavItem(home),
      NavItem(australia),
      NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
      NavItem(opinion),
      NavItem(sport, Seq(australiaSport, afl, nrl, aLeague, football, cricket, rugbyunion, tennis, cycling, boxing)),
      NavItem(football, aLeague :: footballNav.toList),
      NavItem(technology),
      NavItem(culture, cultureLocalNav),
      NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women)),
      NavItem(fashion),
      NavItem(economy, economyLocalNav),
      NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel, skiingTravel)),
      NavItem(media),
      NavItem(environment, Seq(cities, globalDevelopment, ausustainablebusiness)),
      NavItem(science),
      NavItem(crosswords, crosswordsLocalNav),
      NavItem(video)
    )
  }

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(australia),
    NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
    NavItem(opinion),
    NavItem(sport, Seq(australiaSport, afl, nrl, aLeague, football, cricket, rugbyunion, tennis, cycling, boxing)),
    NavItem(football, aLeague :: footballNav.toList),
    NavItem(technology),
    NavItem(culture, cultureLocalNav),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women)),
    NavItem(fashion),
    NavItem(economy, economyLocalNav),
    NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel)),
    NavItem(media),
    NavItem(environment, Seq(cities, globalDevelopment, ausustainablebusiness))
  )
}
