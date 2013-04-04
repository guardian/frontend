package common

import play.api.mvc.RequestHeader
import model.{Tag, MetaData}

case class SectionLink(zone: String, linkName: String, href: String, title: String, newWindow: Boolean = false)

case class Zone(name: SectionLink, sections: Seq[SectionLink])

case class NavItem(name: SectionLink, links: Seq[SectionLink] = Nil, current: Boolean = false) {
def currentFor(metadata: MetaData) = {
    val sectionId = s"/${metadata.section}"
    sectionId == name.href || name.href == s"/${metadata.id}" || links.exists(_.href == sectionId)
  }
}


object Sections  {

  //News
  val home = SectionLink("news", "News", "/", "Home")
  val news  = SectionLink("news", "News", "/", "News")
  val world = SectionLink("world", "World News", "/world", "World news")
  val uk    = SectionLink("uk", "UK", "/uk", "UK")
  val us    = SectionLink("us", "US", "/world/usa", "US")
  val politics = SectionLink("politics", "Politics", "/politics", "Politics")
  val technology = SectionLink("technology", "Technology", "/technology", "Technology")
  val environment = SectionLink("environment", "Environment", "/environment", "Environment")
  val media = SectionLink("media", "Media", "/media", "Media")
  val education = SectionLink("education", "Education", "/education", "Education")
  val society = SectionLink("society", "Society", "/society", "Society")
  val development = SectionLink("globaldevelopment", "Global development", "/global-development", "Global development")
  val science = SectionLink("science", "Science", "/science", "Science")
  val law = SectionLink("law", "Law", "/law", "Law")
  val blogs = SectionLink("blogs", "Blogs", "/tone/blog", "Blogs")
  val inpictures = SectionLink("inpictures", "Galleries", "/inpictures", "In pictures")

  val health = SectionLink("society", "Health", "/society/health", "Health")


  //World
  val europe = SectionLink("world", "Europe", "/world/europe/roundup", "Europe")
  val middleeast = SectionLink("world", "Middle East", "/world/middleeast/roundup", "Middle east")
  val asiapacific = SectionLink("world", "Asia Pacific", "/world/asiapacific/roundup", "Asia Pacific")
  val africa = SectionLink("world", "Africa", "/world/africa/roundup", "Africa")
  val americas = SectionLink("world", "Americas", "/world/americas/roundup", "Americas")

  //Sport
  val sport = SectionLink("sport", "Sport", "/sport", "Sport")
  val football = SectionLink("football", "Football", "/football", "Football")
  val cricket = SectionLink("sport", "Cricket", "/sport/cricket", "Cricket")
  val sportblog = SectionLink("sport", "Sport blog", "/sport/blog", "Sport blog")
  val cycling = SectionLink("sport", "Cycling", "/sport/cycling", "Cycling")
  val rugbyunion = SectionLink("sport", "Rugby union", "/sport/rugby-union", "Rugby union")
  val motorsport = SectionLink("sport", "Motor sport", "/sport/motorsports", "Motor sport")
  val tennis = SectionLink("sport", "Tennis", "/sport/tennis", "Tennis")
  val golf = SectionLink("sport", "Golf", "/sport/golf", "Golf")
  val rugbyleague = SectionLink("sport", "Rugby league", "/sport/rugbyleague", "Rugby league")
  val horseracing = SectionLink("sport", "Horse racing", "/sport/horse-racing", "Horse racing")

  val nfl = SectionLink("sport", "NFL", "/sport/nfl", "NFL")
  val mlb = SectionLink("sport", "MLB", "/sport/mlb", "MLB")
  val nba = SectionLink("sport", "NBA", "/sport/nba", "NBA")
  val mls = SectionLink("football", "MLS", "/football/mls", "MLS")
  val nhl = SectionLink("sport", "NHL", "/sport/nhl", "NHL")

  //Cif
  val cif = SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free")
  val cifbelief = SectionLink("commentisfree", "Cif belief", "/commentisfree/belief", "Cif belief")
  val cifgreen = SectionLink("commentisfree", "Cif green", "/commentisfree/cif-green", "Cif green")

