package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData
import contentapi.QueryDefaults
import common.NavItem

object Us extends Edition(
  id = "US",
  displayName = "US edition",
  timezone = DateTimeZone.forID("America/New_York")
  ) with Zones with QueryDefaults {

  implicit val US = Us
  val zones = Seq(
    newsZone,
    sportsZone,
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
    NavItem(us),
    NavItem(world, Seq(uk, europeNews, americas, asia, middleEast, africa, australia)),
    NavItem(opinion),
    NavItem(sports, Seq(soccer, mls, nfl, mlb, nba, nhl)),
    NavItem(soccer, footballNav),
    NavItem(technology, Seq(games)),
    NavItem(culture, Seq(movies, televisionAndRadio, music, books, artanddesign, stage)),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(business, Seq(markets, companies, media)),
    NavItem(money),
    NavItem(travel, Seq(usaTravel, europetravel, uktravel)),
    NavItem(environment, Seq(globalDevelopment, cities))
  )
}
