package navigation

import NavLinks._
import common.Edition
import common.editions

case class NavLink(title: String, url: String, uniqueSection: String = "", longTitle: String = "", iconName: String = "")
case class SectionsLink(pageId: String, navLink: NavLink, parentSection: NewNavigation.EditionalisedNavigationSection)
case class SubSectionLink(pageId: String, parentSection: List[NavLink])

object NewNavigation {

  val PrimaryLinks = List(headlines, opinion, sport, culture, lifestyle)
  val topLevelSections = List(News, Opinion, Sport, Arts, Lifestyle)

  trait EditionalisedNavigationSection {
    def name: String

    def uk: List[NavLink]
    def us: List[NavLink]
    def au: List[NavLink]
    def int: List[NavLink]

    def getEditionalisedNavLinks(edition: Edition): List[NavLink] = edition match {
      case editions.Uk => uk
      case editions.Au => au
      case editions.Us => us
      case editions.International => int
    }
  }

  def getTopLevelSection(name: String): EditionalisedNavigationSection = name match {
    case "news" => News
    case "opinion" => Opinion
    case "sport" => Sport
    case "arts" => Arts
    case "lifestyle" => Lifestyle
  }

  case object News extends EditionalisedNavigationSection {
    val name = "news"

    val uk = List(
      headlines,
      ukNews,
      world,
      business,
      football,
      environment,
      tech,
      politics,
      science,
      globalDevelopment,
      cities,
      obituaries
    )
    val au = List(
      headlines,
      australiaNews,
      world,
      auPolitics,
      environment,
      football,
      indigenousAustralia,
      auImmigration,
      media
    )
    val us = List(
      headlines,
      usNews,
      world,
      environment,
      soccer,
      usPolitics,
      business,
      science,
      money,
      tech,
      obituaries
    )
    val int = List(
      headlines,
      world,
      ukNews,
      science,
      cities,
      globalDevelopment,
      football,
      tech,
      business,
      environment,
      obituaries
    )
  }

  case object Opinion extends EditionalisedNavigationSection {
    val name = "opinion"

    val uk = List(
      opinion,
      theGuardianView,
      columnists,
      cartoons,
      inMyOpinion,
      letters
    )

    val au = List(
      opinion,
      auColumnists,
      cartoons,
      indigenousAustraliaOpinion,
      theGuardianView.copy(title="editorials"),
      letters
    )

    val us = List(
      opinion,
      theGuardianView,
      columnists,
      letters,
      inMyOpinion,
      cartoons
    )

    val int = List(
      opinion,
      theGuardianView,
      columnists,
      cartoons,
      inMyOpinion,
      letters
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = List(sport, football, rugbyUnion, cricket, tennis, cycling, formulaOne, rugbyLeague, racing, usSports, golf)
    val au = List(sport, football, AFL, NRL, aLeague, cricket, rugbyUnion, tennis)
    val us = List(sport, soccer, NFL, tennis, MLB, MLS, NBA, NHL)
    val int = List(sport, football, rugbyUnion, cricket, tennis, cycling, formulaOne, golf, usSports)
  }

  case object Arts extends EditionalisedNavigationSection {
    val name = "arts"

    val uk = List(culture, tvAndRadio, music, film, stage, books, games, artAndDesign, classical)
    val au = List(culture, film, music, books, tvAndRadio, artAndDesign, stage, games, classical)
    val us = List(culture, film, books, music, artAndDesign, tvAndRadio, stage, classical, games)
    val int = List(culture, books, music, tvAndRadio, artAndDesign, film, games, classical, stage)
  }

  case object Lifestyle extends EditionalisedNavigationSection {
    val name = "lifestyle"

    val uk = List(lifestyle, fashion, food, recipes, travel, loveAndSex, family, home, health, women, money)
    val au = List(lifestyle, travel, foodAu, relationshipsAu, fashionAu, healthAu, loveAndSex, family, home)
    val us = List(lifestyle, fashion, food, recipes, loveAndSex, home, health, family, travel, money)
    val int = List(lifestyle, fashion, food, recipes, loveAndSex, health, home, women, family, travel, money)
  }

  case object BrandExtensions extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_uk_web_newheader"),
      ukMasterClasses
    )

