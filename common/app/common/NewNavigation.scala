package common

import conf.Configuration

case class NavLink(title: String, url: String, longTitle: String = "", iconName: String = "", uniqueSection: String = "")
case class SectionsLink(pageId: String, parentSection: NewNavigation.EditionalisedNavigationSection)
case class SubSectionLink(pageId: String, parentSection: NavLinkLists)
case class NavLinkLists(mostPopular: Seq[NavLink], leastPopular: Seq[NavLink] = List())

object NewNavigation {

  /* NEWS */
  val headlines = NavLink("headlines", "/", iconName = "home")
  val ukNews = NavLink("UK news", "/uk-news", uniqueSection = "uk-news")
  val world = NavLink("world news", "/world", uniqueSection = "world")
  val environment = NavLink("environment", "/environment", uniqueSection = "environment")
  val business = NavLink("business", "/business", uniqueSection = "business")
  val economy = business.copy(title = "economy")
  val money = NavLink("money", "/money", uniqueSection = "money")
  val science = NavLink("science", "/science", uniqueSection = "science")
  var tech = NavLink("tech", "/technology", uniqueSection = "technology")
  var politics = NavLink("politics", "/politics", uniqueSection = "politics")
  var media = NavLink("media", "/media", uniqueSection = "media")
  var cities = NavLink("cities", "/cities", uniqueSection = "cities")
  var globalDevelopment = NavLink("development", "/global-development", uniqueSection = "global-development")
  var australiaNews = NavLink("australia news", "/australia-news", uniqueSection = "australia-news")
  var auPolitics = NavLink("politics", "/australia-news/australian-politics", "australian politics")
  var auImmigration = NavLink("immigration", "/australia-news/australian-immigration-and-asylum")
  var indigenousAustralia = NavLink("indigenous australia", "/australia-news/indigenous-australians")
  var usNews = NavLink("US news", "/us-news", uniqueSection = "us-news")
  var usPolitics = NavLink("politics", "/us-news/us-politics", "US politics")
  val education = NavLink("education", "/education")
  val society = NavLink("society", "/society")
  val law = NavLink("law", "/law")
  val scotland = NavLink("scotland", "/uk/scotland")
  val wales = NavLink("wales", "/uk/wales")
  val northernIreland = NavLink("northern ireland", "/uk/northernireland")
  val europe = NavLink("europe", "/world/europe-news")
  val americas = NavLink("americas", "/world/americas")
  val asia = NavLink("asia", "/world/asia")
  val africa = NavLink("africa", "/world/africa")
  val middleEast = NavLink("middle east", "/world/middleeast")
  val economics = NavLink("economics", "/business/economics")
  val banking = NavLink("banking", "/business/banking")
  val retail = NavLink("retail", "/business/retail")
  val markets = NavLink("markets", "/business/stock-markets")
  val eurozone = NavLink("eurozone", "/business/eurozone")
  val sustainableBusiness = NavLink("sustainable business", "/us/sustainable-business")
  val diversityEquality = NavLink("diversity & equality in business", "/business/diversity-and-equality")
  val smallBusiness = NavLink( "small business", "business/us-small-business")
  val climateChange = NavLink("climate change", "/environment/climate-change")
  val wildlife = NavLink("wildlife", "/environment/wildlife")
  val energy = NavLink( "energy", "/environment/energy")
  val pollution = NavLink("pollution", "/environment/pollution")
  val property = NavLink("property", "/money/property")
  val pensions = NavLink("pensions", "/money/pensions")
  val savings = NavLink("savings", "/money/savings")
  val borrowing = NavLink("borrowing", "/money/debt")
  val careers = NavLink("careers", "/money/work-and-careers")

  /* OPINION */
  val opinion = NavLink("opinion home", "/commentisfree", iconName = "home", uniqueSection = "commentisfree")
  var columnists = NavLink("columnists", "/index/contributors")
  val theGuardianView = NavLink("the guardian view", "/profile/editorial")
  val cartoons = NavLink("cartoons", "/cartoons/archive")

