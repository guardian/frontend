package common

import conf.Configuration
import NavLinks._
import model.Page

case class NavLink(title: String, url: String, uniqueSection: String = "", longTitle: String = "", iconName: String = "")
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
        inMyOpinion
      ),
      List(
        NavLink("Polly Toynbee", "/profile/pollytoynbee"),
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
      todaysPaper, observer, crosswords
    ))

    val au = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("masterclasses", "/guardian-masterclasses-australia"),
      crosswords, video
    ))

    val us = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_US_GU_JOBS"),
      crosswords, video
    ))

    val int = NavLinkLists(List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("dating", "https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_SOULMATES"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_JOBS"),
      NavLink("masterclasses", "/guardian-masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"),
      todaysPaper, observer, crosswords, video
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
      SectionsLink("technology/games", games, News),
      SectionsLink("us-news/us-politics", usPolitics, News),
      SectionsLink("australia-news/australian-politics", auPolitics, News),
      SectionsLink("australia-news/australian-immigration-and-asylum", auImmigration, News),
      SectionsLink("australia-news/indigenous-australians", indigenousAustralia, News),

      SectionsLink("commentisfree", opinion, Opinion),
      SectionsLink("cartoons", cartoons, Opinion),
      SectionsLink("index/contributors", columnists, Opinion),
      SectionsLink("commentisfree/series/comment-is-free-weekly", inMyOpinion, Opinion),
      SectionsLink("profile/editorial", theGuardianView, Opinion),


      SectionsLink("sport", sport, Sport),
      SectionsLink("football", football, Sport),
      SectionsLink("sport/rugby-union", rugbyUnion, Sport),
      SectionsLink("sport/cricket", cricket, Sport),
      SectionsLink("sport/tennis", tennis, Sport),
      SectionsLink("sport/cycling", cycling, Sport),
      SectionsLink("sport/golf", golf, Sport),
      SectionsLink("sport/us-sport", usSports, Sport),
      SectionsLink("sport/horse-racing", racing, Sport),
      SectionsLink("sport/rugbyleague", rugbyLeague, Sport),
      SectionsLink("sport/boxing", boxing, Sport),
      SectionsLink("sport/formulaone", formulaOne, Sport),
      SectionsLink("sport/nfl", NFL, Sport),
      SectionsLink("sport/mlb", MLB, Sport),
      SectionsLink("football/mls", MLS, Sport),
      SectionsLink("sport/nba", NBA, Sport),
      SectionsLink("sport/nhl", NHL, Sport),
      SectionsLink("sport/afl", AFL, Sport),
      SectionsLink("football/a-league", aLeague, Sport),
      SectionsLink("sport/nrl", NRL, Sport),
      SectionsLink("sport/australia-sport", australiaSport, Sport),

      SectionsLink("culture", culture, Arts),
      SectionsLink("film", film, Arts),
      SectionsLink("tv-and-radio", tvAndRadio, Arts),
      SectionsLink("music", music, Arts),
      SectionsLink("books", books, Arts),
      SectionsLink("artanddesign", artAndDesign, Arts),
      SectionsLink("stage", stage, Arts),
      SectionsLink("music/classicalmusicandopera", classical, Arts),

      SectionsLink("lifeandstyle", lifestyle, Life),
      SectionsLink("fashion", fashion, Life),
      SectionsLink("travel", travel, Life),
      SectionsLink("society", society, Life),
      SectionsLink("lifeandstyle/food-and-drink", food, Life),
      SectionsLink("tone/recipes", recipes, Life),
      SectionsLink("lifeandstyle/women", women, Life),
      SectionsLink("lifeandstyle/health-and-wellbeing", health, Life),
      SectionsLink("lifeandstyle/family", family, Life),
      SectionsLink("lifeandstyle/home-and-garden", home, Life),
      SectionsLink("lifeandstyle/love-and-sex", loveAndSex, Life)
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

        if (parentSection.contains(section.navLink) || section.navLink == headlines) {
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

    val ukNewsSubNav = NavLinkLists(
      List(ukNews, education, media, society, law, scotland),
      List(wales, northernIreland)
    )

    val worldSubNav = NavLinkLists(
      List(world, europe, usNews, americas, asia, australiaNews),
      List(africa, middleEast, cities, globalDevelopment)
    )

    val moneySubNav = NavLinkLists(List(property, pensions, savings, borrowing, careers))

    val footballSubNav = NavLinkLists(
      List(
        football,
        NavLink("live scores", "/football/live"),
        NavLink("tables", "/football/tables"),
        NavLink("competitions", "/football/competitions"),
        NavLink("results", "/football/results"),
        NavLink("fixtures", "/football/fixtures"),
        NavLink("clubs", "/football/teams")
      )
    )

    val todaysPaperSubNav = NavLinkLists(
      List(
        todaysPaper,
        NavLink("editorials & letters", "/theguardian/mainsection/editorialsandreply"),
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

      val uk = NavLinkLists(List(business, economics, banking, retail, markets, eurozone))
      val us = NavLinkLists(List(business, economics, sustainableBusiness, diversityEquality, smallBusiness))
      val au = NavLinkLists(List(business, markets, money))
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
      SubSectionLink("uk-news", ukNewsSubNav),
      SubSectionLink("world", worldSubNav),
      SubSectionLink("money", moneySubNav),
      SubSectionLink("football", footballSubNav),
      SubSectionLink("todayspaper", todaysPaperSubNav),
      SubSectionLink("theobserver", theObserverSubNav),
      SubSectionLink("crosswords", crosswordsSubNav)
    )

    def isEditionalistedSubSection(sectionId: String) = {
      editionalisedSubSectionLinks.exists(_.pageId == sectionId)
    }

    def getSectionOrTagId(page: Page) = {
      val tags = Navigation.getTagsFromPage(page)
      val commonKeywords = tagPages.intersect(tags.keywordIds)
      val isTagPage = page.metadata.isFront && tagPages.contains(page.metadata.id)
      val isArticleInTagPageSection = commonKeywords.nonEmpty

      if (isTagPage) {
        page.metadata.id
      } else if (isArticleInTagPageSection) {
        commonKeywords.head
      } else {
        page.metadata.sectionId
      }
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
