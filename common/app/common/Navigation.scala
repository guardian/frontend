package common

import play.api.mvc.RequestHeader

case class SectionLink(zone: String, linkName: String, href: String, title: String, newWindow: Boolean = false)

case class Zone(name: SectionLink, sections: Seq[SectionLink])

object Navigation {

  private val ukSections = Seq(
    SectionLink("home", "Home", "/", "Home"),
    SectionLink("uk", "UK News", "/uk", "UK news"),
    SectionLink("world", "World News", "/world", "World news"),
    SectionLink("sport", "Sport", "/sport", "Sport"),
    SectionLink("football", "Football", "/football", "Football"),
    SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
    SectionLink("lifeandstyle", "Life &amp; Style", "/lifeandstyle", "Life &amp; style"),
    SectionLink("culture", "Culture", "/culture", "Culture"),
    SectionLink("business", "Business", "/business", "Business"),
    SectionLink("technology", "Technology", "/technology", "Technology"),
    SectionLink("environment", "Environment", "/environment", "Environment"),
    SectionLink("soulmates", "Soulmates", "https://soulmates.guardian.co.uk/", "Soulmates", newWindow = true),
    SectionLink("jobs", "Jobs", "http://jobs.guardian.co.uk/", "Jobs", newWindow = true)
  )

  private val usSections = Seq(
    SectionLink("home", "Home", "/", "Home"),
    SectionLink("world", "US News", "/world/usa", "US news"),
    SectionLink("world", "World News", "/world", "World news"),
    SectionLink("sport", "Sport", "/sport", "Sports"),
    SectionLink("football", "Football", "/football", "Football"),
    SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
    SectionLink("lifeandstyle", "Life &amp; Style", "/lifeandstyle", "Life &amp; style"),
    SectionLink("culture", "Culture", "/culture", "Culture"),
    SectionLink("business", "Business", "/business", "Business"),
    SectionLink("technology", "Technology", "/technology", "Technology"),
    SectionLink("environment", "Environment", "/environment", "Environment"),
    SectionLink("media", "Media", "/media", "Media")
  )

  def apply(request: RequestHeader) = Site(request).edition match {
    case "US" => usSections
    case _ => ukSections
  }
}

