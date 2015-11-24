package common.editions

import java.util.Locale

import common._
import conf.switches.Switches
import org.joda.time.DateTimeZone

object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London"),
  locale = Locale.forLanguageTag("en-gb"),
  homePagePath = "/uk"
){

  implicit val UK = Uk

  val sportLocalNav: Seq[SectionLink] = Seq(
    football,
    cricket,
    rugbyunion,
    formulaOne,
    tennis,
    golf,
    cycling,
    boxing,
    racing,
    rugbyLeague,
    usSport
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

  val ukLocalNav = Seq(
    education,
    media,
    society,
    law,
    scotland,
    wales,
    northernIreland
  )

  val worldLocalNav = Seq(
    europeNews,
    us,
    americas,
    asia,
    australia,
    africa,
    middleEast,
    cities,
    globalDevelopment
  )

  val businessLocalNav = Seq(
    economics,
    banking,
    retail,
    markets,
    eurozone
  )

  val environmentLocalNav = Seq(
    climateChange,
    wildlife,
    energy,
    pollution
  )

  val crosswordsLocalNav = Seq(
    crosswordBlog,
    crosswordEditorUpdate,
    quick,
    cryptic,
    prize,
    quiptic,
    genius,
    speedy,
    everyman,
    azed
  )

  override val navigation: Seq[NavItem] = {
    Seq(
      NavItem(home),
      NavItem(uk, ukLocalNav),
      NavItem(politics),
      NavItem(world, worldLocalNav),
      NavItem(sport, sportLocalNav),
      NavItem(football, footballNav),
      NavItem(opinion, Seq(columnists)),
      NavItem(culture, cultureLocalNav),
      NavItem(business, businessLocalNav),
      NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
      NavItem(fashion),
      NavItem(environment, environmentLocalNav),
      NavItem(technology),
      NavItem(travel, Seq(uktravel, europetravel, usTravel, skiingTravel)),
      NavItem(money, Seq(property, savings, pensions, borrowing, workAndCareers)),
      NavItem(science),
      NavItem(guardianProfessional),
      NavItem(observer),
      NavItem(todaysPaper, Seq(editorialsandletters, obituaries, g2, weekend, theGuide, saturdayreview)),
      NavItem(sundayPaper, Seq(observerMainNews, observerComment, observerSport, observerNewReview, observerMagazine)),
      NavItem(membership),
      NavItem(crosswords, crosswordsLocalNav),
      NavItem(video)
    )
  }

  override val briefNav: Seq[NavItem] = Seq(
    NavItem(home),
    NavItem(uk, ukLocalNav),
    NavItem(world, worldLocalNav),
    NavItem(politics),
    NavItem(sport, sportLocalNav),
    NavItem(football, footballNav),
    NavItem(opinion, Seq(columnists)),
    NavItem(culture, cultureLocalNav),
    NavItem(business, businessLocalNav),
    NavItem(lifeandstyle, Seq(foodanddrink, healthandwellbeing, loveAndSex, family, women, homeAndGarden)),
    NavItem(fashion),
    NavItem(environment, environmentLocalNav),
    NavItem(technology),
    NavItem(travel, Seq(uktravel, europetravel, usTravel))
  )
}
