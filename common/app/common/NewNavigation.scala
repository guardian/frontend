package common

import conf.Configuration
import model.Page
import play.api.mvc.RequestHeader

case class NavLink(name: String, url: String, iconName: String = "")
case class TertiaryLink(frontId: String, name: String, url: String)

object NewNavigation {
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

  def getSubSectionOrSectionLink(navigation: Seq[NavItem], page: Page)(implicit request: RequestHeader): Option[SectionLink] = {

    val topLevelLink = Navigation.topLevelItem(navigation, page)

    if (topLevelLink.isDefined) {
      val subLink = topLevelLink.get.searchForCurrentSublink(page)

      Some(subLink.getOrElse(topLevelLink.get.name))
    } else {
      None
    }
  }

  case object PrimaryLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
      NavLink("news", "/uk-news"),
      NavLink("opinion", "/uk/commentisfree"),
      NavLink("sport", "/uk/sport"),
      NavLink("arts", "/uk/culture"),
      NavLink("life", "/uk/lifeandstyle")
    )

    val au = List(
      NavLink("news", "/australia-news"),
      NavLink("opinion", "/au/commentisfree"),
      NavLink("sport", "/au/sport"),
      NavLink("arts", "/au/culture"),
      NavLink("life", "/au/lifeandstyle")
    )

    val us = List(
      NavLink("news", "/us-news"),
      NavLink("opinion", "/us/commentisfree"),
      NavLink("sport", "/us/sport"),
      NavLink("arts", "/us/culture"),
      NavLink("life", "/us/lifeandstyle")
    )

    val int = List(
      NavLink("news", "/world"),
      NavLink("opinion", "/uk/commentisfree"),
      NavLink("sport", "/uk/sport"),
      NavLink("arts", "/uk/culture"),
      NavLink("life", "/uk/lifeandstyle")
    )
  }

  case object News extends EditionalisedNavigationSection {
    val name = "news"

    val uk = List(
      NavLink("headlines", "/uk", "home"),
      NavLink("UK news", "/uk-news"),
      NavLink("world news", "/world"),
      NavLink("environment", "/uk/environment"),
      NavLink("business", "/uk/business"),
      NavLink("tech", "/uk/technology"),
      NavLink("science", "/science"),
      NavLink("money", "/uk/money")
    )

    val au = List(
      NavLink("headlines", "/au", "home"),
      NavLink("australia news", "/australia-news"),
      NavLink("world news", "/world"),
      NavLink("australian politics", "/australia-news/australian-politics"),
      NavLink("environment", "/au/environment"),
      NavLink("economy", "/au/business"),
      NavLink("immigration", "/australia-news/australian-immigration-and-asylum"),
      NavLink("indigenous australia", "/australia-news/indigenous-australians"),
      NavLink("media", "/au/media"),
      NavLink("tech", "/au/technology")
    )

    val us = List(
      NavLink("headlines", "/us", "home"),
      NavLink("US election", "/us-news/us-elections-2016"),
      NavLink("US news", "/us-news"),
      NavLink("world", "/world"),
      NavLink("environment", "/us/environment"),
      NavLink("business", "/us/business"),
      NavLink("US politics", "/us-news/us-politics"),
      NavLink("tech", "/us/technology"),
      NavLink("science", "/science"),
      NavLink("money", "/us/money")
    )

    val int =  List(
      NavLink("headlines", "/international", "home"),
      NavLink("world news", "/world"),
      NavLink("UK news", "/uk-news"),
      NavLink("environment", "/uk/environment"),
      NavLink("business", "/uk/business"),
      NavLink("tech", "/uk/technology"),
      NavLink("science", "/science"),
      NavLink("cities", "/cities"),
      NavLink("development", "/global-development")
    )
  }

  case object Opinion extends EditionalisedNavigationSection {
    val name = "opinion"

    val uk = List(
      NavLink("opinion home", "/uk/commentisfree", "home"),
      NavLink("Polly Toynbee", "/profile/pollytoynbee"),
      NavLink("Owen Jones", "/profile/owen-jones"),
      NavLink("Marina Hyde", "/profile/marinahyde"),
      NavLink("George Monbiot", "/profile/georgemonbiot"),
      NavLink("Gary Younge", "/profile/garyyounge"),
      NavLink("Nick Cohen", "/profile/nickcohen"),
      NavLink("more columnists", "/index/contributors"),
      NavLink("the guardian view", "/profile/editorial"),
      NavLink("our cartoonists", "/cartoons/archive")
    )

    val au = List(
      NavLink("opinion home", "/au/commentisfree", "home"),
      NavLink("first dog on the moon", "/profile/first-dog-on-the-moon"),
      NavLink("Katharine Murphy", "/profile/katharine-murphy"),
      NavLink("Kristina Keneally", "/profile/kristina-keneally"),
      NavLink("Richard Ackland", "/profile/richard-ackland"),
      NavLink("Van Badham", "/profile/van-badham"),
      NavLink("Lenore Taylor", "/profile/lenore-taylor"),
      NavLink("Jason Wilson", "/profile/wilson-jason"),
      NavLink("Brigid Delaney", "/profile/brigiddelaney"),
      NavLink("more columnists", "/index/contributors")
    )

    val us = List(
      NavLink("opinion home", "/us/commentisfree", "home"),
      NavLink("Jill Abramson", "/profile/jill-abramson"),
      NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
      NavLink("Steven W Thrasher", "/profile/steven-w-thrasher"),
      NavLink("Trevor Timm", "/profile/trevor-timm"),
      NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"),
      NavLink("Chelsea E Manning", "/profile/chelsea-e-manning"),
      NavLink("more columnists", "/index/contributors")
    )

    val int =  List(
      NavLink("opinion home", "/uk/commentisfree", "home"),
      NavLink("columnists", "/index/contributors"),
      NavLink("the guardian view", "/profile/editorial"),
      NavLink("cartoons", "/cartoons/archive")
    )
  }

  case object Sport extends EditionalisedNavigationSection {
    val name = "sport"

    val uk = List(
      NavLink("sport home", "/uk/sport", "home"),
      NavLink("football", "/football"),
      NavLink("cricket", "/sport/cricket"),
      NavLink("rugby union", "/sport/rugby-union"),
      NavLink("F1", "/sport/formulaone"),
      NavLink("tennis", "/sport/tennis"),
      NavLink("golf", "/sport/golf"),
      NavLink("cycling", "/sport/cycling"),
      NavLink("boxing", "/sport/boxing"),
      NavLink("racing", "/sport/horse-racing"),
      NavLink("rugby league", "/sport/rugbyleague"),
      NavLink("US sports", "/sport/us-sport")
    )

    val au = List(
      NavLink("sport home", "/au/sport", "home"),
      NavLink("football", "/football"),
      NavLink("australia sport", "/au/sport"),
      NavLink("AFL", "/sport/afl"),
      NavLink("NRL", "/sport/nrl"),
      NavLink("a-league", "/football/a-league"),
      NavLink("cricket", "/sport/cricket"),
      NavLink("rugby union", "/sport/rugby-union"),
      NavLink("tennis", "/sport/tennis"),
      NavLink("cycling", "/sport/cycling")
    )

    val us = List(
      NavLink("sport home", "/us/sport", "home"),
      NavLink("soccer", "/football"),
      NavLink("NFL", "/sport/nfl"),
      NavLink("MLS", "/sport/mls"),
      NavLink("MLB", "/sport/mlb"),
      NavLink("NBA", "/sport/nba"),
      NavLink("NHL", "/sport/nhl"),
      NavLink("tennis", "/sport/tennis")
    )

    val int =  List(
      NavLink("sport home", "/uk/sport", "home"),
      NavLink("football", "/football"),
      NavLink("cricket", "/sport/cricket"),
      NavLink("rugby union", "/sport/rugby-union"),
      NavLink("F1", "/sport/formulaone"),
      NavLink("tennis", "/sport/tennis"),
      NavLink("golf", "/sport/golf"),
      NavLink("cycling", "/sport/cycling"),
      NavLink("boxing", "/sport/boxing"),
      NavLink("US sports", "/sport/us-sport")
    )
  }

  case object Arts extends EditionalisedNavigationSection {
    val name = "arts"

    val uk = List(
      NavLink("culture home", "/uk/culture", "home"),
      NavLink("film", "/uk/film"),
      NavLink("tv & radio", "/tv-and-radio"),
      NavLink("music", "/music"),
      NavLink("games", "/technology/games"),
      NavLink("books", "/books"),
      NavLink("art & design", "/artanddesign"),
      NavLink("stage", "/stage"),
      NavLink("classical", "/music/classicalmusicandopera")
    )

    val au = List(
      NavLink("culture home", "/au/culture", "home"),
      NavLink("film", "/au/film"),
      NavLink("music", "/music"),
      NavLink("tv & radio", "/culture/australian-television"),
      NavLink("books", "/books"),
      NavLink("stage", "/stage"),
      NavLink("art & design", "/artanddesign"),
      NavLink("games", "/technology/games")
    )

    val us = List(
      NavLink("culture home", "/us/culture", "home"),
      NavLink("film", "/us/film"),
      NavLink("tv & radio", "/tv-and-radio"),
      NavLink("music", "/music"),
      NavLink("art & design", "/artanddesign"),
      NavLink("books", "/books"),
      NavLink("stage", "/stage"),
      NavLink("classical", "/music/classicalmusicandopera"),
      NavLink("games", "/technology/games")
    )

    val int =List(
      NavLink("culture home", "/uk/culture", "home"),
      NavLink("film", "/uk/film"),
      NavLink("tv & radio", "/tv-and-radio"),
      NavLink("music", "/music"),
      NavLink("games", "/technology/games"),
      NavLink("books", "/books"),
      NavLink("art & design", "/artanddesign"),
      NavLink("stage", "/stage"),
      NavLink("classical", "/music/classicalmusicandopera")
    )
  }

  case object Life extends EditionalisedNavigationSection {
    val name = "life"

    val uk = List(
      NavLink("lifestyle home", "/uk/lifeandstyle", "home"),
      NavLink("fashion", "/fashion"),
      NavLink("food", "/lifeandstyle/food-and-drink"),
      NavLink("travel", "/uk/travel"),
      NavLink("love & sex", "/lifeandstyle/love-and-sex"),
      NavLink("family", "/lifeandstyle/family"),
      NavLink("home & garden", "/lifeandstyle/home-and-garden"),
      NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing"),
      NavLink("women", "/lifeandstyle/women"),
      NavLink("tech", "/uk/technology")
    )

    val au = List(
      NavLink("lifestyle home", "/au/lifeandstyle", "home"),
      NavLink("food", "/lifeandstyle/food-and-drink"),
      NavLink("family", "/lifeandstyle/family"),
      NavLink("love & sex", "/lifeandstyle/love-and-sex"),
      NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing"),
      NavLink("home & garden", "/lifeandstyle/home-and-garden"),
      NavLink("women", "/lifeandstyle/women"),
      NavLink("travel", "/au/travel"),
      NavLink("fashion", "/fashion")
    )

    val us = List(
      NavLink("lifestyle home", "/us/lifeandstyle", "home"),
      NavLink("fashion", "/fashion"),
      NavLink("food", "/lifeandstyle/food-and-drink"),
      NavLink("travel", "/us/travel"),
      NavLink("love & sex", "/lifeandstyle/love-and-sex"),
      NavLink("family", "/lifeandstyle/family"),
      NavLink("home & garden", "/lifeandstyle/home-and-garden"),
      NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing"),
      NavLink("women", "/lifeandstyle/women"),
      NavLink("tech", "/us/technology")
    )

    val int = List(
      NavLink("lifestyle home", "/uk/lifeandstyle", "home"),
      NavLink("fashion", "/fashion"),
      NavLink("food", "/lifeandstyle/food-and-drink"),
      NavLink("travel", "/uk/travel"),
      NavLink("love & sex", "/lifeandstyle/love-and-sex"),
      NavLink("family", "/lifeandstyle/family"),
      NavLink("home & garden", "/lifeandstyle/home-and-garden"),
      NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing"),
      NavLink("women", "/lifeandstyle/women"),
      NavLink("tech", "/uk/technology")
    )
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
      /**
       * NEWS
       */

      // uk news
      TertiaryLink("uk-news", "education", "/education"),
      TertiaryLink("uk-news", "media", "/media"),
      TertiaryLink("uk-news", "society", "/society"),
      TertiaryLink("uk-news", "law", "/law"),
      TertiaryLink("uk-news", "scotland", "/uk/scotland"),
      TertiaryLink("uk-news", "wales", "/uk/wales"),
      TertiaryLink("uk-news", "northern ireland", "/uk/northernireland"),

      // world news
      TertiaryLink("world", "europe", "/world/europe-news"),
      TertiaryLink("world", "US", "/us-news"),
      TertiaryLink("world", "americas", "/world/americas"),
      TertiaryLink("world", "asia", "/world/asia"),
      TertiaryLink("world", "australia", "/world/australia-news"),
      TertiaryLink("world", "africa", "/world/africa"),
      TertiaryLink("world", "middle east", "/world/middleeast"),
      TertiaryLink("world", "cities", "/world/cities"),
      TertiaryLink("world", "development", "/global-development"),

      // business
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

      // environment
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

      // money
      TertiaryLink("uk/money", "property", "/money/property"),
      TertiaryLink("uk/money", "pensions", "/money/pensions"),
      TertiaryLink("uk/money", "savings", "/money/savings"),
      TertiaryLink("uk/money", "borrowing", "/money/debt"),
      TertiaryLink("uk/money", "careers", "/money/work-and-careers"),

      /**
        * SPORT
        */

      // football
      TertiaryLink("football", "live scores", "/football/live"),
      TertiaryLink("football", "tables", "/football/tables"),
      TertiaryLink("football", "competitions", "/football/competitions"),
      TertiaryLink("football", "results", "/football/results"),
      TertiaryLink("football", "fixtures", "/football/fixtures"),
      TertiaryLink("football", "clubs", "/football/teams"),

      /**
        * LIFE
        */

      // travel
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

      /**
        * OTHER
        */

      // today's paper
      TertiaryLink("todayspaper", "editorials & letters", "/theguardian/mainsection/editorialsandreply"),
      TertiaryLink("todayspaper", "obituaries", "/tone/obituaries"),
      TertiaryLink("todayspaper", "g2", "/theguardian/g2"),
      TertiaryLink("todayspaper", "weekend", "/theguardian/weekend"),
      TertiaryLink("todayspaper", "the guide", "/theguardian/theguide"),
      TertiaryLink("todayspaper", "saturday review", "/theguardian/guardianreview"),

      // sunday's paper
      TertiaryLink("theobserver", "comment", "/theobserver/news/comment"),
      TertiaryLink("theobserver", "the new review", "/theobserver/new-review"),
      TertiaryLink("theobserver", "observer magazine", "/theobserver/magazine"),

      // crosswords
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
      tertiaryLinks.filter{ item =>
        item.frontId == frontId
      }
    }
  }
}
