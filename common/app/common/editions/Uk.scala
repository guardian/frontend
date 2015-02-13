package common.editions

import common._
import org.joda.time.DateTimeZone

object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London"),
  lang = "en-gb"){

  implicit val UK = Uk

  val sportLocalNav: Seq[SectionLink] = Seq(
    football,
    rugbyunion,
    cricket,
    tennis,
    golf,
    cycling,
    boxing,
    usSport,
    formulaOne,
    racing
  )

  val cultureLocalNav: Seq[SectionLink] = Seq(
    film,
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
      NavItem(uk),
      NavItem(world, Seq(europeNews, us, americas, asia, australia, africa, middleEast)),
      NavItem(sport, sportLocalNav),
      NavItem(football, footballNav),
      NavItem(opinion),
      NavItem(culture, cultureLocalNav),
      NavItem(economy, Seq(markets, companies)),
      NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
      NavItem(fashion),
      NavItem(environment, Seq(cities, globalDevelopment)),
      NavItem(technology),
      NavItem(money, Seq(property, savings, borrowing, careers)),
      NavItem(travel, Seq(uktravel, europetravel, usTravel)),
      NavItem(science),
      NavItem(education, Seq(students, teachersNetwork)),
      NavItem(media),
      NavItem(guardianProfessional),
      NavItem(observer),
      NavItem(todaysPaper, Seq(editorialsandletters, obituaries, g2, weekend, theguide, saturdayreview)),
      NavItem(crosswords),
      NavItem(video)
    )
  }

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk),
    NavItem(world, Seq(europeNews, us, americas, asia, australia, africa, middleEast)),
    NavItem(sport, sportLocalNav),
    NavItem(football, footballNav),
    NavItem(opinion),
    NavItem(culture, cultureLocalNav),
    NavItem(economy, Seq(markets, companies)),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(environment, Seq(cities, globalDevelopment)),
    NavItem(technology),
    NavItem(money, Seq(property, savings, borrowing, careers)),
    NavItem(travel, Seq(uktravel, europetravel, usTravel))
  )
}