    val au = List(
      jobs.copy(url = jobs.url + "/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"),
      auEvents
    )

    val us = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader")
    )

    val int = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_int_web_newheader")
    )
  }

  case object OtherLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
      apps.copy(url = apps.url + "?INTCMP=apps_uk_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      NavLink("professional networks", "/guardian-professional"),
      crosswords
    )

    val au = List(
      apps.copy(url = apps.url + "?INTCMP=apps_au_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    )

    val us = List(
      apps.copy(url = apps.url + "?INTCMP=apps_us_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    )

    val int = List(
      apps.copy(url = apps.url + "?INTCMP=apps_int_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      crosswords
    )
  }

  object SubSectionLinks {

    val ukNewsSubNav = List(ukNews, politics, education, media, society, law, scotland, wales, northernIreland)
    val worldSubNav = List(world, europe, usNews, americas, asia, australiaNews, middleEast, africa, inequality, cities, globalDevelopment)
    val moneySubNav = List(money, property, pensions, savings, borrowing, careers)

    val footballSubNav = List(
      football,
      NavLink("live scores", "/football/live", "football/live"),
      NavLink("tables", "/football/tables", "football/tables"),
      NavLink("competitions", "/football/competitions", "football/competitions"),
      NavLink("results", "/football/results", "football/results"),
      NavLink("fixtures", "/football/fixtures", "football/fixtures"),
      NavLink("clubs", "/football/teams", "football/teams")
    )

    val todaysPaperSubNav = List(
      todaysPaper,
      NavLink("obituaries", "/tone/obituaries"),
      NavLink("g2", "/theguardian/g2"),
      NavLink("weekend", "/theguardian/weekend"),
      NavLink("the guide", "/theguardian/theguide"),
      NavLink("saturday review", "/theguardian/guardianreview")
    )

    val theObserverSubNav = List(
      observer,
      NavLink("comment", "/theobserver/news/comment"),
      NavLink("the new review", "/theobserver/new-review"),
      NavLink("observer magazine", "/theobserver/magazine")
    )

    val crosswordsSubNav = List(
      crosswords,
      NavLink("blog", "/crosswords/crossword-blog"),
      NavLink("editor", "/crosswords/series/crossword-editor-update"),
      NavLink("quick", "/crosswords/series/quick"),
      NavLink("cryptic", "/crosswords/series/cryptic"),
      NavLink("prize", "/crosswords/series/prize"),
      NavLink("weekend", "/crosswords/series/weekend-crossword"),
      NavLink("quiptic", "/crosswords/series/quiptic"),
      NavLink("genius", "/crosswords/series/genius"),
      NavLink("speedy", "/crosswords/series/speedy"),
      NavLink("everyman", "/crosswords/series/everyman"),
      NavLink("azed", "/crosswords/series/azed")
    )

    case object businessSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = List(business, economics, banking, money, markets, projectSyndicate, businessToBusiness)
      val us = List(business, economics, sustainableBusiness, diversityEquality, smallBusiness)
      val au = List(business, markets, money, projectSyndicate)
      val int = uk
    }

    case object environmentSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = List(environment, climateChange, wildlife, energy, pollution)
      val us = uk
      val au = List(environment, cities, globalDevelopment, sustainableBusiness)
      val int = uk
    }

    case object travelSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = List(travel, travelUk, travelEurope, travelUs)
      val us = List(travel, travelUs, travelEurope, travelUk)
      val au = List(travel, travelAustralasia, travelAsia, travelUk, travelEurope, travelUs)
      val int = uk
    }

    val editionalisedSubSectionLinks = List(
      SectionsLink("business", business, businessSubNav),
      SectionsLink("environment", environment, environmentSubNav),
      SectionsLink("travel", travel, travelSubNav)
    )

    val subSectionLinks = List(
      SubSectionLink("uk-news", ukNewsSubNav),
      SubSectionLink("world", worldSubNav),
      SubSectionLink("money", moneySubNav),
      SubSectionLink("football", footballSubNav),
      SubSectionLink("theguardian", todaysPaperSubNav),
      SubSectionLink("observer", theObserverSubNav),
      SubSectionLink("crosswords", crosswordsSubNav)
    )
  }
}
