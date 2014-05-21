package common

import model.{Content, Section, Tag, MetaData}

case class SectionLink(zone: String, title: String, href: String,newWindow: Boolean = false) {
  def currentFor(page: MetaData): Boolean = page.url == href ||
    s"/${page.section}" == href ||
    page.url == href ||
    page.tags.exists(t => s"/${t.id}" == href) ||
    (Edition.all.exists(_.id.toLowerCase == page.id.toLowerCase) && href == "/")
}

case class Zone(name: SectionLink, sections: Seq[SectionLink])

case class NavItem(name: SectionLink, links: Seq[SectionLink] = Nil, current: Boolean = false) {
  def currentFor(page: MetaData): Boolean = name.currentFor(page) ||
    links.exists(_.currentFor(page)) || exactFor(page)

  def exactFor(page: MetaData): Boolean = page.section == name.href.dropWhile(_ == '/') || page.url == name.href
}

trait Navigation  {

  //News
  val home = SectionLink("news", "home", "/")
  val news  = SectionLink("news", "news", "/")
  val world = SectionLink("world", "world", "/world")
  val uk    = SectionLink("uk-news", "UK", "/uk-news")
  val us    = SectionLink("world", "US", "/world/usa")
  val politics = SectionLink("politics", "politics", "/politics")
  val technology = SectionLink("technology", "tech", "/technology")
  val environment = SectionLink("environment", "environment", "/environment")
  val media = SectionLink("media", "media", "/media")
  val education = SectionLink("education", "education", "/education")
  val students = SectionLink("education", "students", "/education/students")
  val society = SectionLink("society", "society", "/society")
  val development = SectionLink("globaldevelopment", "global development", "/global-development")
  val science = SectionLink("science", "science", "/science")
  val law = SectionLink("law", "law", "/law")
  val blogs = SectionLink("blogs", "blogs", "/tone/blog")
  val inpictures = SectionLink("inpictures", "galleries", "/inpictures")
  val europeNews = SectionLink("world", "europe", "/world/europe-news")
  val americas = SectionLink("world", "americas", "/world/americas")
  val australia = SectionLink("world", "australia", "/world/australia")
  val asia = SectionLink("world", "asia", "/world/asia")
  val africa = SectionLink("world", "africa", "/world/africa")
  val middleEast = SectionLink("world", "middle east", "/world/middleeast")

  val health = SectionLink("society", "health", "/society/health")

  //Sport
  val sport = SectionLink("sport", "sport", "/sport")
  val sports = sport.copy(title = "sports")
  val usSport = SectionLink("sport", "US sports", "/sport/us-sport")
  val australiaSport = SectionLink("australia sport", "australia sport", "/sport/australia-sport")
  val afl = SectionLink("afl", "afl", "/sport/afl")
  val nrl = SectionLink("nrl", "nrl", "/sport/nrl")
  val aLeague = SectionLink("a-league", "a-league", "/football/a-league")
  val football = SectionLink("football", "football", "/football")
  val soccer = football.copy(title = "soccer")
  val cricket = SectionLink("sport", "cricket", "/sport/cricket")
  val sportblog = SectionLink("sport", "sport blog", "/sport/blog")
  val cycling = SectionLink("sport", "cycling", "/sport/cycling")
  val rugbyunion = SectionLink("sport", "rugby union", "/sport/rugby-union")
  val rugbyLeague = SectionLink("sport", "rugby league", "/sport/rugbyleague")
  val motorsport = SectionLink("sport", "motor sport", "/sport/motorsports")
  val tennis = SectionLink("sport", "tennis", "/sport/tennis")
  val golf = SectionLink("sport", "golf", "/sport/golf")
  val horseracing = SectionLink("sport", "horse racing", "/sport/horse-racing")
  val boxing = SectionLink("sport", "boxing", "/sport/boxing")
  val formulaOne = SectionLink("sport", "formula one", "/sport/formula-one-2014")

