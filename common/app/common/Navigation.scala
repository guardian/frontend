package common

import model.{Section, Tag, MetaData}

case class SectionLink(zone: String, title: String, href: String,newWindow: Boolean = false) {
  def currentFor(page: MetaData): Boolean = page.url == href ||
    s"/${page.section}" == href ||
    page.tags.exists(t => s"/${t.id}" == href)
}

case class Zone(name: SectionLink, sections: Seq[SectionLink])

case class NavItem(name: SectionLink, links: Seq[SectionLink] = Nil, current: Boolean = false) {
  def currentFor(page: MetaData): Boolean = name.currentFor(page) ||
    links.exists(_.currentFor(page)) || exactFor(page)

  def exactFor(page: MetaData): Boolean = page.section == name.href.dropWhile(_ == '/')
}

trait Navigation  {

  //News
  val home = SectionLink("news", "Home", "/")
  val news  = SectionLink("news", "News", "/")
  val world = SectionLink("world", "World", "/world")
  val uk    = SectionLink("uk", "UK", "/uk-news")
  val us    = SectionLink("us", "US", "/world/usa")
  val politics = SectionLink("politics", "Politics", "/politics")
  val technology = SectionLink("technology", "Tech", "/technology")
  val environment = SectionLink("environment", "Environment", "/environment")
  val media = SectionLink("media", "Media", "/media")
  val education = SectionLink("education", "Education", "/education")
  val students = SectionLink("education", "Students", "/education")
  val society = SectionLink("society", "Society", "/society")
  val development = SectionLink("globaldevelopment", "Global development", "/global-development")
  val science = SectionLink("science", "Science", "/science")
  val law = SectionLink("law", "Law", "/law")
  val blogs = SectionLink("blogs", "Blogs", "/tone/blog")
  val inpictures = SectionLink("inpictures", "Galleries", "/inpictures")
  val europeNews = SectionLink("world", "Europe", "/world/europe-news")
  val americas = SectionLink("world", "Americas", "/world/americas")
  val australia = SectionLink("world", "Australia", "/world/australia")
  val asia = SectionLink("world", "Asia", "/world/asia")
  val africa = SectionLink("world", "Africa", "/world/africa")
  val middleEast = SectionLink("world", "Middle East", "/world/middleeast")

  val health = SectionLink("society", "Health", "/society/health")

  //Sport
  val sport = SectionLink("sport", "Sport", "/sport")
  val sports = sport.copy(title = "Sports")
  val usSport = SectionLink("sport", "US sports", "/sport/us-sport")

  val football = SectionLink("football", "Football", "/football")
  val cricket = SectionLink("sport", "Cricket", "/sport/cricket")
  val sportblog = SectionLink("sport", "Sport blog", "/sport/blog")
  val cycling = SectionLink("sport", "Cycling", "/sport/cycling")
  val rugbyunion = SectionLink("sport", "Rugby Union", "/sport/rugby-union")
  val rugbyLeague = SectionLink("sport", "Rugby League", "/sport/rugbyleague")
  val motorsport = SectionLink("sport", "Motor sport", "/sport/motorsports")
  val tennis = SectionLink("sport", "Tennis", "/sport/tennis")
  val golf = SectionLink("sport", "Golf", "/sport/golf")
  val horseracing = SectionLink("sport", "Horse racing", "/sport/horse-racing")
  val boxing = SectionLink("sport", "Boxing", "/sport/boxing")
  val formulaOne = SectionLink("sport", "Formula One", "/sport/formula-one-2014")

  val nfl = SectionLink("sport", "NFL", "/sport/nfl")
  val mlb = SectionLink("sport", "MLB", "/sport/mlb")
  val nba = SectionLink("sport", "NBA", "/sport/nba")
  val mls = SectionLink("football", "MLS", "/football/mls")
  val nhl = SectionLink("sport", "NHL", "/sport/nhl")

