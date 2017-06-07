package common.editions

import java.util.Locale

import common.editions.Uk._
import org.joda.time.DateTimeZone
import common.{NavItem, _}

//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition(
  id = "AU",
  displayName = "Australia edition",
  DateTimeZone.forID("Australia/Sydney"),
  locale = Locale.forLanguageTag("en-au"),
  networkFrontId = "au"
) {

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
      NavItem(australiaPolitics),
      NavItem(sport, Seq(australiaSport, afl, nrl, aLeague, football, cricket, rugbyunion, tennis, cycling, boxing)),
      NavItem(football, aLeague :: footballNav.toList),
      NavItem(culture, cultureLocalNav),
      NavItem(lifeandstyle, Seq(australiaFoodAndDrink, recipes, australiaRelationships, australiaFashion, australiaHealthAndWellbeing, women)),
      NavItem(environment, Seq(cities, globalDevelopment, ausustainablebusiness)),
      NavItem(economy, economyLocalNav),
      NavItem(media),
      NavItem(technology),
      NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel)),
      NavItem(fashion),
      NavItem(science),
      NavItem(membership),
      NavItem(crosswords, crosswordsLocalNav),
      NavItem(video, Seq(podcast)),
      NavItem(digitalNewspaperArchive)
    )
  }

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(australia),
    NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
    NavItem(opinion),
    NavItem(australiaPolitics),
    NavItem(sport, Seq(australiaSport, afl, nrl, aLeague, football, cricket, rugbyunion, tennis, cycling, boxing)),
    NavItem(football, aLeague :: footballNav.toList),
    NavItem(culture, cultureLocalNav),
    NavItem(lifeandstyle, Seq(australiaFoodAndDrink, australiaRelationships, australiaFashion, australiaHealthAndWellbeing, women)),
    NavItem(environment, Seq(cities, globalDevelopment, ausustainablebusiness)),
    NavItem(economy, economyLocalNav),
    NavItem(media),
    NavItem(technology),
    NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel))
  )
}