  /* SPORT */
  val sport = NavLink("sport home", "/sport", iconName = "home", uniqueSection = "sport")
  val football = NavLink("football", "/football", uniqueSection = "football")
  val soccer = football.copy(title = "soccer")
  val cricket = NavLink("cricket", "/sport/cricket")
  var rugbyUnion = NavLink("rugby union", "/sport/rugby-union")
  var formulaOne = NavLink("F1", "/sport/formulaone")
  var tennis = NavLink("tennis", "/sport/tennis")
  var golf = NavLink("golf", "/sport/golf")
  var cycling = NavLink("cycling", "/sport/cycling")
  var boxing = NavLink("boxing", "/sport/boxing")
  var usSports = NavLink("US sports", "/sport/us-sport")
  val racing = NavLink("racing", "/sport/horse-racing")
  val rugbyLeague = NavLink("rugby league", "/sport/rugbyleague")
  val australiaSport = NavLink("australia sport", "/sport/australia-sport")
  val AFL = NavLink("AFL", "/sport/afl")
  val NRL = NavLink("NRL", "/sport/nrl")
  val aLeague = NavLink("a-league", "/football/a-league")
  val NFL = NavLink("NFL", "/sport/nfl")
  val MLS = NavLink("MLS", "/sport/mls")
  val MLB = NavLink("MLB", "/sport/mlb")
  val NBA = NavLink("NBA", "/sport/nba")
  val NHL = NavLink("NHL", "/sport/nhl")

  /* ARTS */
  val culture = NavLink("culture home", "/culture", iconName = "home", uniqueSection = "culture")
  val film = NavLink("film", "/film", uniqueSection = "film")
  val tvAndRadio = NavLink("tv & radio", "/tv-and-radio", uniqueSection = "tv-and-radio")
  val music = NavLink("music", "/music", uniqueSection = "music")
  val games = NavLink("games", "/technology/games")
  val books = NavLink("books", "/books", uniqueSection = "books")
  val artAndDesign = NavLink("art & design", "/artanddesign", uniqueSection = "artanddesign")
  val stage = NavLink("stage", "/stage", uniqueSection = "stage")
  val classical = NavLink("classical", "/music/classicalmusicandopera")

  /* LIFE */
  val lifestyle = NavLink("lifestyle home", "/lifeandstyle", iconName = "home", uniqueSection = "lifeandstyle")
  val fashion = NavLink("fashion", "/fashion", uniqueSection = "fashion")
  val food = NavLink("food", "/lifeandstyle/food-and-drink")
  val travel = NavLink("travel", "/travel", uniqueSection = "travel")
  val loveAndSex = NavLink("love & sex", "/lifeandstyle/love-and-sex")
  var family = NavLink("family", "/lifeandstyle/family")
  var home = NavLink("home & garden", "/lifeandstyle/home-and-garden")
  var health = NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing")
  var women = NavLink("women", "/lifeandstyle/women")
  var recipes = NavLink("recipes", "/tone/recipes")
  val travelUk = NavLink("UK", "/travel/uk")
  val travelEurope = NavLink("europe", "/travel/europe")
  val travelUs = NavLink("US", "/travel/usa")
  val skiing = NavLink("skiing", "/travel/skiing")
  val travelAustralasia = NavLink("australasia", "/travel/australasia")
  val travelAsia = NavLink("asia", "/travel/asia")

  var PrimaryLinks = List(
    NavLink("news", "/"),
    NavLink("opinion", "/commentisfree"),
    NavLink("sport", "/sport"),
    NavLink("arts", "/culture"),
    NavLink("life", "/lifeandstyle")
  )