  val nfl = SectionLink("sport", "NFL", "/sport/nfl")
  val mlb = SectionLink("sport", "MLB", "/sport/mlb")
  val nba = SectionLink("sport", "NBA", "/sport/nba")
  val mls = SectionLink("football", "MLS", "/football/mls")
  val nhl = SectionLink("sport", "NHL", "/sport/nhl")

  //Cif
  val cif = SectionLink("commentisfree", "comment", "/commentisfree")
  val opinion = SectionLink("commentisfree", "opinion", "/commentisfree")
  val cifbelief = SectionLink("commentisfree", "cif belief", "/commentisfree/belief")
  val cifgreen = SectionLink("commentisfree", "cif green", "/commentisfree/cif-green")

  //Culture
  val culture = SectionLink("culture", "culture", "/culture")
  val artanddesign = SectionLink("culture", "art & design", "/artanddesign")
  val books = SectionLink("culture", "books", "/books")
  val film = SectionLink("culture", "film", "/film")
  val movies = film.copy(title = "movies")
  val music = SectionLink("culture", "music", "/music")
  val stage = SectionLink("culture", "stage", "/stage")
  val televisionAndRadio = SectionLink("culture", "tv & radio", "/tv-and-radio")

  //Technology
  val technologyblog = SectionLink("technology", "technology blog", "/technology/blog")
  val games = SectionLink("technology", "games", "/technology/games")
  val gamesblog = SectionLink("technology", "games blog", "/technology/gamesblog")
  val appsblog = SectionLink("technology", "apps blog", "/technology/appsblog")
  val askjack = SectionLink("technology", "ask jack", "/technology/askjack")
  val internet = SectionLink("technology", "internet", "/technology/internet")
  val mobilephones = SectionLink("technology", "mobile phones", "/technology/mobilephones")
  val gadgets = SectionLink("technology", "gadgets", "/technology/gadgets")

  //Business
  val economy =  SectionLink("business", "economy", "/business")
  val business =  economy.copy(title = "business")
  val companies =  SectionLink("business", "companies", "/business/companies")
  val economics = SectionLink("business", "economics", "/business/economics")
  val markets = SectionLink("business", "markets", "/business/stock-markets")
  val useconomy = SectionLink("business", "US economy", "/business/useconomy")
  val recession = SectionLink("business", "recession", "/business/recession")
  val  investing = SectionLink("business", "investing", "/business/investing")
  val banking = SectionLink("business", "banking", "/business/banking")
  val marketforceslive = SectionLink("business", "market forces live", "/business/marketforceslive")
  val businessblog = SectionLink("business", "business blog", "/business/blog")

  //Money
  val money = SectionLink("money", "money", "/money")
  val property = SectionLink("money", "property", "/money/property")
  val houseprices = SectionLink("money", "house prices", "/money/houseprices")
  val pensions = SectionLink("money", "pensions", "/money/pensions")
  val savings = SectionLink("money", "savings", "/money/savings")
  val borrowing = SectionLink("money", "borrowing", "/money/debt")
  val insurance = SectionLink("money", "insurance", "/money/insurance")
  val careers = SectionLink("money", "careers", "/money/work-and-careers")
  val consumeraffairs = SectionLink("money", "consumer affairs", "/money/consumer-affairs")

  //Life and style
  val lifeandstyle = SectionLink("lifeandstyle", "life", "/lifeandstyle")
  val fashion = SectionLink("lifeandstyle", "fashion", "/fashion")
  val foodanddrink = SectionLink("lifeandstyle", "food", "/lifeandstyle/food-and-drink")
  val family = SectionLink("lifeandstyle", "family", "/lifeandstyle/family")
  val lostinshowbiz = SectionLink("lifeandstyle", "lost in showbiz", "/lifeandstyle/lostinshowbiz")
  val women = SectionLink("lifeandstyle", "women", "/lifeandstyle/women")
  val relationships = SectionLink("lifeandstyle", "relationships", "/lifeandstyle/relationships")
  val healthandwellbeing = SectionLink("lifeandstyle", "health", "/lifeandstyle/health-and-wellbeing")
  val loveAndSex = SectionLink("lifeandstyle", "love & sex", "/lifeandstyle/love-and-sex")
  val homeAndGarden = SectionLink("lifeandstyle", "home & garden", "/lifeandstyle/home-and-garden")

