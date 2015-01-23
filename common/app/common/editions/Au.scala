package common.editions

import common.editions.Uk._
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
  lang = "en-au"
)
  with QueryDefaults {

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

  override val navigation: Seq[NavItem] = {
    Seq(
      NavItem(home),
      NavItem(australia),
      NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
      NavItem(opinion),
      NavItem(sport, Seq(australiaSport, football, cricket, rugbyunion, rugbyLeague, tennis, cycling, boxing, afl, nrl)),
      NavItem(football, aLeague :: footballNav.toList),
      NavItem(technology),
      NavItem(culture, cultureLocalNav),
      NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women)),
      NavItem(fashion),
      NavItem(economy, Seq(markets, companies, money)),
      NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel)),
      NavItem(media),
      NavItem(environment, Seq(cities, globalDevelopment)),
      NavItem(science),
      NavItem(crosswords),
      NavItem(video)
    )
  }

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(australia),
    NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
    NavItem(opinion),
    NavItem(sport, Seq(australiaSport, football, cricket, rugbyunion, rugbyLeague , tennis, cycling, boxing, afl, nrl)),
    NavItem(football, aLeague :: footballNav.toList),
    NavItem(technology),
    NavItem(culture, cultureLocalNav),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women)),
    NavItem(fashion),
    NavItem(economy, Seq(markets, companies, money)),
    NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel)),
    NavItem(media),
    NavItem(environment, Seq(cities, globalDevelopment))
  )
}
