package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData


object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London")
  ) with Zones {

  implicit val UK = Uk
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

  def navigation(metadata: MetaData): Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world, Seq(europeNews, us, americas, asia, australia, africa, middleEast)),
    NavItem(sport, Seq(football, rugbyunion, rugbyLeague, cricket, tennis, cycling, boxing, usSport, formulaOne)),
    footballNav(metadata),
    NavItem(cif),
    NavItem(culture, Seq(film, televisionAndRadio, music, books, artanddesign, stage)),
    NavItem(economy, Seq(markets, companies, media)),
    NavItem(lifeandstyle, Seq(foodanddrink, health, loveAndSex, family, women, homeAndGarden)),
    NavItem(environment, Seq(cities, globalDevelopment)),
    NavItem(technology, Seq(games)),
    NavItem(money, Seq(property, savings, borrowing, careers)),
    NavItem(travel, Seq(uktravel, europetravel, usTravel)),
    NavItem(fashion),
    NavItem(science),
    NavItem(education, Seq(students))
  )
}
