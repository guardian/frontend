package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData

object Uk extends Edition(id = "UK", displayName = "UK edition", timezone = DateTimeZone.forID("Europe/London"))
  with Zones {

  implicit val UK = Uk

  override val navigation: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world, Seq(europeNews, us, americas, asia, australia, africa, middleEast)),
    NavItem(sport, Seq(football, rugbyunion, rugbyLeague, cricket, tennis, cycling, boxing, usSport, formulaOne)),
    NavItem(football, footballNav),
    NavItem(cif),
    NavItem(culture, Seq(film, televisionAndRadio, music, books, artanddesign, stage)),
    NavItem(economy, Seq(markets, companies)),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(environment, Seq(cities, globalDevelopment)),
    NavItem(technology, Seq(games)),
    NavItem(money, Seq(property, savings, borrowing, careers)),
    NavItem(travel, Seq(uktravel, europetravel, usTravel)),
    NavItem(science),
    NavItem(education, Seq(students)),
    NavItem(media)
  )

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world, Seq(europeNews, us, americas, asia, australia, africa, middleEast)),
    NavItem(sport, Seq(football, rugbyunion, rugbyLeague, cricket, tennis, cycling, boxing, usSport, formulaOne)),
    NavItem(football, footballNav),
    NavItem(cif),
    NavItem(culture, Seq(film, televisionAndRadio, music, books, artanddesign, stage)),
    NavItem(economy, Seq(markets, companies)),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(environment, Seq(cities, globalDevelopment)),
    NavItem(technology, Seq(games)),
    NavItem(money, Seq(property, savings, borrowing, careers)),
    NavItem(travel, Seq(uktravel, europetravel, usTravel))
  )
}
