package common

case class NavLink(name: String, url: String)

object NewNavigation {
  val topLevelSections = List(News, Opinion, Sport, Arts, Life)

  trait TopLevelSection {
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

  case object News extends TopLevelSection {
    val name = "news"

    val uk = List(
      NavLink("headlines", "/uk"),
      NavLink("UK", "/uk-news"),
      NavLink("world", "/world"),
      NavLink("environment", "/uk/environment"),
      NavLink("business", "/uk/business"),
      NavLink("tech", "/uk/technology"),
      NavLink("science", "/science"),
      NavLink("money", "/uk/money")
    )

    val au = List(
      NavLink("headlines", "/au"),
      NavLink("UK", "/australia-news"),
      NavLink("world", "/world"),
      NavLink("australian politics", "/australia-news/australian-politics"),
      NavLink("environment", "/au/environment"),
      NavLink("economy", "/au/business"),
      NavLink("immigration", "/australia-news/australian-immigration-and-asylum"),
      NavLink("indigenous australia", "/australia-news/indigenous-australians"),
      NavLink("media", "/au/media"),
      NavLink("tech", "/au/technology")
    )

    val us = List(
      NavLink("headlines", "/us"),
      NavLink("US election", "/us-news"),
      NavLink("US", "/us-news"),
      NavLink("world", "/world"),
      NavLink("environment", "/us/environment"),
      NavLink("business", "/us/business"),
      NavLink("US politics", "/us-news/us-politics"),
      NavLink("tech", "/us/technology"),
      NavLink("science", "/science"),
      NavLink("money", "/us/money")
    )

    val int =  List(
      NavLink("headlines", "/international"),
      NavLink("world", "/world"),
      NavLink("UK", "/uk-news"),
      NavLink("environment", "/uk/environment"),
      NavLink("business", "/uk/business"),
      NavLink("tech", "/uk/technology"),
      NavLink("science", "/science"),
      NavLink("cities", "/cities"),
      NavLink("development", "/global-development")
    )
  }

  case object Opinion extends TopLevelSection {
    val name = "opinion"

    val uk = List(
      NavLink("opinion home", "/uk/commentisfree"),
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
      NavLink("opinion home", "/au/commentisfree"),
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
      NavLink("opinion home", "/us/commentisfree"),
      NavLink("Jill Abramson", "/profile/jill-abramson"),
      NavLink("Jessica Valenti", "/commentisfree/series/jessica-valenti-column"),
      NavLink("Steven W Thrasher", "/profile/steven-w-thrasher"),
      NavLink("Trevor Timm", "/profile/trevor-timm"),
      NavLink("Rebecca Carroll", "/commentisfree/series/rebecca-carroll-column"),
      NavLink("Chelsea E Manning", "/profile/chelsea-e-manning"),
      NavLink("more columnists", "/index/contributors")
    )

    val int =  List(
      NavLink("opinion home", "/uk/commentisfree"),
      NavLink("columnists", "/index/contributors"),
      NavLink("the guardian view", "/profile/editorial"),
      NavLink("cartoons", "/cartoons/archive")
    )
  }

  case object Sport extends TopLevelSection {
    val name = "sport"

    val uk = List(
      NavLink("sport home", "/uk/sport"),
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
      NavLink("sport home", "/au/sport"),
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
      NavLink("sport home", "/us/sport"),
      NavLink("soccer", "/football"),
      NavLink("NFL", "/sport/nfl"),
      NavLink("MLS", "/sport/mls"),
      NavLink("MLB", "/sport/mlb"),
      NavLink("NBA", "/sport/nba"),
      NavLink("NHL", "/sport/nhl"),
      NavLink("tennis", "/sport/tennis")
    )

    val int =  List(
      NavLink("sport home", "/uk/sport"),
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

  case object Arts extends TopLevelSection {
    val name = "arts"

    val uk = List(
      NavLink("culture home", "/uk/culture"),
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
      NavLink("culture home", "/au/culture"),
      NavLink("film", "/au/film"),
      NavLink("music", "/music"),
      NavLink("tv & radio", "/culture/australian-television"),
      NavLink("books", "/books"),
      NavLink("stage", "/stage"),
      NavLink("art & design", "/artanddesign"),
      NavLink("games", "/technology/games")
    )

    val us = List(
      NavLink("culture home", "/us/culture"),
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
      NavLink("culture home", "/uk/culture"),
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

  case object Life extends TopLevelSection {
    val name = "life"

    val uk = List(
      NavLink("lifestyle home", "/uk/lifeandstyle"),
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
      NavLink("lifestyle home", "/au/lifeandstyle"),
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
      NavLink("lifestyle home", "/us/lifeandstyle"),
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
      NavLink("lifestyle home", "/uk/lifeandstyle"),
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
}