  //Culture
  val culture = SectionLink("culture", "Culture", "/culture", "Culture")
  val artanddesign = SectionLink("culture", "Art &amp; design", "/artanddesign", "Art & design")
  val books = SectionLink("culture", "Books", "/books", "Books")
  val film = SectionLink("culture", "Film", "/film", "Film")
  val music = SectionLink("culture", "Music", "/music", "Music")
  val stage = SectionLink("culture", "Stage", "/stage", "Stage")
  val televisionandradio = SectionLink("culture", "Television &amp; radio", "/tv-and-radio", "Television &amp; radio")

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
  val business =  SectionLink("business", "Business", "/business", "Business")
  val economics = SectionLink("business", "Economics", "/business/economics", "Economics")
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
  val debt = SectionLink("money", "Borrowing &amp; debt", "/money/debt", "Borrowing &amp; debt")
  val insurance = SectionLink("money", "Insurance", "/money/insurance", "Insurance")
  val workandcareers = SectionLink("money", "Work &amp; careers", "/money/work-and-careers", "Work &amp; careers")
  val consumeraffairs = SectionLink("money", "Consumer affairs", "/money/consumer-affairs", "Consumer affairs")

  //Life and style
  val lifeandstyle = SectionLink("lifeandstyle", "Life & Style", "/lifeandstyle", "Life & style")
  val fashion = SectionLink("lifeandstyle", "Fashion", "/fashion", "Fashion")
  val foodanddrink = SectionLink("lifeandstyle", "Food &amp; drink", "/lifeandstyle/food-and-drink", "Food &amp; drink")
  val family = SectionLink("lifeandstyle", "Family", "/lifeandstyle/family", "Family")
  val lostinshowbiz = SectionLink("lifeandstyle", "Lost in Showbiz", "/lifeandstyle/lostinshowbiz", "Lost in Showbiz")
  val women = SectionLink("lifeandstyle", "Women", "/lifeandstyle/women", "Women")
  val relationships = SectionLink("lifeandstyle", "Relationships", "/lifeandstyle/relationships", "Relationships")
  val healthandwellbeing = SectionLink("lifeandstyle", "Health and wellbeing", "/lifeandstyle/health-and-wellbeing", "Health and wellbeing")

  //Travel
  val travel = SectionLink("travel", "Travel", "/travel", "Travel")
  val shortbreaks = SectionLink("travel", "Short breaks", "/travel/short-breaks", "Short breaks")
  val uktravel = SectionLink("travel", "Uk travel", "/travel/uk", "United Kingdom")
  val europetravel = SectionLink("travel", "Europe travel", "/travel/europe", "Europe")
  val hotels = SectionLink("travel", "Hotels", "/travel/hotels", "Hotels")
  val resturants = SectionLink("travel", "Restaurants", "/travel/restaurants", "Restaurants")
  val budget = SectionLink("travel", "Budget travel", "/travel/budget", "Budget travel")

  //Environment
  val climatechange = SectionLink("environment", "Climate change", "/environment/climate-change", "environment")
  val wildlife = SectionLink("environment", "Wildlife", "/environment/wildlife", "wildlife")
  val energy = SectionLink("environment", "Energy", "/environment/energy", "Energy")
  val conservation = SectionLink("environment", "Conservation", "/environment/conservation", "Conservation")
  val food = SectionLink("environment", "Food", "/environment/food", "Food")
}

object Navigation {

  import Sections._