  //Cif
  val cif = SectionLink("commentisfree", "Comment", "/commentisfree")
  val cifbelief = SectionLink("commentisfree", "Cif belief", "/commentisfree/belief")
  val cifgreen = SectionLink("commentisfree", "Cif green", "/commentisfree/cif-green")

  //Culture
  val culture = SectionLink("culture", "Culture", "/culture")
  val artanddesign = SectionLink("culture", "Art & design", "/artanddesign")
  val books = SectionLink("culture", "Books", "/books")
  val film = SectionLink("culture", "Film", "/film")
  val music = SectionLink("culture", "Music", "/music")
  val stage = SectionLink("culture", "Stage", "/stage")
  val televisionAndRadio = SectionLink("culture", "TV & radio", "/tv-and-radio")

  //Technology
  val technologyblog = SectionLink("technology", "Technology blog", "/technology/blog")
  val games = SectionLink("technology", "Games", "/technology/games")
  val gamesblog = SectionLink("technology", "Games blog", "/technology/gamesblog")
  val appsblog = SectionLink("technology", "Apps blog", "/technology/appsblog")
  val askjack = SectionLink("technology", "Ask Jack", "/technology/askjack")
  val internet = SectionLink("technology", "Internet", "/technology/internet")
  val mobilephones = SectionLink("technology", "Mobile phones", "/technology/mobilephones")
  val gadgets = SectionLink("technology", "Gadgets", "/technology/gadgets")

  //Business
  val economy =  SectionLink("business", "Economy", "/business")
  val companies =  SectionLink("business", "Companies", "/business/companies")
  val economics = SectionLink("business", "Economics", "/business/economics")
  val markets = SectionLink("business", "Markets", "/business/stock-markets")
  val useconomy = SectionLink("business", "US economy", "/business/useconomy")
  val recession = SectionLink("business", "Recession", "/business/recession")
  val  investing = SectionLink("business", "Investing", "/business/investing")
  val banking = SectionLink("business", "Banking", "/business/banking")
  val marketforceslive = SectionLink("business", "Market forces live", "/business/marketforceslive")
  val businessblog = SectionLink("business", "Business blog", "/business/blog")

  //Money
  val money = SectionLink("money", "Money", "/money")
  val property = SectionLink("money", "Property", "/money/property")
  val houseprices = SectionLink("money", "House prices", "/money/houseprices")
  val pensions = SectionLink("money", "Pensions", "/money/pensions")
  val savings = SectionLink("money", "Savings", "/money/savings")
  val borrowing = SectionLink("money", "Borrowing", "/money/debt")
  val insurance = SectionLink("money", "Insurance", "/money/insurance")
  val careers = SectionLink("money", "Careers", "/money/work-and-careers")
  val consumeraffairs = SectionLink("money", "Consumer affairs", "/money/consumer-affairs")

  //Life and style
  val lifeandstyle = SectionLink("lifeandstyle", "Life", "/lifeandstyle")
  val fashion = SectionLink("lifeandstyle", "Fashion", "/fashion")
  val foodanddrink = SectionLink("lifeandstyle", "Food", "/lifeandstyle/food-and-drink")
  val family = SectionLink("lifeandstyle", "Family", "/lifeandstyle/family")
  val lostinshowbiz = SectionLink("lifeandstyle", "Lost in Showbiz", "/lifeandstyle/lostinshowbiz")
  val women = SectionLink("lifeandstyle", "Women", "/lifeandstyle/women")
  val relationships = SectionLink("lifeandstyle", "Relationships", "/lifeandstyle/relationships")
  val healthandwellbeing = SectionLink("lifeandstyle", "Health and wellbeing", "/lifeandstyle/health-and-wellbeing")
  val loveAndSex = SectionLink("lifeandstyle", "Love & Sex", "/lifeandstyle/love-and-sex")
  val homeAndGarden = SectionLink("lifeandstyle", "Home & Garden", "/lifeandstyle/home-and-garden")