  val topLevelSections = List(News, Opinion, Sport, Arts, Life)

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
      case editions.Us => us.mostPopular ++ us.mostPopular
      case editions.International => int.mostPopular
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
      List(opinion, NavLink("Polly Toynbee", "/profile/pollytoynbee"), NavLink("Owen Jones", "/profile/owen-jones"), NavLink("Marina Hyde", "/profile/marinahyde")),
      List(NavLink("George Monbiot", "/profile/georgemonbiot"), NavLink("Gary Younge", "/profile/garyyounge"), NavLink("Nick Cohen", "/profile/nickcohen"), columnists, theGuardianView, cartoons)
    )

    val au = NavLinkLists(
      List(opinion, NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"), NavLink("Katharine Murphy", "/profile/katharine-murphy"), NavLink("Kristina Keneally", "/profile/kristina-keneally")),
      List(NavLink("Richard Ackland", "/profile/richard-ackland"), NavLink("Van Badham", "/profile/van-badham"), NavLink("Lenore Taylor", "/profile/lenore-taylor"), NavLink("Jason Wilson", "/profile/wilson-jason"), NavLink("Brigid Delaney", "/profile/brigiddelaney"), columnists)
    )

    val us = NavLinkLists(
      List(opinion, NavLink("Jill Abramson", "/profile/jill-abramson"), NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"), NavLink( "Steven W Thrasher", "/profile/steven-w-thrasher")),
      List(NavLink("Trevor Timm", "/profile/trevor-timm"), NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"), NavLink("Chelsea E Manning", "/profile/chelsea-e-manning"), columnists)
    )

    val int = NavLinkLists(
      List(opinion, columnists, theGuardianView, cartoons)
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, tennis, cycling),
      List(formulaOne, boxing, rugbyLeague, racing, usSports, golf)
    )
    val au = NavLinkLists(
      List(sport, football, rugbyUnion, cricket, AFL, tennis),
      List(cycling, aLeague, NRL, australiaSport, sport)
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
      List(culture, tvAndRadio, music, books, games, artAndDesign),
      List(film, stage, classical, culture)
    )
    val au = NavLinkLists(
      List(culture, books, music, artAndDesign, film, games),
      List(stage, classical, culture)
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
      List(lifestyle, fashion, lifestyle, food, recipes, loveAndSex),
      List(home, health, women, family, travel, tech)
    )
    val int = NavLinkLists(
      List(lifestyle, fashion, lifestyle, food, recipes, loveAndSex),
      List(health, home, women, family, travel, tech)
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

//   TODO: should rethink how this editionalises, as we could do it in a simpler way maybe.
  case object MembershipLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/uk/supporter?INTCMP=mem_uk_web_newheader", iconName= "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/uk?INTCMP=NGW_NEWHEADER_UK_GU_SUBSCRIBE", iconName= "device")
    ))

    val au = NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/au/supporter?INTCMP=mem_au_web_newheader", iconName= "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/au?INTCMP=NGW_NEWHEADER_AU_GU_SUBSCRIBE", iconName= "device")
    ))

    val us = NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/us/supporter?INTCMP=mem_us_web_newheader", iconName= "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/us?INTCMP=NGW_NEWHEADER_US_GU_SUBSCRIBE", iconName= "device")
    ))

    val int = NavLinkLists(List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/int/supporter?INTCMP=mem_int_web_newheader", iconName= "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/int?INTCMP=NGW_NEWHEADER_INT_GU_SUBSCRIBE", iconName= "device")
    ))
  }

  object SectionLinks {

    var sectionLinks = List(

      SectionsLink("uk", News),
      SectionsLink("us", News),
      SectionsLink("au", News),
      SectionsLink("international", News),
      SectionsLink("uk-news", News),
      SectionsLink("world", News),
      SectionsLink("politics", News),
      SectionsLink("environment", News),
      SectionsLink("business", News),
      SectionsLink("technology", News),
      SectionsLink("science", News),
      SectionsLink("money", News),
      SectionsLink("australia-news", News),
      SectionsLink("media", News),
      SectionsLink("us-news", News),
      SectionsLink("cities", News),
      SectionsLink("global-development", News),
      SectionsLink("sustainable-business", News),
      SectionsLink("law", News),

      SectionsLink("commentisfree", Opinion),
      SectionsLink("index", Opinion),

      SectionsLink("sport", Sport),
      SectionsLink("football", Sport),

      SectionsLink("culture", Arts),
      SectionsLink("film", Arts),
      SectionsLink("tv-and-radio", Arts),
      SectionsLink("music", Arts),
      SectionsLink("books", Arts),
      SectionsLink("artanddesign", Arts),
      SectionsLink("stage", Arts),

      SectionsLink("lifeandstyle", Life),
      SectionsLink("fashion", Life),
      SectionsLink("travel", Life),
      SectionsLink("society", Life)
    )

    def getSectionLinks(sectionName: String, edition: Edition) = {
      val sectionList = sectionLinks.filter { item =>
        item.pageId == sectionName
      }

      if (sectionList.isEmpty) {
        News.getPopularEditionalisedNavLinks(edition).drop(1)
      } else {
        val section = sectionList.head
        val parentSections = section.parentSection.getPopularEditionalisedNavLinks(edition).drop(1)

        val (a, b) = parentSections.partition(_.uniqueSection != section.pageId)

        b ++ a
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
      SectionsLink("business", businessSubNav),
      SectionsLink("environment", environmentSubNav),
      SectionsLink("travel", travelSubNav)
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

