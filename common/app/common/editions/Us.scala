package common.editions

import common._
import common.editions.Uk._
import org.joda.time.DateTimeZone
import contentapi.QueryDefaults
import common.NavItem

object Us extends Edition(
  id = "US",
  displayName = "US edition",
  timezone = DateTimeZone.forID("America/New_York"),
  lang = "en-us"
) with QueryDefaults {

  implicit val US = Us

  val cultureLocalNav: Seq[SectionLink] = Seq(
    movies,
    televisionAndRadio,
    music,
    games,
    books,
    artanddesign,
    stage,
    classicalMusic
  )

  override val navigation: Seq[NavItem] = {
    Seq(
      NavItem(home),
      NavItem(us),
      NavItem(world, Seq(uk, europeNews, americas, asia, middleEast, africa, australia)),
      NavItem(opinion),
      NavItem(sports, Seq(soccer, mls, nfl, mlb, nba, nhl)),
      NavItem(soccer, footballNav),
      NavItem(technology),
      NavItem(arts, cultureLocalNav),
      NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
      NavItem(fashion),
      NavItem(business, Seq(markets, companies)),
      NavItem(money),
      NavItem(travel, Seq(usaTravel, europetravel, uktravel)),
      NavItem(environment, Seq(globalDevelopment, cities)),
      NavItem(science),
      NavItem(media),
      NavItem(crosswords),
      NavItem(video)
    )
  }

  override def briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(us),
    NavItem(world, Seq(uk, europeNews, americas, asia, middleEast, africa, australia)),
    NavItem(opinion),
    NavItem(sports, Seq(soccer, mls, nfl, mlb, nba, nhl)),
    NavItem(soccer, footballNav),
    NavItem(technology),
    NavItem(arts, cultureLocalNav),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(business, Seq(markets, companies)),
    NavItem(money),
    NavItem(travel, Seq(usaTravel, europetravel, uktravel)),
    NavItem(environment, Seq(globalDevelopment, cities))
  )
}