  //Travel
  val travel = SectionLink("travel", "travel", "/travel")
  val shortbreaks = SectionLink("travel", "short breaks", "/travel/short-breaks")
  val uktravel = SectionLink("travel", "UK", "/travel/uk")
  val europetravel = SectionLink("travel", "europe", "/travel/europe")
  val usTravel = SectionLink("travel", "US", "/travel/usa")
  val usaTravel = usTravel.copy(title = "USA")
  val hotels = SectionLink("travel", "hotels", "/travel/hotels")
  val resturants = SectionLink("travel", "restaurants", "/travel/restaurants")
  val budget = SectionLink("travel", "budget travel", "/travel/budget")
  val australasiaTravel = SectionLink("australasia", "australasia", "/travel/australasia")
  val asiaTravel = SectionLink("asia", "asia", "/travel/asia")

  //Environment
  val climatechange = SectionLink("environment", "climate change", "/environment/climate-change")
  val wildlife = SectionLink("environment", "wildlife", "/environment/wildlife")
  val energy = SectionLink("environment", "energy", "/environment/energy")
  val conservation = SectionLink("environment", "conservation", "/environment/conservation")
  val food = SectionLink("environment", "food", "/environment/food")
  val cities = SectionLink("environment", "cities", "/cities")
  val globalDevelopment = SectionLink("environment", "development", "/global-development")

  val footballNav = Seq(
    SectionLink("football", "live scores", "/football/live"),
    SectionLink("football", "tables", "/football/tables"),
    SectionLink("football", "competitions", "/football/competitions"),
    SectionLink("football", "results", "/football/results"),
    SectionLink("football", "fixtures", "/football/fixtures"),
    SectionLink("football", "clubs", "/football/teams")
  )
}

case class BreadcrumbItem(href: String, title: String)

object Breadcrumbs {

  def items(navigation: Seq[NavItem], page: Content): Seq[BreadcrumbItem] = {

    val primaryKeyword = page.keywordTags.head
    lazy val secondaryKeyword = page.keywordTags.tail.head

    def getTopLevelNavigationItem: Option[NavItem] = {
      val topLevelSelected = Navigation.topLevelItem(navigation, page)
      navigation find {
        navItem =>
          topLevelSelected.exists(_ == navItem) && navItem.name.href != primaryKeyword.url
      }
    }


    def getLocalNavigationItem: Option[SectionLink] = {
      Navigation.localNav(navigation, page) match {
        case Some(sectionLinks) => {
          sectionLinks.find(_.currentFor(page)) find {
            link => sectionLinks.exists(_ == link) && link.href!= primaryKeyword.url
          }
        }
        case _ => None
      }
    }

    (getTopLevelNavigationItem, getLocalNavigationItem) match {
      case (Some(navItem), Some(sectionLink)) => Seq(
          BreadcrumbItem(navItem.name.href, navItem.name.title),
          BreadcrumbItem(sectionLink.href, sectionLink.title),
          BreadcrumbItem(primaryKeyword.url, primaryKeyword.name)
      )
      case (Some(navItem), None) => Seq (
          BreadcrumbItem(navItem.name.href, navItem.name.title),
          BreadcrumbItem(primaryKeyword.url, primaryKeyword.name),
          BreadcrumbItem(secondaryKeyword.url, secondaryKeyword.name)
      )
      case _ => Seq (
          BreadcrumbItem("/%s".format(page.section), page.sectionName),
          BreadcrumbItem(primaryKeyword.url, primaryKeyword.name),
          BreadcrumbItem(secondaryKeyword.url, secondaryKeyword.name)
      )
    }
  }
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