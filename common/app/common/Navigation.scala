package common

import model.{Tag, MetaData}
import com.gu.management.IndexPage

case class SectionLink(zone: String, linkName: String, href: String, title: String, newWindow: Boolean = false) {
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
  val home = SectionLink("news", "News", "/", "Home")
  val news  = SectionLink("news", "News", "/", "News")
  val world = SectionLink("world", "World", "/world", "World")
  val uk    = SectionLink("uk", "UK", "/uk-news", "UK")
  val us    = SectionLink("us", "US", "/world/usa", "US")
  val politics = SectionLink("politics", "Politics", "/politics", "Politics")
  val technology = SectionLink("technology", "Tech", "/technology", "Tech")
  val environment = SectionLink("environment", "Environment", "/environment", "Environment")
  val media = SectionLink("media", "Media", "/media", "Media")
  val education = SectionLink("education", "Education", "/education", "Education")
  val students = SectionLink("education", "Students", "/education", "Students")
  val society = SectionLink("society", "Society", "/society", "Society")
  val development = SectionLink("globaldevelopment", "Global development", "/global-development", "Global development")
  val science = SectionLink("science", "Science", "/science", "Science")
  val law = SectionLink("law", "Law", "/law", "Law")
  val blogs = SectionLink("blogs", "Blogs", "/tone/blog", "Blogs")
  val inpictures = SectionLink("inpictures", "Galleries", "/inpictures", "In pictures")
  val europeNews = SectionLink("world", "Europe", "/world/europe-news", "Europe")
  val americas = SectionLink("world", "Americas", "/world/americas", "Americas")
  val australia = SectionLink("world", "Australia", "/world/australia", "Australia")
  val asia = SectionLink("world", "Asia", "/world/asia", "Asia")
  val africa = SectionLink("world", "Africa", "/world/africa", "Africa")
  val middleEast = SectionLink("world", "Middle East", "/world/middleeast", "Middle East")

  val health = SectionLink("society", "Health", "/society/health", "Health")

  //Sport
  val sport = SectionLink("sport", "Sport", "/sport", "Sport")
  val sports = sport.copy(title = "Sports")
  val usSport = SectionLink("sport", "US sports", "/sport/us-sport", "US sports")

  val football = SectionLink("football", "Football", "/football", "Football")
  val cricket = SectionLink("sport", "Cricket", "/sport/cricket", "Cricket")
  val sportblog = SectionLink("sport", "Sport blog", "/sport/blog", "Sport blog")
  val cycling = SectionLink("sport", "Cycling", "/sport/cycling", "Cycling")
  val rugbyunion = SectionLink("sport", "Rugby Union", "/sport/rugby-union", "Rugby Union")
  val rugbyLeague = SectionLink("sport", "Rugby League", "/sport/rugbyleague", "Rugby League")
  val motorsport = SectionLink("sport", "Motor sport", "/sport/motorsports", "Motor sport")
  val tennis = SectionLink("sport", "Tennis", "/sport/tennis", "Tennis")
  val golf = SectionLink("sport", "Golf", "/sport/golf", "Golf")
  val horseracing = SectionLink("sport", "Horse racing", "/sport/horse-racing", "Horse racing")
  val boxing = SectionLink("sport", "Boxing", "/sport/boxing", "Boxing")
  val formulaOne = SectionLink("sport", "Formula One", "/sport/formula-one-2014", "Formula One")

  val nfl = SectionLink("sport", "NFL", "/sport/nfl", "NFL")
  val mlb = SectionLink("sport", "MLB", "/sport/mlb", "MLB")
  val nba = SectionLink("sport", "NBA", "/sport/nba", "NBA")
  val mls = SectionLink("football", "MLS", "/football/mls", "MLS")
  val nhl = SectionLink("sport", "NHL", "/sport/nhl", "NHL")

  //Cif
  val cif = SectionLink("commentisfree", "Comment", "/commentisfree", "Comment")
  val cifbelief = SectionLink("commentisfree", "Cif belief", "/commentisfree/belief", "Cif belief")
  val cifgreen = SectionLink("commentisfree", "Cif green", "/commentisfree/cif-green", "Cif green")

  //Culture
  val culture = SectionLink("culture", "Culture", "/culture", "Culture")
  val artanddesign = SectionLink("culture", "Art & design", "/artanddesign", "Art & design")
  val books = SectionLink("culture", "Books", "/books", "Books")
  val film = SectionLink("culture", "Film", "/film", "Film")
  val music = SectionLink("culture", "Music", "/music", "Music")
  val stage = SectionLink("culture", "Stage", "/stage", "Stage")
  val televisionAndRadio = SectionLink("culture", "TV & radio", "/tv-and-radio", "TV & radio")

  //Technology
  val technologyblog = SectionLink("technology", "Technology blog", "/technology/blog", "Technology blog")
  val games = SectionLink("technology", "Games", "/technology/games", "Games")
  val gamesblog = SectionLink("technology", "Games blog", "/technology/gamesblog", "Games blog")
  val appsblog = SectionLink("technology", "Apps blog", "/technology/appsblog", "Apps blog")
  val askjack = SectionLink("technology", "Ask Jack", "/technology/askjack", "Ask Jack")
  val internet = SectionLink("technology", "Internet", "/technology/internet", "Internet")
  val mobilephones = SectionLink("technology", "Mobile phones", "/technology/mobilephones", "Mobile phones")
  val gadgets = SectionLink("technology", "Gadgets", "/technology/gadgets", "Gadgets")

  //Business
  val economy =  SectionLink("business", "Economy", "/business", "Economy")
  val economics = SectionLink("business", "Economics", "/business/economics", "Economics")
  val markets = SectionLink("business", "Markets", "/business/stock-markets", "Markets")
  val useconomy = SectionLink("business", "US economy", "/business/useconomy", "US economy")
  val recession = SectionLink("business", "Recession", "/business/recession", "Recession")
  val  investing = SectionLink("business", "Investing", "/business/investing", "Investing")
  val banking = SectionLink("business", "Banking", "/business/banking", "Banking")
  val marketforceslive = SectionLink("business", "Market forces live", "/business/marketforceslive", "Market forces live")
  val businessblog = SectionLink("business", "Business blog", "/business/blog", "Business blog")

  //Money
  val money = SectionLink("money", "Money", "/money", "Money")
  val property = SectionLink("money", "Property", "/money/property", "Property")
  val houseprices = SectionLink("money", "House prices", "/money/houseprices", "House prices")
  val pensions = SectionLink("money", "Pensions", "/money/pensions", "Pensions")
  val savings = SectionLink("money", "Savings", "/money/savings", "Savings")
  val borrowing = SectionLink("money", "Borrowing", "/money/debt", "Borrowing")
  val insurance = SectionLink("money", "Insurance", "/money/insurance", "Insurance")
  val careers = SectionLink("money", "Careers", "/money/work-and-careers", "Careers")
  val consumeraffairs = SectionLink("money", "Consumer affairs", "/money/consumer-affairs", "Consumer affairs")

  //Life and style
  val lifeandstyle = SectionLink("lifeandstyle", "Life", "/lifeandstyle", "Life")
  val fashion = SectionLink("lifeandstyle", "Fashion", "/fashion", "Fashion")
  val foodanddrink = SectionLink("lifeandstyle", "Food", "/lifeandstyle/food-and-drink", "Food")
  val family = SectionLink("lifeandstyle", "Family", "/lifeandstyle/family", "Family")
  val lostinshowbiz = SectionLink("lifeandstyle", "Lost in Showbiz", "/lifeandstyle/lostinshowbiz", "Lost in Showbiz")
  val women = SectionLink("lifeandstyle", "Women", "/lifeandstyle/women", "Women")
  val relationships = SectionLink("lifeandstyle", "Relationships", "/lifeandstyle/relationships", "Relationships")
  val healthandwellbeing = SectionLink("lifeandstyle", "Health and wellbeing", "/lifeandstyle/health-and-wellbeing", "Health and wellbeing")
  val loveAndSex = SectionLink("lifeandstyle", "Love & Sex", "/lifeandstyle/love-and-sex", "Love & Sex")
  val homeAndGarden = SectionLink("lifeandstyle", "Home & Garden", "/lifeandstyle/home-and-garden", "Home & Garden")

  //Travel
  val travel = SectionLink("travel", "Travel", "/travel", "Travel")
  val shortbreaks = SectionLink("travel", "Short breaks", "/travel/short-breaks", "Short breaks")
  val uktravel = SectionLink("travel", "Uk", "/travel/uk", "UK")
  val europetravel = SectionLink("travel", "Europe", "/travel/europe", "Europe")
  val usTravel = SectionLink("travel", "US", "/travel/usa", "US")
  val hotels = SectionLink("travel", "Hotels", "/travel/hotels", "Hotels")
  val resturants = SectionLink("travel", "Restaurants", "/travel/restaurants", "Restaurants")
  val budget = SectionLink("travel", "Budget travel", "/travel/budget", "Budget travel")

  //Environment
  val climatechange = SectionLink("environment", "Climate change", "/environment/climate-change", "Climate change"  )
  val wildlife = SectionLink("environment", "Wildlife", "/environment/wildlife", "Wildlife")
  val energy = SectionLink("environment", "Energy", "/environment/energy", "Energy")
  val conservation = SectionLink("environment", "Conservation", "/environment/conservation", "Conservation")
  val food = SectionLink("environment", "Food", "/environment/food", "Food")
  val cities = SectionLink("environment", "Cities", "/cities", "Cities")
  val globalDevelopment = SectionLink("environment", "Development", "/cities", "Development")

  def footballNav(metaData: MetaData) = NavItem(football, Seq(
    SectionLink("football", "Live scores", "/football/live", "Live scores"),
    SectionLink("football", "Tables", "/football/tables", "Tables"),
    SectionLink("football", "Competitions", "/football/competitions", "Competitions"),
    SectionLink("football", "Results", "/football/results", "Results"),
    SectionLink("football", "Fixtures", "/football/fixtures", "Fixtures"),
    SectionLink("football", "Clubs", "/football/teams", "Clubs")
  ))
}

// helper for the views
object Navigation {
  
  def topLevelItem(navigation: Seq[NavItem], page: MetaData): Option[NavItem] = navigation.find(_.exactFor(page))
    .orElse(navigation.find(_.currentFor(page)))


  def localNav(navigation: Seq[NavItem], page: MetaData): Option[Seq[SectionLink]] = topLevelItem(navigation, page)
    .map(_.links).filter(_.nonEmpty)

  def sectionOverride(page: MetaData, localNav: NavItem, currentSublink: Option[SectionLink]): String = page match {
    case p:Tag => currentSublink.map(_.linkName).getOrElse(localNav.name.linkName)
    case _ => localNav.name.linkName
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