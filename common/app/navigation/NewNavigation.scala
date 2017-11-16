package navigation

import NavLinks._
import common.Edition
import common.editions

case class NavLink(title: String, url: String, uniqueSection: String = "", longTitle: String = "", iconName: String = "")
case class SectionsLink(pageId: String, navLink: NavLink, parentSection: NewNavigation.EditionalisedNavigationSection)
case class SubSectionLink(pageId: String, parentSection: NavLinkLists)
case class NavLinkLists(mostPopular: Seq[NavLink], leastPopular: Seq[NavLink] = List())

object NewNavigation {

  val PrimaryLinks = List(headlines, opinion, sport, culture, lifestyle)
  val topLevelSections = List(News, Opinion, Sport, Arts, Lifestyle)

  trait EditionalisedNavigationSection {
    def name: String

    def uk: NavLinkLists
    def us: NavLinkLists
    def au: NavLinkLists
    def int: NavLinkLists

    def getAllEditionalisedNavLinks(edition: Edition): Seq[NavLink] = edition match {
      case editions.Uk => uk.mostPopular ++ uk.leastPopular
      case editions.Au => au.mostPopular ++ au.leastPopular
      case editions.Us => us.mostPopular ++ us.leastPopular
      case editions.International => int.mostPopular ++ int.leastPopular
    }

    def getEditionalisedSubSectionLinks(edition: Edition): NavLinkLists = edition match {
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

  case object MostPopular extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(List(headlines, ukNews, world, business, environment, tech, football))
    val au = NavLinkLists(List(headlines, australiaNews, world, auPolitics, environment, football))
    val us = NavLinkLists(List(headlines, usNews, world, usPolitics, business, environment, soccer))
    val int = NavLinkLists(List(headlines, world, ukNews, business, science, globalDevelopment, football))
  }

  case object News extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(
      List(headlines, ukNews, world, business, environment, tech, politics),
      List(science, globalDevelopment, cities, obituaries)
    )
    val au = NavLinkLists(
      List(headlines, australiaNews, world, auPolitics, environment),
      List(indigenousAustralia, auImmigration, media)
    )
    val us = NavLinkLists(
      List(headlines, usNews, world, environment, usPolitics, business),
      List(science, money, tech, obituaries)
    )
    val int = NavLinkLists(
      List(headlines, world, ukNews, science, cities, globalDevelopment),
      List(tech, business, environment, obituaries)
    )
  }

