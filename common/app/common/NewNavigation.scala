package common

import conf.Configuration
import NavLinks._

case class NavLink(title: String, url: String, longTitle: String = "", iconName: String = "", uniqueSection: String = "")
case class SectionsLink(pageId: String, navLink: NavLink, parentSection: NewNavigation.EditionalisedNavigationSection)
case class SubSectionLink(pageId: String, parentSection: NavLinkLists)
case class NavLinkLists(mostPopular: Seq[NavLink], leastPopular: Seq[NavLink] = List())

object NewNavigation {

  var PrimaryLinks = List(
    NavLink("news", "/"),
    NavLink("opinion", "/commentisfree"),
    NavLink("sport", "/sport"),
    NavLink("arts", "/culture"),
    NavLink("life", "/lifeandstyle")
  )

  val topLevelSections = List(News, Opinion, Sport, Arts, Life)

  def getMembershipLinks(edition: Edition) = {
    val editionId = edition.id.toLowerCase()

    NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader", iconName= "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/${editionId}?INTCMP=NGW_NEWHEADER_${editionId}_GU_SUBSCRIBE", iconName= "device")
    ))
  }

  trait EditionalisedNavigationSection {
    def name: String

    def uk: NavLinkLists
    def us: NavLinkLists
    def au: NavLinkLists
    def int: NavLinkLists

    def getPopularEditionalisedNavLinks(edition: Edition) = edition match {
      case editions.Uk => uk.mostPopular
      case editions.Au => au.mostPopular
      case editions.Us => us.mostPopular
      case editions.International => int.mostPopular
    }

    def getAllEditionalisedNavLinks(edition: Edition) = edition match {
      case editions.Uk => uk.mostPopular ++ uk.leastPopular
      case editions.Au => au.mostPopular ++ au.leastPopular
      case editions.Us => us.mostPopular ++ us.leastPopular
      case editions.International => int.mostPopular ++ int.leastPopular
    }

    def getEditionalisedSubSectionLinks(edition: Edition) = edition match {
      case editions.Uk => uk
      case editions.Au => au
      case editions.Us => us
      case editions.International => int
    }
  }

  def getTopLevelSection(name: String) = name match {
    case "news" => News
    case "opinion" => Opinion
    case "sport" => Sport
    case "arts" => Arts
    case "life" => Life
  }

  def isCurrentSection(currentSection: String, navLink: NavLink): Boolean = {
    val mainFront = List("uk", "au", "us", "international")

    if (mainFront.contains(currentSection)) {
      "headlines" == navLink.title
    } else {
      currentSection == navLink.uniqueSection
    }
  }

  case object MostPopular extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(List(headlines, ukNews, world, politics, business, science, football))
    val au = NavLinkLists(List(headlines, australiaNews, world, auPolitics, auImmigration, football))
    val us = NavLinkLists(List(headlines, usNews, world, usPolitics, business, science, soccer))
    val int = NavLinkLists(List(headlines, world, ukNews, science, cities, globalDevelopment, football))
  }

  case object News extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(
      List(headlines, ukNews, world, politics, science, business),
      List(tech, environment, money)
    )
    val au = NavLinkLists(
      List(headlines, australiaNews, world, auPolitics, auImmigration),
      List(indigenousAustralia, economy, tech, environment, media)
    )
    val us = NavLinkLists(
      List(headlines, usNews, world, science, usPolitics, business),
      List(environment, money, tech)
    )
    val int = NavLinkLists(
      List(headlines, world, ukNews, science, cities, globalDevelopment),
      List(tech, business, environment)
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
        NavLink("in my opinion", "/commentisfree/series/comment-is-free-weekly")
      ),
      List(
        NavLink("Polly Toynbee", "/profile/pollytoyn"),
        NavLink("Owen Jones", "/profile/owen-jones"),
        NavLink("Jonathan Freedland", "/profile/jonathanfreedland"),
        NavLink("Marina Hyde", "/profile/marinahyde"),
        NavLink("George Monbiot", "/profile/georgemonbiot"),
        NavLink("Gary Younge", "/profile/garyyounge"),
        NavLink("Nick Cohen", "/profile/nickcohen")
      )
    )

    val au = NavLinkLists(
      List(opinion,
        NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"),
        NavLink("Katharine Murphy", "/profile/katharine-murphy"),
        NavLink("Kristina Keneally", "/profile/kristina-keneally")
      ),
      List(
        NavLink("Richard Ackland", "/profile/richard-ackland"),
        NavLink("Van Badham", "/profile/van-badham"),
        NavLink("Lenore Taylor", "/profile/lenore-taylor"),
        NavLink("Jason Wilson", "/profile/wilson-jason"),
        NavLink("Brigid Delaney", "/profile/brigiddelaney"),
        columnists
      )
    )

    val us = NavLinkLists(
      List(
        opinion,
        NavLink("Jill Abramson", "/profile/jill-abramson"),
        NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
        NavLink( "Steven W Thrasher", "/profile/steven-w-thrasher")
      ),
      List(
        NavLink("Trevor Timm", "/profile/trevor-timm"),
        NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"),
        NavLink("Chelsea E Manning", "/profile/chelsea-e-manning"),
        columnists
      )
    )

    val int = NavLinkLists(
      List(opinion, columnists, theGuardianView, cartoons)
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, cycling, formulaOne),
      List(boxing, rugbyLeague, racing, usSports, golf)
    )
    val au = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, AFL, tennis),
      List(cycling, aLeague, NRL, australiaSport)
    )
    val us = NavLinkLists(
      List(sport, soccer, NFL, tennis, MLB, MLS),
      List(NBA, NHL)
    )
    val int = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, formulaOne),
      List(cycling, golf, boxing, usSports)
    )
  }

  case object Arts extends EditionalisedNavigationSection {
    val name = "arts"

    val uk = NavLinkLists(
      List(culture, tvAndRadio, music, film, books, games, artAndDesign),
      List(stage, classical)
    )
    val au = NavLinkLists(
      List(culture, books, music, artAndDesign, film, games),
      List(stage, classical)
    )
    val us = NavLinkLists(
      List(culture, books, music, artAndDesign, tvAndRadio, stage),
      List(classical, film, games)
    )
    val int = NavLinkLists(
      List(culture, books, music, tvAndRadio, artAndDesign, film),
      List(games, classical, stage)
    )
  }

  case object Life extends EditionalisedNavigationSection {
    val name = "life"

    val uk = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, family),
      List(home, health, women, travel, tech)
    )
    val au = NavLinkLists(
      List(lifestyle, fashion, food, loveAndSex, health),
      List(family, women, travel, home)
    )
    val us = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, home),
      List(health, women, family, travel, tech)
    )
    val int = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, health),
      List(home, women, family, travel, tech)
    )
  }

  case object NavFooterLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_JOBS"),
      NavLink("dating", "https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_SOULMATES"),
      NavLink("professional", "/guardian-professional"),
      NavLink("masterclasses", "/guardian-masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"),
      NavLink("courses", "/?INTCMP=NGW_TOPNAV_UK_GU_COURSES"),
      NavLink("holidays", "https://holidays.theguardian.com/?utm_source=theguardian&utm_medium=guardian-links&utm_campaign=topnav&INTCMP=topnav"),
      NavLink("today's paper", "/theguardian"),
      NavLink("the observer", "/observer"),
      NavLink("crosswords", "/crosswords")
    ))

    val au = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("masterclasses", "/guardian-masterclasses-australia"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    ))

    val us = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_US_GU_JOBS"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    ))

    val int = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("dating", "https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_SOULMATES"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_JOBS"),
      NavLink("masterclasses", "/guardian-masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"),
      NavLink("today's paper", "/theguardian"),
      NavLink("the observer", "/observer"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    ))
  }

  object SectionLinks {

    var sectionLinks = List(

      SectionsLink("uk", headlines, MostPopular),
      SectionsLink("us", headlines, MostPopular),
      SectionsLink("au", headlines, MostPopular),
      SectionsLink("international", headlines, MostPopular),
      SectionsLink("uk-news", ukNews,News),
      SectionsLink("world", world, News),
      SectionsLink("politics", politics, News),
      SectionsLink("environment", environment, News),
      SectionsLink("business", business, News),
      SectionsLink("technology", tech, News),
      SectionsLink("science", science, News),
      SectionsLink("money", money, News),
      SectionsLink("australia-news", australiaNews, News),
      SectionsLink("media", media, News),
      SectionsLink("us-news", usNews, News),
      SectionsLink("cities", cities, News),
      SectionsLink("global-development", globalDevelopment, News),
      SectionsLink("sustainable-business", sustainableBusiness, News),
      SectionsLink("law", law, News),

      SectionsLink("commentisfree", opinion, Opinion),
      SectionsLink("index", columnists, Opinion),

      SectionsLink("sport", sport, Sport),
      SectionsLink("football", football, Sport),

      SectionsLink("culture", culture, Arts),
      SectionsLink("film", film, Arts),
      SectionsLink("tv-and-radio", tvAndRadio, Arts),
      SectionsLink("music", music, Arts),
      SectionsLink("books", books, Arts),
      SectionsLink("artanddesign", artAndDesign, Arts),
      SectionsLink("stage", stage, Arts),

      SectionsLink("lifeandstyle", lifestyle, Life),
      SectionsLink("fashion", fashion, Life),
      SectionsLink("travel", travel, Life),
      SectionsLink("society", society, Life)
    )

    def getSectionLinks(sectionName: String, edition: Edition) = {
      val sectionList = sectionLinks.filter { item =>
        item.pageId == sectionName
      }

      if (sectionList.isEmpty) {
        News.getPopularEditionalisedNavLinks(edition).drop(1)
      } else {
        val section = sectionList.head
        val parentSection = section.parentSection.getPopularEditionalisedNavLinks(edition).drop(1)

        if (parentSection.contains(section.navLink)) {
          parentSection
        } else {
          Seq(section.navLink) ++ parentSection
        }
      }
    }

    def getTopLevelSection(sectionName: String) = {
      val sectionList = sectionLinks.filter { item =>
        item.pageId == sectionName
      }

      if (sectionList.isEmpty) {
        "News"
      } else {
        sectionList.head.parentSection.name
      }
    }
  }

  object SubSectionLinks {

    val ukNews = NavLinkLists(
      List(education, media, society, law, scotland),
      List(wales, northernIreland)
    )

    val worldSubNav = NavLinkLists(
      List(europe, usNews, americas, asia, australiaNews),
      List(africa, middleEast, cities, globalDevelopment)
    )

    val moneySubNav = NavLinkLists(List(property, pensions, savings, borrowing, careers))

    val football = NavLinkLists(
      List(
        NavLink("live scores", "/football/live"),
        NavLink("tables", "/football/tables"),
        NavLink("competitions", "/football/competitions"),
        NavLink("results", "/football/results"),
        NavLink("fixtures", "/football/fixtures"),
        NavLink("clubs", "/football/teams")
      )
    )

    val todaysPaper = NavLinkLists(
      List(
        NavLink("editorials & letters", "/theguardian/mainsection/editorialsandreply"),
        NavLink("obituaries", "/tone/obituaries"),
        NavLink("g2", "/theguardian/g2"),
        NavLink("weekend", "/theguardian/weekend"),
        NavLink("the guide", "/theguardian/theguide"),
        NavLink("saturday review", "/theguardian/guardianreview")
      )
    )

    val theObserver = NavLinkLists(
      List(
        NavLink("comment", "/theobserver/news/comment"),
        NavLink("the new review", "/theobserver/new-review"),
        NavLink("observer magazine", "/theobserver/magazine")
      )
    )

    val crosswords = NavLinkLists(
      List(
        NavLink("blog", "/crosswords/crossword-blog"),
        NavLink("editor", "/crosswords/series/crossword-editor-update"),
        NavLink("quick", "/crosswords/series/quick"),
        NavLink("cryptic", "/crosswords/series/cryptic"),
        NavLink("prize", "/crosswords/series/prize")
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

      val uk = NavLinkLists(List(economics, banking, retail, markets, eurozone))
      val us = NavLinkLists(List(economics, sustainableBusiness, diversityEquality, smallBusiness))
      val au = NavLinkLists(List(markets, money))
      val int = uk
    }

    case object environmentSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = NavLinkLists(List(climateChange, wildlife, energy, pollution))
      val us = uk
      val au = NavLinkLists(List(cities, globalDevelopment, sustainableBusiness))
      val int = uk
    }

    case object travelSubNav extends EditionalisedNavigationSection {
      val name = ""

      val uk = NavLinkLists(List(travelUk, travelEurope, travelUs, skiing))
      val us = NavLinkLists(List(travelUs, travelEurope, travelUk, skiing))
      val au = NavLinkLists(List(travelAustralasia, travelAsia, travelUk, travelEurope, travelUs, skiing))
      val int = uk
    }

    val editionalisedSubSectionLinks = List(
      SectionsLink("business", business, businessSubNav),
      SectionsLink("environment", environment, environmentSubNav),
      SectionsLink("travel", travel, travelSubNav)
    )

    val subSectionLinks = List(
      SubSectionLink("uk-news", ukNews),
      SubSectionLink("world", worldSubNav),
      SubSectionLink("money", moneySubNav),
      SubSectionLink("football", football),
      SubSectionLink("todayspaper", todaysPaper),
      SubSectionLink("theobserver", theObserver),
      SubSectionLink("crosswords", crosswords)
    )

    def isEditionalistedSubSection(sectionId: String) = {
      editionalisedSubSectionLinks.exists(_.pageId == sectionId)
    }

    def getSubSectionNavLinks(sectionId: String, edition: Edition, isFront: Boolean) = {
      if (isFront) {

        if (isEditionalistedSubSection(sectionId)) {
          val subNav = editionalisedSubSectionLinks.filter(_.pageId == sectionId).head.parentSection

          subNav.getEditionalisedSubSectionLinks(edition).mostPopular
        } else {
          val subSectionList = subSectionLinks.filter(_.pageId == sectionId)

          if (subSectionList.isEmpty) {
            NewNavigation.SectionLinks.getSectionLinks(sectionId, edition)
          } else {
            subSectionList.head.parentSection.mostPopular
          }
        }
      } else {
        NewNavigation.SectionLinks.getSectionLinks(sectionId, edition)
      }
    }
  }
}
