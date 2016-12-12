package common

import conf.Configuration

case class NavLink(title: String, url: String, iconName: String = "", uniqueSection: String = "")
case class TertiaryLink(frontId: String, title: String, url: String)
case class SectionsLink(pageId: String, parentSection: NewNavigation.EditionalisedNavigationSection)

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
  var auPolitics = NavLink("australian politics", "/australia-news/australian-politics")
  var auImmigration = NavLink("immigration", "/australia-news/australian-immigration-and-asylum")
  var indigenousAustralia = NavLink("indigenous australia", "/australia-news/indigenous-australians")
  var usElections = NavLink("US election", "/us-news/us-elections-2016")
  var usNews = NavLink("US news", "/us-news", uniqueSection = "us-news")
  var usPolitics = NavLink("US politics", "/us-news/us-politics")

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

    def uk: List[NavLink]
    def us: List[NavLink]
    def au: List[NavLink]
    def int: List[NavLink]

    def getEditionalisedNavLinks(edition: Edition) = edition match {
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

    val uk = List(headlines, ukNews, world, politics, environment, business, tech, science, money)
    val au = List(headlines, australiaNews, world, auPolitics, environment, economy, auImmigration, indigenousAustralia, media, tech)
    val us = List(headlines, usElections, usNews, world, environment, business, usPolitics, tech, science, money)
    val int = List(headlines, world, ukNews, environment, business, tech, science, cities, globalDevelopment)
  }

  case object Opinion extends EditionalisedNavigationSection {
    val name = "opinion"

    val uk = List(
      opinion,
      NavLink("Polly Toynbee", "/profile/pollytoynbee"),
      NavLink("Owen Jones", "/profile/owen-jones"),
      NavLink("Marina Hyde", "/profile/marinahyde"),
      NavLink("George Monbiot", "/profile/georgemonbiot"),
      NavLink("Gary Younge", "/profile/garyyounge"),
      NavLink("Nick Cohen", "/profile/nickcohen"),
      columnists,
      theGuardianView,
      cartoons
    )

    val au = List(
      opinion,
      NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"),
      NavLink("Katharine Murphy", "/profile/katharine-murphy"),
      NavLink("Kristina Keneally", "/profile/kristina-keneally"),
      NavLink("Richard Ackland", "/profile/richard-ackland"),
      NavLink("Van Badham", "/profile/van-badham"),
      NavLink("Lenore Taylor", "/profile/lenore-taylor"),
      NavLink("Jason Wilson", "/profile/wilson-jason"),
      NavLink("Brigid Delaney", "/profile/brigiddelaney"),
      columnists
    )

    val us = List(
      opinion,
      NavLink("Jill Abramson", "/profile/jill-abramson"),
      NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
      NavLink( "Steven W Thrasher", "/profile/steven-w-thrasher"),
      NavLink("Trevor Timm", "/profile/trevor-timm"),
      NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"),
      NavLink("Chelsea E Manning", "/profile/chelsea-e-manning"),
      columnists
    )

    val int = List(opinion, columnists, theGuardianView, cartoons)
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = List(sport, football, cricket, rugbyUnion, formulaOne, tennis, golf, cycling, boxing, racing , rugbyLeague, usSports)
    val au = List(sport, football, australiaSport, AFL, NRL, aLeague, cricket, rugbyUnion, tennis, cycling)
    val us = List(sport, soccer, NFL, MLS, MLB, NBA, NHL, tennis)
    val int = List(sport, football, cricket, rugbyUnion, formulaOne, tennis, golf, cycling, boxing, usSports)
  }

  case object Arts extends EditionalisedNavigationSection {
    val name = "arts"

    val uk = List(culture, film, tvAndRadio, music, games, books, artAndDesign, stage, classical)
    val au = List(culture, film, music, classical, books, stage, artAndDesign, games)
    val us = List(culture, film, tvAndRadio, music, artAndDesign, books, stage, classical, games)
    val int = uk
  }

  case object Life extends EditionalisedNavigationSection {
    val name = "life"

    val uk = List(lifestyle, fashion, food, travel, loveAndSex, family, home, health, women, tech)
    val au = List(lifestyle, food, family, loveAndSex, health, home, women, travel, fashion)
    val us = uk
    val int = uk
  }

  case object NavFooterLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
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
    )

    val au = List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("masterclasses", "/guardian-masterclasses-australia"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    )

    val us = List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_US_GU_JOBS"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    )

    val int = List(
      NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android"),
      NavLink("dating", "https://soulmates.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_SOULMATES"),
      NavLink("jobs", "https://jobs.theguardian.com/?INTCMP=NGW_TOPNAV_UK_GU_JOBS"),
      NavLink("masterclasses", "/guardian-masterclasses?INTCMP=NGW_TOPNAV_UK_GU_MASTERCLASSES"),
      NavLink("today's paper", "/theguardian"),
      NavLink("the observer", "/observer"),
      NavLink("crosswords", "/crosswords"),
      NavLink("video", "/video")
    )
  }

  case object MembershipLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/uk/supporter?INTCMP=mem_uk_web_newheader", "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/uk?INTCMP=NGW_NEWHEADER_UK_GU_SUBSCRIBE", "device")
    )

    val au = List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/au/supporter?INTCMP=mem_au_web_newheader", "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/au?INTCMP=NGW_NEWHEADER_AU_GU_SUBSCRIBE", "device")
    )

    val us = List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/us/supporter?INTCMP=mem_us_web_newheader", "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/us?INTCMP=NGW_NEWHEADER_US_GU_SUBSCRIBE", "device")
    )

    val int = List(
      NavLink("become a supporter", s"${Configuration.id.membershipUrl}/int/supporter?INTCMP=mem_int_web_newheader", "marque-36"),
      NavLink("subscribe", s"${Configuration.id.digitalPackUrl}/int?INTCMP=NGW_NEWHEADER_INT_GU_SUBSCRIBE", "device")
    )
  }

  object TertiaryNav {

    val tertiaryLinks = List(

      TertiaryLink("uk-news", "education", "/education"),
      TertiaryLink("uk-news", "media", "/media"),
      TertiaryLink("uk-news", "society", "/society"),
      TertiaryLink("uk-news", "law", "/law"),
      TertiaryLink("uk-news", "scotland", "/uk/scotland"),
      TertiaryLink("uk-news", "wales", "/uk/wales"),
      TertiaryLink("uk-news", "northern ireland", "/uk/northernireland"),

      TertiaryLink("world", "europe", "/world/europe-news"),
      TertiaryLink("world", "US", "/us-news"),
      TertiaryLink("world", "americas", "/world/americas"),
      TertiaryLink("world", "asia", "/world/asia"),
      TertiaryLink("world", "australia", "/world/australia-news"),
      TertiaryLink("world", "africa", "/world/africa"),
      TertiaryLink("world", "middle east", "/world/middleeast"),
      TertiaryLink("world", "cities", "/world/cities"),
      TertiaryLink("world", "development", "/global-development"),

      TertiaryLink("uk/business", "economics", "/business/economics"),
      TertiaryLink("uk/business", "banking", "/business/banking"),
      TertiaryLink("uk/business", "retail", "/business/retail"),
      TertiaryLink("uk/business", "markets", "/business/stock-markets"),
      TertiaryLink("uk/business", "eurozone", "/business/eurozone"),

      TertiaryLink("us/business", "economics", "/business/economics"),
      TertiaryLink("us/business", "sustainable business", "/us/sustainable-business"),
      TertiaryLink("us/business", "diversity & equality in business", "/business/diversity-and-equality"),
      TertiaryLink("us/business", "small business", "business/us-small-business"),

      TertiaryLink("au/business", "markets", "/business/stock-markets"),
      TertiaryLink("au/business", "money", "/au/money"),

      TertiaryLink("uk/environment", "climate change", "/environment/climate-change"),
      TertiaryLink("uk/environment", "wildlife", "/environment/wildlife"),
      TertiaryLink("uk/environment", "energy", "/environment/energy"),
      TertiaryLink("uk/environment", "pollution", "/environment/pollution"),

      TertiaryLink("us/environment", "climate change", "/environment/climate-change"),
      TertiaryLink("us/environment", "wildlife", "/environment/wildlife"),
      TertiaryLink("us/environment", "energy", "/environment/energy"),
      TertiaryLink("us/environment", "pollution", "/environment/pollution"),

      TertiaryLink("au/environment", "cities", "/cities"),
      TertiaryLink("au/environment", "development", "/global-development"),
      TertiaryLink("au/environment", "sustainable business", "/au/sustainable-business"),

      TertiaryLink("uk/money", "property", "/money/property"),
      TertiaryLink("uk/money", "pensions", "/money/pensions"),
      TertiaryLink("uk/money", "savings", "/money/savings"),
      TertiaryLink("uk/money", "borrowing", "/money/debt"),
      TertiaryLink("uk/money", "careers", "/money/work-and-careers"),

      TertiaryLink("football", "live scores", "/football/live"),
      TertiaryLink("football", "tables", "/football/tables"),
      TertiaryLink("football", "competitions", "/football/competitions"),
      TertiaryLink("football", "results", "/football/results"),
      TertiaryLink("football", "fixtures", "/football/fixtures"),
      TertiaryLink("football", "clubs", "/football/teams"),

      TertiaryLink("uk/travel", "UK", "/travel/uk"),
      TertiaryLink("uk/travel", "europe", "/travel/europe"),
      TertiaryLink("uk/travel", "US", "/travel/usa"),
      TertiaryLink("uk/travel", "skiing", "/travel/skiing"),

      TertiaryLink("us/travel", "USA", "/travel/usa"),
      TertiaryLink("us/travel", "europe", "/travel/europe"),
      TertiaryLink("us/travel", "UK", "/travel/uk"),
      TertiaryLink("us/travel", "skiing", "/travel/skiing"),

      TertiaryLink("au/travel", "australasia", "/travel/usa"),
      TertiaryLink("au/travel", "asia", "/travel/europe"),
      TertiaryLink("au/travel", "UK", "/travel/uk"),
      TertiaryLink("au/travel", "europe", "/travel/europe"),
      TertiaryLink("au/travel", "US", "/travel/usa"),
      TertiaryLink("au/travel", "skiing", "/travel/skiing"),

      TertiaryLink("todayspaper", "editorials & letters", "/theguardian/mainsection/editorialsandreply"),
      TertiaryLink("todayspaper", "obituaries", "/tone/obituaries"),
      TertiaryLink("todayspaper", "g2", "/theguardian/g2"),
      TertiaryLink("todayspaper", "weekend", "/theguardian/weekend"),
      TertiaryLink("todayspaper", "the guide", "/theguardian/theguide"),
      TertiaryLink("todayspaper", "saturday review", "/theguardian/guardianreview"),

      TertiaryLink("theobserver", "comment", "/theobserver/news/comment"),
      TertiaryLink("theobserver", "the new review", "/theobserver/new-review"),
      TertiaryLink("theobserver", "observer magazine", "/theobserver/magazine"),

      TertiaryLink("crosswords", "blog", "/crosswords/crossword-blog"),
      TertiaryLink("crosswords", "editor", "/crosswords/series/crossword-editor-update"),
      TertiaryLink("crosswords", "quick", "/crosswords/series/quick"),
      TertiaryLink("crosswords", "cryptic", "/crosswords/series/cryptic"),
      TertiaryLink("crosswords", "prize", "/crosswords/series/prize"),
      TertiaryLink("crosswords", "quiptic", "/crosswords/series/quiptic"),
      TertiaryLink("crosswords", "genius", "/crosswords/series/genius"),
      TertiaryLink("crosswords", "speedy", "/crosswords/series/speedy"),
      TertiaryLink("crosswords", "everyman", "/crosswords/series/everyman"),
      TertiaryLink("crosswords", "azed", "/crosswords/series/azed")
    )

    def getTertiaryNavLinks(frontId: String): List[TertiaryLink] = {
      tertiaryLinks.filter { item =>
        item.frontId == frontId
      }
    }
  }

  object SectionLinks {

    var sectionLinks = List(

      SectionsLink("uk", News),
      SectionsLink("us", News),
      SectionsLink("au", News),
      SectionsLink("international", News),
      SectionsLink("uk-news", News),
      SectionsLink("world", News),
      SectionsLink("politics",  News),
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
      SectionsLink("tv-and-radio",  Arts),
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
        ("News", News.getEditionalisedNavLinks(edition).drop(1))
      } else {
        val section = sectionList.head
        val parentSections = section.parentSection.getEditionalisedNavLinks(edition).drop(1)

        val (a, b) = parentSections.partition(_.uniqueSection != section.pageId)

        (section.parentSection.name, b ++ a)
      }
    }
  }
}
