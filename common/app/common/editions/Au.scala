package common.editions

import org.joda.time.DateTimeZone
import model._
import common._
import contentapi.QueryDefaults
import common.NavItem


//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition(
  id = "AU",
  displayName = "Australia edition",
  DateTimeZone.forID("Australia/Sydney")
  ) with Zones with QueryDefaults {

  implicit val AU = Au

  val zones = Seq(
    newsZone,
    sportZone,
    cifZone,
    cultureZone,
    technologyZone,
    businessZone,
    moneyZone,
    lifeandstyleZone,
    travelZone
  )

  def navigation: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(australia),
    NavItem(world, Seq(uk, us, asia, europeNews, americas, africa, middleEast)),
    NavItem(cif),
    NavItem(sport, Seq(australiaSport, football, cricket, rugbyunion, rugbyLeague , tennis, cycling, boxing, afl, nrl)),
    NavItem(football, aLeague :: footballNav.toList),
    NavItem(technology, Seq(games)),
    NavItem(culture, Seq(film, music, books, televisionAndRadio , artanddesign, stage)),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, fashion)),
    NavItem(economy, Seq(markets, companies, money, media)),
    NavItem(travel, Seq(australasiaTravel, asiaTravel, uktravel, europetravel, usTravel)),
    NavItem(science),
    NavItem(environment, Seq(cities, globalDevelopment)),
    NavItem(education, Seq(students))
  )
}