  def ukSections(metadata: MetaData, site: Site) = Seq(
    NavItem(home),
    NavItem(uk, Seq(politics, media, science, society, health, education)),
    NavItem(world, Seq(us, europe, middleeast, asiapacific, africa, americas)),
    NavItem(cif, Seq(SectionLink("commentisfree", "Cif America", s"http://${site.usHost}/commentisfree", "Cif America"), cifbelief, cifgreen)),
    NavItem(sport, Seq(football, cricket, tennis, rugbyunion, cycling)),
    footballNav(metadata),
    NavItem(lifeandstyle, Seq(foodanddrink, fashion, relationships, healthandwellbeing, women)),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business, Seq(economics, banking, property, workandcareers, savings)),
    NavItem(travel, Seq(shortbreaks, uktravel, europetravel, hotels, resturants)),
    NavItem(technology, Seq(internet, games, mobilephones, appsblog)),
    NavItem(environment, Seq(climatechange, wildlife, energy, conservation, food))
  )

  def usSections(metadata: MetaData, site: Site) = Seq(
    NavItem(home),
    NavItem(us),
    NavItem(world, Seq(us, europe, middleeast, asiapacific, africa, americas)),
    NavItem(SectionLink("sport", "Sport", "/sport", "Sports"), Seq(nfl, mlb, nba, mls, nhl, football)),
    footballNav(metadata),
    NavItem(cif, Seq(SectionLink("commentisfree", "Cif America", s"http://${site.usHost}/commentisfree", "Cif America"), cifbelief, cifgreen)),
    NavItem(lifeandstyle, Seq(foodanddrink, fashion, relationships, healthandwellbeing, women)),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business, Seq(economics, banking, property, workandcareers, savings)),
    NavItem(technology, Seq(internet, games, mobilephones, appsblog)),
    NavItem(environment, Seq(climatechange, wildlife, energy, conservation, food)),
    NavItem(media)
  )

  def footballNav(metaData: MetaData) = metaData match {
    case tag: Tag if tag.isFootballTeam => NavItem(football, Seq(
      SectionLink("football", "Tables", "/football/tables", "Tables"),
      SectionLink("football", "Live scores", "/football/live", "Live scores"),
      SectionLink("football", "Fixtures", s"/football/${tag.url}/fixtures", "Fixtures"),
      SectionLink("football", "Results", s"/football/${tag.url}/results", "Results"),
      SectionLink("football", "Teams", "/football/teams", "Teams"),
      SectionLink("football", "Leagues & competitions", "/football/competitions", "Leagues & competitions")
    ))
    case tag: Tag if tag.isFootballCompetition => NavItem(football, Seq(
      SectionLink("football", "Tables", s"/football/${tag.url}/tables", "Tables"),
      SectionLink("football", "Live scores", s"/football/${tag.url}/live", "Live scores"),
      SectionLink("football", "Fixtures", s"/football/${tag.url}/fixtures", "Fixtures"),
      SectionLink("football", "Results", s"/football/${tag.url}/results", "Results"),
      SectionLink("football", "Teams", "/football/teams", "Teams"),
      SectionLink("football", "Leagues & competitions", "/football/competitions", "Leagues & competitions")
    ))
    case _ => NavItem(football, Seq(
      SectionLink("football", "Tables", "/football/tables", "Tables"),
      SectionLink("football", "Live scores", "/football/live", "Live scores"),
      SectionLink("football", "Fixtures", "/football/fixtures", "Fixtures"),
      SectionLink("football", "Results", "/football/results", "Results"),
      SectionLink("football", "Teams", "/football/teams", "Teams"),
      SectionLink("football", "Leagues & competitions", "/football/competitions", "Leagues & competitions")
    ))
  }

  def apply(metaData: MetaData, request: RequestHeader) = Site(request).edition match {
    case "US" => usSections(metaData, Site(request))
    case _ => ukSections(metaData, Site(request))
  }
}

object Zones {

  import Sections._

  def apply(request: RequestHeader) = {

    val site = Site(request)
    val edition = site.edition

    var sportSections = List(football, cricket, sportblog, rugbyunion, motorsport, tennis, golf, rugbyleague, horseracing)


    // prepend US sports
    if (edition == "US") {
      sportSections :::= List(nfl, mlb, nba, mls, nhl)
    }

    val zones = Seq(
      Zone(
        news,
        Seq(
          world, uk,
          us,
          politics,
          technology,
          environment,
          media,
          education,
          society,
          development,
          science,
          law,
          blogs,
          inpictures
        )), //End News

      Zone(
        SectionLink("sport", "Sport", "/sport", if (edition == "US") "Sports" else "Sport"),
        sportSections
      ),

      Zone(
        cif,
        Seq(
          SectionLink("commentisfree", "Cif America", s"http://${site.usHost}/commentisfree", "Cif America"),
          cifbelief,
          cifgreen
        )), // end comment is free

      Zone(
        culture,
        Seq(
          artanddesign,
          books,
          film,
          music,
          stage,
          televisionandradio
        )), //End culture

      Zone(
        technology,
        Seq(
          technologyblog,
          games,
          gamesblog,
          appsblog,
          askjack,
          internet,
          mobilephones,
          gadgets
        )),

      Zone(
        business,
        Seq(
          economics,
          useconomy,
          recession,
          investing,
          banking,
          marketforceslive,
          businessblog
        )), //End Business

      Zone(
        money,
        Seq(
          property,
          houseprices,
          pensions,
          savings,
          debt,
          insurance,
          workandcareers,
          consumeraffairs
        )), //End Money

      Zone(
        lifeandstyle,
        Seq(
          fashion,
          foodanddrink,
          family,
          lostinshowbiz
        )), //End Life and style

      Zone(
        travel,
        Seq(
          shortbreaks,
          hotels,
          resturants,
          budget
        ))
    ) //End zones

    zones
  }
}