object Zones {
  def apply(request: RequestHeader) = {

    val site = Site(request)
    val edition = site.edition

    var sportSections = List(
      SectionLink("football", "Football", "/football", "Football"),
      SectionLink("sport", "Cricket", "/sport/cricket", "Cricket"),
      SectionLink("sport", "Sport blog", "/sport/blog", "Sport blog"),
      SectionLink("sport", "Rugby union", "/sport/rugby-union", "Rugby union"),
      SectionLink("sport", "Motor sport", "/sport/motorsports", "Motor sport"),
      SectionLink("sport", "Tennis", "/sport/tennis", "Tennis"),
      SectionLink("sport", "Golf", "/sport/golf", "Golf"),
      SectionLink("sport", "Rugby league", "/sport/rugbyleague", "Rugby league"),
      SectionLink("sport", "Horse racing", "/sport/horse-racing", "Horse racing")
    )

    // prepend US sports
    if (edition == "US") {
      sportSections :::= List(
        SectionLink("sport", "NFL", "/sport/nfl", "NFL"),
        SectionLink("sport", "MLB", "/sport/mlb", "MLB"),
        SectionLink("sport", "NBA", "/sport/nba", "NBA"),
        SectionLink("football", "MLS", "/football/mls", "MLS"),
        SectionLink("sport", "NHL", "/sport/nhl", "NHL")
      )
    }

    val zones = Seq(
      Zone(
        SectionLink("news", "News", "/", "News"),
        Seq(
          SectionLink("world", "World News", "/world", "World news"),
          SectionLink("uk", "UK", "/uk", "UK"),
          SectionLink("us", "US", "/world/usa", "US"),
          SectionLink("politics", "Politics", "/politics", "Politics"),
          SectionLink("technology", "Technology", "/technology", "Technology"),
          SectionLink("environment", "Environment", "/environment", "Environment"),
          SectionLink("media", "Media", "/media", "Media"),
          SectionLink("education", "Education", "/education", "Education"),
          SectionLink("society", "Society", "/society", "Society"),
          SectionLink("globaldevelopment", "Global development", "/global-development", "Global development"),
          SectionLink("science", "Science", "/science", "Science"),
          SectionLink("law", "Law", "/law", "Law"),
          SectionLink("blogs", "Blogs", "/tone/blog", "Blogs"),
          SectionLink("inpictures", "Galleries", "/inpictures", "In pictures")
        )), //End News

      Zone(
        SectionLink("sport", "Sport", "/sport", if (edition == "US") "Sports" else "Sport"),
        sportSections
      ),

      Zone(
        SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
        Seq(
          SectionLink("commentisfree", "Cif America", s"http://${site.usHost}/commentisfree", "Cif America"),
          SectionLink("commentisfree", "Cif belief", "/commentisfree/belief", "Cif belief"),
          SectionLink("commentisfree", "Cif green", "/commentisfree/cif-green", "Cif green")
        )), // end comment is free

      Zone(
        SectionLink("culture", "Culture", "/culture", "Culture"),
        Seq(
          SectionLink("culture", "Art &amp; design", "/artanddesign", "Art & design"),
          SectionLink("culture", "Books", "/books", "Books"),
          SectionLink("culture", "Film", "/film", "Film"),
          SectionLink("culture", "Music", "/music", "Music"),
          SectionLink("culture", "Stage", "/stage", "Stage"),
          SectionLink("culture", "Television &amp; radio", "/tv-and-radio", "Television &amp; radio")
        )), //End culture

      Zone(
        SectionLink("technology", "Technology", "/technology", "Technology"),
        Seq(
          SectionLink("technology", "Technology blog", "/technology/blog", "Technology blog"),
          SectionLink("technology", "Games", "/technology/games", "Games"),
          SectionLink("technology", "Games blog", "/technology/gamesblog", "Games blog"),
          SectionLink("technology", "Apps blog", "/technology/appsblog", "Apps blog"),
          SectionLink("technology", "Ask Jack", "/technology/askjack", "Ask Jack"),
          SectionLink("technology", "Internet", "/technology/internet", "Internet"),
          SectionLink("technology", "Mobile phones", "/technology/mobilephones", "Mobile phones"),
          SectionLink("technology", "Gadgets", "/technology/gadgets", "Gadgets")
        )),

      Zone(
        SectionLink("business", "Business", "/business", "Business"),
        Seq(
          SectionLink("business", "Economics", "/business/economics", "Economics"),
          SectionLink("business", "US economy", "/business/useconomy", "US economy"),
          SectionLink("business", "Recession", "/business/recession", "Recession"),
          SectionLink("business", "Investing", "/business/investing", "Investing"),
          SectionLink("business", "Banking", "/business/banking", "Banking"),
          SectionLink("business", "Market forces live", "/business/marketforceslive", "Market forces live"),
          SectionLink("business", "Business blog", "/business/blog", "Business blog")
        )), //End Business

      Zone(
        SectionLink("money", "Money", "/money", "Money"),
        Seq(
          SectionLink("money", "Property", "/money/property", "Property"),
          SectionLink("money", "House prices", "/money/houseprices", "House prices"),
          SectionLink("money", "Pensions", "/money/pensions", "Pensions"),
          SectionLink("money", "Savings", "/money/savings", "Savings"),
          SectionLink("money", "Borrowing &amp; debt", "/money/debt", "Borrowing &amp; debt"),
          SectionLink("money", "Insurance", "/money/insurance", "Insurance"),
          SectionLink("money", "Work &amp; careers", "/money/work-and-careers", "Work &amp; careers"),
          SectionLink("money", "Consumer affairs", "/money/consumer-affairs", "Consumer affairs")
        )), //End Money

      Zone(
        SectionLink("lifeandstyle", "Life &amp; Style", "/lifeandstyle", "Life &amp; style"),
        Seq(
          SectionLink("lifeandstyle", "Fashion", "/fashion", "Fashion"),
          SectionLink("lifeandstyle", "Food &amp; drink", "/lifeandstyle/food-and-drink", "Food &amp; drink"),
          SectionLink("lifeandstyle", "Family", "/lifeandstyle/family", "Family"),
          SectionLink("lifeandstyle", "Lost in Showbiz", "/lifeandstyle/lostinshowbiz", "Lost in Showbiz")
        )), //End Life and style

      Zone(
        SectionLink("travel", "Travel", "/travel", "Travel"),
        Seq(
          SectionLink("travel", "Short breaks", "/travel/short-breaks", "Short breaks"),
          SectionLink("travel", "Hotels", "/travel/hotels", "Hotels"),
          SectionLink("travel", "Restaurants", "/travel/restaurants", "Restaurants"),
          SectionLink("travel", "Budget travel", "/travel/budget", "Budget travel")
        ))
    ) //End zones

    zones
  }
}