  //Travel
  val travel = SectionLink("travel", "Travel", "/travel")
  val shortbreaks = SectionLink("travel", "Short breaks", "/travel/short-breaks")
  val uktravel = SectionLink("travel", "UK", "/travel/uk")
  val europetravel = SectionLink("travel", "Europe", "/travel/europe")
  val usTravel = SectionLink("travel", "US", "/travel/usa")
  val hotels = SectionLink("travel", "Hotels", "/travel/hotels")
  val resturants = SectionLink("travel", "Restaurants", "/travel/restaurants")
  val budget = SectionLink("travel", "Budget travel", "/travel/budget")

  //Environment
  val climatechange = SectionLink("environment", "Climate change", "/environment/climate-change")
  val wildlife = SectionLink("environment", "Wildlife", "/environment/wildlife")
  val energy = SectionLink("environment", "Energy", "/environment/energy")
  val conservation = SectionLink("environment", "Conservation", "/environment/conservation")
  val food = SectionLink("environment", "Food", "/environment/food")
  val cities = SectionLink("environment", "Cities", "/cities")
  val globalDevelopment = SectionLink("environment", "Development", "/cities")

  def footballNav(metaData: MetaData) = NavItem(football, Seq(
    SectionLink("football", "Live scores", "/football/live"),
    SectionLink("football", "Tables", "/football/tables"),
    SectionLink("football", "Competitions", "/football/competitions"),
    SectionLink("football", "Results", "/football/results"),
    SectionLink("football", "Fixtures", "/football/fixtures"),
    SectionLink("football", "Clubs", "/football/teams")
  ))
}

// helper for the views
object Navigation {
  
  def topLevelItem(navigation: Seq[NavItem], page: MetaData): Option[NavItem] = navigation.find(_.exactFor(page))
    .orElse(navigation.find(_.currentFor(page)))


  def localNav(navigation: Seq[NavItem], page: MetaData): Option[Seq[SectionLink]] = topLevelItem(navigation, page)
    .map(_.links).filter(_.nonEmpty)

  def sectionOverride(page: MetaData, localNav: NavItem, currentSublink: Option[SectionLink]): String = page match {
    case p: Tag => currentSublink.map(_.title).getOrElse(localNav.name.title)
    case p: Section => currentSublink.map(_.title).getOrElse(localNav.name.title)
    case _ => localNav.name.title
  }
}

trait Zones extends Navigation {


  val newsZone = Zone(news,
    Seq(world, uk, us, politics, technology, environment, media, education, society, development,
      science, law, blogs, inpictures)
  )

  val sportZone = Zone(sport,
    Seq(football, cricket, sportblog, rugbyunion, motorsport, tennis, golf, rugbyLeague, horseracing)
  )

  val sportsZone = Zone(sports,
    Seq(football, cricket, sportblog, rugbyunion, motorsport, tennis, golf, rugbyLeague, horseracing)
  )

  val cifZone = Zone(cif,
    Seq(cifbelief, cifgreen)
  )

  val cultureZone = Zone(culture,
    Seq(artanddesign, books, film, music, stage, televisionAndRadio)
  )

  val technologyZone = Zone(technology,
    Seq(technologyblog, games, gamesblog, appsblog, askjack, internet, mobilephones, gadgets )
  )

  val businessZone = Zone(economy,
    Seq(economics, useconomy, recession, investing, banking, marketforceslive, businessblog )
  )

  val moneyZone = Zone(money,
    Seq(property, houseprices, pensions, savings, borrowing, insurance, careers, consumeraffairs)
  )

  val lifeandstyleZone = Zone(lifeandstyle,
    Seq(fashion, foodanddrink, family, lostinshowbiz)
  )

  val travelZone = Zone(travel,
    Seq(shortbreaks, hotels, resturants, budget)
  )
}