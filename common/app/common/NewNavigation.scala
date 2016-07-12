package common

sealed class TopLevelSection(val name: String)

object TopLevelSection {
  case object News extends TopLevelSection("news")
  case object Opinion extends TopLevelSection("opinion")
  case object Sports extends TopLevelSection("sports")
  case object Arts extends TopLevelSection("arts")
  case object Life extends TopLevelSection("life")
}

case class NavLink(name: String, url: String)

object NewNavigation {
  val topLevelSections = List(TopLevelSection.News, TopLevelSection.Opinion, TopLevelSection.Sports, TopLevelSection.Arts, TopLevelSection.Life)

  private val newsSections = List(
    NavLink("UK", "/uk-news"),
    NavLink("US", "/us-news"),
    NavLink("europe", "/world/europe-news"),
    NavLink("world", "/world"),
    NavLink("politics", "/politics"),
    NavLink("business", "/business"),
    NavLink("environment", "/environment"),
    NavLink("science", "/science"),
    NavLink("money", "/money"),
    NavLink("tech", "/technology")
  )

  private val opinionSections = List(
    NavLink("columnists", "/index/contributors"),
    NavLink("Polly Toynbee", "/profile/pollytoynbee"),
    NavLink("Owen Jones", "/profile/owen-jones"),
    NavLink("Charlie Brooker", "/profile/charliebrooker"),
    NavLink("Mark Kermode", "/profile/markkermode"),
    NavLink("Felicity Cloake", "/profile/felicity-cloake"),
    NavLink("Yotam Ottolenghi", "/profile/yotamottolenghi")
  )

  private val sportsSections = List(
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

  private val artsSections = List(
    NavLink("film", "/film"),
    NavLink("music", "/music"),
    NavLink("books", "/books"),
    NavLink("classical", "/music/classicalmusicandopera"),
    NavLink("tv & radio", "/tv-and-radio"),
    NavLink("games", "/technology/games"),
    NavLink("art & design", "/artanddesign"),
    NavLink("fashion", "/fashion"),
    NavLink("stage", "/stage")
  )

  private val lifeSections = List(
    NavLink("food", "/lifeandstyle/food-and-drink"),
    NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing"),
    NavLink("travel", "/travel"),
    NavLink("love & sex", "/lifeandstyle/love-and-sex"),
    NavLink("family", "/lifeandstyle/family"),
    NavLink("women", "/lifeandstyle/women"),
    NavLink("home & garden", "/lifeandstyle/home-and-garden"),
    NavLink("tech", "/technology")
  )

  val sectionItems: Map[TopLevelSection, List[NavLink]] = Map(
    TopLevelSection.News -> newsSections,
    TopLevelSection.Opinion -> opinionSections,
    TopLevelSection.Sports -> sportsSections,
    TopLevelSection.Arts -> artsSections,
    TopLevelSection.Life -> lifeSections
  )
}
