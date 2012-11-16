package common

import play.api.mvc.RequestHeader

case class SectionLink(zone: String, linkName: String, href: String, title: String)

case class Zone(name: SectionLink, sections: Seq[SectionLink])

object Navigation {
  def apply(request: RequestHeader, config: GuardianConfiguration) = {

    val host = request.headers.get("host")
    val edition = config.edition(host)

    val sportTitle = if (edition == "US") "Sports" else "Sport"

    val sections = Seq(
      SectionLink("home", "Home", "/", "Home"),
      SectionLink("uk", "UK News", "/uk", "UK news"),
      SectionLink("world", "World News", "/world", "World news"),
      SectionLink("sport", "Sport", "/sport", sportTitle),
      SectionLink("football", "Football", "/football", "Football"),
      SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
      SectionLink("lifeandstyle", "Life &amp; Style", "/lifeandstyle", "Life &amp; style"),
      SectionLink("culture", "Culture", "/culture", "Culture"),
      SectionLink("business", "Business", "/business", "Business"),
      SectionLink("technology", "Technology", "/technology", "Technology"),
      SectionLink("environment", "Environment", "/environment", "Environment"),
      SectionLink("soulmates", "Soulmates", "https://soulmates.guardian.co.uk/", "Soulmates")
    )

    sections
  }
}

object Zones {
  def apply(request: RequestHeader, config: GuardianConfiguration) = {

    val host = request.headers.get("host")
    val edition = config.edition(host)

    val sportTitle = if (edition == "US") "Sports" else "Sport"

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
        SectionLink("sport", "Sport", "/sport", sportTitle),
        Seq(
          SectionLink("football", "Football", "/football", "Football"),
          SectionLink("sport", "Sport blog", "/sport/blog", "Sport blog"),
          SectionLink("sport", "Rugby union", "/sport/rugby-union", "Rugby union"),
          SectionLink("sport", "Motor sport", "/sport/motorsports", "Motor sport"),
          SectionLink("sport", "Tennis", "/sport/tennis", "Tennis"),
          SectionLink("sport", "Golf", "/sport/golf", "Golf"),
          SectionLink("sport", "Rugby league", "/sport/rugbyleague", "Rugby league"),
          SectionLink("sport", "Horse racing", "/sport/horse-racing", "Horse racing")
        )), //End Sport

      Zone(
        SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
        Seq(
          SectionLink("commentisfree", "Cif America", "http://" + config.edition.usHost + "/commentisfree", "Cif America"),
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