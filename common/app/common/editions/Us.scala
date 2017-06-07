package common.editions

import java.util.Locale

import common._
import common.editions.Uk._
import org.joda.time.DateTimeZone
import common.NavItem

object Us extends Edition(
  id = "US",
  displayName = "US edition",
  timezone = DateTimeZone.forID("America/New_York"),
  locale = Locale.forLanguageTag("en-us"),
  networkFrontId = "us"
) {

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

  val businessLocalNav: Seq[SectionLink] = Seq(
    economics,
    ussustainablebusiness,
    diversityequality,
    ussmallbusiness
  )

  val worldLocalNav = Seq(
    uk,
    europeNews,
    americas,
    asia,
    middleEast,
    africa,
    australia,
    cities,
    globalDevelopment
  )

  val environmentLocalNav = Seq(
    climateChange,
    wildlife,
    energy,
    pollution
  )
  override val navigation: Seq[NavItem] = {
    Seq(
      NavItem(home),
      NavItem(us),
      NavItem(usPolitics),
      NavItem(world, worldLocalNav),
      NavItem(opinion),
      NavItem(sports, Seq(soccer, mls, nfl, mlb, nba, nhl)),
      NavItem(soccer, footballNav),
      NavItem(technology),
      NavItem(arts, cultureLocalNav),
      NavItem(lifeandstyle, Seq(foodanddrink, recipes, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
      NavItem(fashion),
      NavItem(business, businessLocalNav),
      NavItem(travel, Seq(usaTravel, europetravel, uktravel)),
      NavItem(environment, environmentLocalNav),
      NavItem(science),
      NavItem(media),
      NavItem(crosswords, crosswordsLocalNav),
      NavItem(video, Seq(podcast)),
      NavItem(digitalNewspaperArchive)
    )
  }

  override def briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(us),
    NavItem(usPolitics),
    NavItem(world, worldLocalNav),
    NavItem(opinion),
    NavItem(sports, Seq(soccer, mls, nfl, mlb, nba, nhl)),
    NavItem(soccer, footballNav),
    NavItem(technology),
    NavItem(arts, cultureLocalNav),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(business, Seq(markets, companies)),
    NavItem(travel, Seq(usaTravel, europetravel, uktravel)),
    NavItem(environment, environmentLocalNav)
  )
}