  case object Opinion extends EditionalisedNavigationSection {
    val name = "opinion"

    val uk = NavLinkLists(
      List(
        opinion,
        theGuardianView,
        columnists,
        cartoons,
        inMyOpinion
      ),
      List(
        letters,
        NavLink("Polly Toynbee", "/profile/pollytoynbee"),
        NavLink("Owen Jones", "/profile/owen-jones"),
        NavLink("Jonathan Freedland", "/profile/jonathanfreedland"),
        NavLink("Marina Hyde", "/profile/marinahyde")
      )
    )

    val au = NavLinkLists(
      List(
        opinion,
        auColumnists,
        cartoons,
        indigenousAustraliaOpinion,
        theGuardianView.copy(title="editorials")
      ),
      List(
        letters,
        NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"),
        NavLink("Katharine Murphy", "/profile/katharine-murphy")
      )
    )

    val us = NavLinkLists(
      List(
        opinion,
        theGuardianView,
        columnists,
        letters
      ),
      List(
        NavLink("Jill Abramson", "/profile/jill-abramson"),
        NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
        NavLink("Steven W Thrasher", "/profile/steven-w-thrasher"),
        NavLink("Richard Wolffe", "/profile/richard-wolffe"),
        inMyOpinion,
        cartoons
      )
    )

    val int = NavLinkLists(
      List(
          opinion,
          theGuardianView,
          columnists,
          cartoons,
          inMyOpinion
        ),
      List(
        letters
      )
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, cycling, formulaOne),
      List(rugbyLeague, racing, usSports, golf)
    )
    val au = NavLinkLists(
      List(sport, football, AFL, NRL, aLeague, cricket, rugbyUnion),
      List(tennis)
    )
    val us = NavLinkLists(
      List(sport, soccer, NFL, tennis, MLB, MLS),
      List(NBA, NHL)
    )
    val int = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, cycling, formulaOne),
      List(golf, usSports)
    )
  }

  case object Arts extends EditionalisedNavigationSection {
    val name = "arts"

    val uk = NavLinkLists(
      List(culture, tvAndRadio, music, film, stage, books, games, artAndDesign),
      List(classical)
    )
    val au = NavLinkLists(
      List(culture, film, music, books, tvAndRadio, artAndDesign, stage),
      List(games, classical)
    )
    val us = NavLinkLists(
      List(culture, film, books, music, artAndDesign, tvAndRadio, stage),
      List(classical, games)
    )
    val int = NavLinkLists(
      List(culture, books, music, tvAndRadio, artAndDesign, film),
      List(games, classical, stage)
    )
  }

  case object Lifestyle extends EditionalisedNavigationSection {
    val name = "lifestyle"

    val uk = NavLinkLists(
      List(lifestyle, fashion, food, recipes, travel, loveAndSex, family),
      List(home, health, women, money)
    )
    val au = NavLinkLists(
      List(lifestyle, travel, foodAu, relationshipsAu, fashionAu, healthAu),
      List(loveAndSex, family, home)
    )
    val us = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, home),
      List(health, family, travel, money)
    )
    val int = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, health),
      List(home, women, family, travel, money)
    )
  }

  case object BrandExtensions extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_uk_web_newheader"),
      ukMasterClasses
    ))

    val au = NavLinkLists(List(
      jobs.copy(url = jobs.url + "/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"),
      auEvents
    ))

    val us = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader")
    ))

    val int = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_int_web_newheader")
    ))
  }

  case object OtherLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
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
    ))

    val au = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_au_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val us = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_us_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val int = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_int_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      crosswords
    ))
  }

  object SubSectionLinks {

    val ukNewsSubNav = NavLinkLists(
      List(ukNews, politics, education, media, society, law, scotland),
      List(wales, northernIreland)
    )

    val worldSubNav = NavLinkLists(
      List(world, europe, usNews, americas, asia, australiaNews, middleEast, africa),
      List(inequality, cities, globalDevelopment)
    )

    val moneySubNav = NavLinkLists(List(money, property, pensions, savings, borrowing, careers))

    val footballSubNav = NavLinkLists(
      List(
        football,
        NavLink("live scores", "/football/live", "football/live"),
        NavLink("tables", "/football/tables", "football/tables"),
        NavLink("competitions", "/football/competitions", "football/competitions"),
        NavLink("results", "/football/results", "football/results"),
        NavLink("fixtures", "/football/fixtures", "football/fixtures"),
        NavLink("clubs", "/football/teams", "football/teams")
      )
    )

    val todaysPaperSubNav = NavLinkLists(
      List(
        todaysPaper,
        NavLink("obituaries", "/tone/obituaries"),
        NavLink("g2", "/theguardian/g2"),
        NavLink("weekend", "/theguardian/weekend"),
        NavLink("the guide", "/theguardian/theguide"),
        NavLink("saturday review", "/theguardian/guardianreview")
      )
    )

    val theObserverSubNav = NavLinkLists(
      List(
        observer,
        NavLink("comment", "/theobserver/news/comment"),
        NavLink("the new review", "/theobserver/new-review"),
        NavLink("observer magazine", "/theobserver/magazine")
      )
    )

    val crosswordsSubNav = NavLinkLists(
      List(
        crosswords,
        NavLink("blog", "/crosswords/crossword-blog"),
        NavLink("editor", "/crosswords/series/crossword-editor-update"),
        NavLink("quick", "/crosswords/series/quick"),
        NavLink("cryptic", "/crosswords/series/cryptic"),
        NavLink("prize", "/crosswords/series/prize"),
        NavLink("weekend", "/crosswords/series/weekend-crossword")
      ),
      List(
        NavLink("quiptic", "/crosswords/series/quiptic"),
        NavLink("genius", "/crosswords/series/genius"),
        NavLink("speedy", "/crosswords/series/speedy"),
        NavLink("everyman", "/crosswords/series/everyman"),
        NavLink("azed", "/crosswords/series/azed")
      )
    )

    case object businessSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = NavLinkLists(List(business, economics, banking, money, markets, projectSyndicate, businessToBusiness))
      val us = NavLinkLists(List(business, economics, sustainableBusiness, diversityEquality, smallBusiness))
      val au = NavLinkLists(List(business, markets, money, projectSyndicate))
      val int = uk
    }

    case object environmentSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = NavLinkLists(List(environment, climateChange, wildlife, energy, pollution))
      val us = uk
      val au = NavLinkLists(List(environment, cities, globalDevelopment, sustainableBusiness))
      val int = uk
    }

    case object travelSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = NavLinkLists(List(travel, travelUk, travelEurope, travelUs))
      val us = NavLinkLists(List(travel, travelUs, travelEurope, travelUk))
      val au = NavLinkLists(List(travel, travelAustralasia, travelAsia, travelUk, travelEurope, travelUs))
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
