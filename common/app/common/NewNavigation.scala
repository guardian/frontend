package common

import conf.Configuration
import NavLinks._
import model.Page

case class NavLink(title: String, url: String, uniqueSection: String = "", longTitle: String = "", iconName: String = "")
case class SectionsLink(pageId: String, navLink: NavLink, parentSection: NewNavigation.EditionalisedNavigationSection)
case class SubSectionLink(pageId: String, parentSection: NavLinkLists)
case class NavLinkLists(mostPopular: Seq[NavLink], leastPopular: Seq[NavLink] = List())

object NewNavigation {

  val PrimaryLinks = List(headlines, opinion, sport, culture, lifestyle)
  val topLevelSections = List(News, Opinion, Sport, Arts, Life)

  def getMembershipLinks(edition: Edition): NavLinkLists = {
    val editionId = edition.id.toLowerCase()

    NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/${editionId}/supporter?INTCMP=mem_${editionId}_web_newheader"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/${editionId}?INTCMP=NGW_NEWHEADER_${editionId}_GU_SUBSCRIBE")
    ))
  }

  trait EditionalisedNavigationSection {
    def name: String

    def uk: NavLinkLists
    def us: NavLinkLists
    def au: NavLinkLists
    def int: NavLinkLists

    def getPopularEditionalisedNavLinks(edition: Edition): Seq[NavLink] = edition match {
      case editions.Uk => uk.mostPopular
      case editions.Au => au.mostPopular
      case editions.Us => us.mostPopular
      case editions.International => int.mostPopular
    }

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
    case "life" => Life
  }

  case object MostPopular extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(List(headlines, ukNews, ukElection2017, world, tech, business, football))
    val au = NavLinkLists(List(headlines, australiaNews, world, auPolitics, environment, economy, football))
    val us = NavLinkLists(List(headlines, usNews, world, usPolitics, business, science, soccer))
    val int = NavLinkLists(List(headlines, world, ukNews, business, science, globalDevelopment, football))
  }

  case object News extends EditionalisedNavigationSection {
    val name = "news"

    val uk = NavLinkLists(
      List(headlines, ukNews, world, business, ukElection2017, tech, politics),
      List(science, globalDevelopment, cities, obituaries)
    )
    val au = NavLinkLists(
      List(headlines, australiaNews, world, auPolitics, environment, economy),
      List(indigenousAustralia, tech, environment, media, obituaries)
    )
    val us = NavLinkLists(
      List(headlines, usNews, world, science, usPolitics, business),
      List(environment, money, tech, obituaries)
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
        editorials,
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
        theGuardianView
      ),
      List(
        NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"),
        NavLink("Katharine Murphy", "/profile/katharine-murphy"),
        NavLink("Kristina Keneally", "/profile/kristina-keneally"),
        NavLink("Richard Ackland", "/profile/richard-ackland"),
        NavLink("Van Badham", "/profile/van-badham"),
        NavLink("Lenore Taylor", "/profile/lenore-taylor")
      )
    )

    val us = NavLinkLists(
      List(
        opinion,
        theGuardianView,
        columnists,
        cartoons,
        inMyOpinion
      ),
      List(
        NavLink("Jill Abramson", "/profile/jill-abramson"),
        NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
        NavLink( "Steven W Thrasher", "/profile/steven-w-thrasher"),
        NavLink("Trevor Timm", "/profile/trevor-timm"),
        NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"),
        NavLink("Chelsea E Manning", "/profile/chelsea-e-manning")
      )
    )

    val int = NavLinkLists(
      List(
          opinion,
          theGuardianView,
          columnists,
          cartoons,
          inMyOpinion
        )
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, formulaOne),
      List(boxing, rugbyLeague, racing, usSports, golf)
    )
    val au = NavLinkLists(
      List(sport, football, cricket, AFL, NRL, tennis, rugbyUnion),
      List(aLeague, australiaSport)
    )
    val us = NavLinkLists(
      List(sport, soccer, NFL, tennis, MLB, MLS),
      List(NBA, NHL)
    )
    val int = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, formulaOne),
      List(golf, boxing, usSports)
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

  case object Life extends EditionalisedNavigationSection {
    val name = "life"

    val uk = NavLinkLists(
      List(lifestyle, fashion, food, recipes, travel, loveAndSex, family),
      List(home, health, women, money)
    )
    val au = NavLinkLists(
      List(lifestyle, travel, foodAu, relationshipsAu, fashionAu, healthAu),
      List(loveAndSex, family, women, home, money)
    )
    val us = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, home),
      List(health, women, family, travel, money)
    )
    val int = NavLinkLists(
      List(lifestyle, fashion, food, recipes, loveAndSex, health),
      List(home, women, family, travel, money)
    )
  }

  case object NavFooterLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
      NavLink("holidays", "https://holidays.theguardian.com/?utm_source=theguardian&utm_medium=guardian-links&utm_campaign=topnav&INTCMP=topnav"),
      ukMasterClasses,
      NavLink("professional networks", "/guardian-professional"),
      apps.copy(url = apps.url + "?INTCMP=apps_uk_web_newheader"),
      podcasts,
      video,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      crosswords
    ))

    val au = NavLinkLists(List(
      jobs.copy(url = jobs.url + "/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"),
      auEvents,
      apps.copy(url = apps.url + "?INTCMP=apps_au_web_newheader"),
      podcasts,
      video,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val us = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader"),
      apps.copy(url = apps.url + "?INTCMP=apps_us_web_newheader"),
      podcasts,
      video,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val int = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
      apps.copy(url = apps.url + "?INTCMP=apps_int_web_newheader"),
      podcasts,
      video,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      crosswords
    ))
  }

  object SectionLinks {

    val sectionLinks = List(

      SectionsLink("uk", headlines, MostPopular),
      SectionsLink("us", headlines, MostPopular),
      SectionsLink("au", headlines, MostPopular),
      SectionsLink("international", headlines, MostPopular),
      SectionsLink("uk-news", ukNews, News),
      SectionsLink("world", world, News),
      SectionsLink("world/europe-news", europe, News),
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
      SectionsLink("cartoons/archive", cartoons, Opinion),
      SectionsLink("type/cartoon", cartoons, Opinion),
      SectionsLink("au/index/contributors", auColumnists, Opinion),
      SectionsLink("index/contributors", columnists, Opinion),
      SectionsLink("commentisfree/series/comment-is-free-weekly", inMyOpinion, Opinion),
      SectionsLink("profile/editorial", theGuardianView, Opinion),

      SectionsLink("sport", sport, Sport),
      SectionsLink("football", football, Sport),
      SectionsLink("sport/rugby-union", rugbyUnion, Sport),
      SectionsLink("sport/cricket", cricket, Sport),
      SectionsLink("sport/tennis", tennis, Sport),
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
      SectionsLink("lifeandstyle/love-and-sex", loveAndSex, Life),
      SectionsLink("au/lifeandstyle/fashion", fashionAu, Life),
      SectionsLink("au/lifeandstyle/food-and-drink", foodAu, Life),
      SectionsLink("au/lifeandstyle/relationships", relationshipsAu, Life),
      SectionsLink("au/lifeandstyle/health-and-wellbeing", healthAu, Life)
    )

    def getSectionLinks(sectionName: String, edition: Edition): Seq[NavLink] = {
      val sectionList = sectionLinks.filter { item =>
        item.pageId == sectionName
      }

      if (sectionList.isEmpty) {
        News.getPopularEditionalisedNavLinks(edition).drop(1)
      } else {
        val section = sectionList.head
        val parentSection = section.parentSection.getPopularEditionalisedNavLinks(edition).drop(1)

        if (parentSection.contains(section.navLink) || NewNavigation.PrimaryLinks.contains(section.navLink)) {
          parentSection
        } else {
          Seq(section.navLink) ++ parentSection
        }
      }
    }

    def getPillarName(id: String): String = {
      getSectionLink(id).getOrElse("News")
    }

    def getActivePillar(page: Page): Tuple2[String, String] = {
      val sectionOrTagId = SubSectionLinks.getSectionOrTagId(page)
      val activeSectionLink = getSectionLink(sectionOrTagId)

      (sectionOrTagId, activeSectionLink.getOrElse(""))
    }

    private def getSectionLink(id: String): Option[String] = {
      sectionLinks.find(_.pageId == id).map(_.parentSection.name)
    }
  }

  object SubSectionLinks {

    val ukNewsSubNav = NavLinkLists(
      List(ukNews, politics, education, media, society, law, scotland),
      List(wales, northernIreland)
    )

    val worldSubNav = NavLinkLists(
      List(world, europe, usNews, americas, asia, australiaNews, middleEast, africa),
      List(cities, globalDevelopment)
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
        letters,
        editorials,
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

      val uk = NavLinkLists(List(business, economics, banking, money, markets, eurozone))
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

    def isEditionalistedSubSection(sectionId: String): Boolean = {
      editionalisedSubSectionLinks.exists(_.pageId == sectionId)
    }

    val frontLikePages = List(
      "theguardian",
      "observer",
      "football/live",
      "football/tables",
      "football/competitions",
      "football/results",
      "football/fixtures",
      "type/cartoon",
      "cartoons/archive"
    )

    def getSectionOrTagId(page: Page): String = {
      val tags = Navigation.getTagsFromPage(page)
      val commonKeywords = tags.keywordIds.intersect(tagPages).sortWith(tags.keywordIds.indexOf(_) < tags.keywordIds.indexOf(_))
      val isTagPage = (page.metadata.isFront || frontLikePages.contains(page.metadata.id)) && tagPages.contains(page.metadata.id)
      val isArticleInTagPageSection = commonKeywords.nonEmpty

      // opinion pieces should always clearly be opinion pieces, regardless of other keywords
      if (page.metadata.sectionId == "commentisfree") {
        page.metadata.sectionId
      } else if (isTagPage) {
        simplifySectionId(page.metadata.id)
      } else if (isArticleInTagPageSection) {
        simplifySectionId(commonKeywords.head)
      } else {
        simplifySectionId(page.metadata.sectionId)
      }
    }

    def simplifySectionId(sectionId: String): String = {
      val sectionMap = Map(
        "money/property" -> "money",
        "money/pensions" -> "money",
        "money/savings" -> "money",
        "money/debt" -> "money",
        "money/work-and-careers" -> "money",
        "world/europe-news" -> "world",
        "world/americas" -> "world",
        "world/asia" -> "world",
        "education" -> "uk-news",
        "media" -> "uk-news",
        "society" -> "uk-news",
        "law" -> "uk-news",
        "scotland" -> "uk-news",
        "business/economics" -> "business",
        "business/banking" -> "business",
        "business/retail" -> "business",
        "business/stock-markets" -> "business",
        "business/eurozone" -> "business",
        "us/sustainable-business" -> "business",
        "business/us-small-business" -> "business",
        "environment/climate-change" -> "environment",
        "environment/wildlife" -> "environment",
        "environment/energy" -> "environment",
        "environment/pollution" -> "environment",
        "travel/uk" -> "travel",
        "travel/europe" -> "travel",
        "travel/usa" -> "travel",
        "travel/skiing" -> "travel",
        "travel/australasia" -> "travel",
        "travel/asia" -> "travel"
      )

      sectionMap.getOrElse(sectionId, sectionId)
    }

    def simplifyFootball(sectionId: String): String = {
      val sectionMap = Map(
        "football/live" -> "football",
        "football/tables" -> "football",
        "football/competitions" -> "football",
        "football/results" -> "football",
        "football/fixtures" -> "football"
      )

      sectionMap.getOrElse(sectionId, sectionId)
    }

    def getSubSectionNavLinks(id: String, edition: Edition, isFront: Boolean): Seq[NavLink] = {
      if (isEditionalistedSubSection(id)) {
        val subNav = editionalisedSubSectionLinks.filter(_.pageId == id).head.parentSection

        subNav.getEditionalisedSubSectionLinks(edition).mostPopular
      } else {
        val subSectionList = subSectionLinks.filter(_.pageId == simplifyFootball(id))

        if (subSectionList.isEmpty) {
          NewNavigation.SectionLinks.getSectionLinks(id, edition)
        } else {
          subSectionList.head.parentSection.mostPopular
        }
      }
    }
  }
}
