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
      SectionLink("lifeandstyle", "Life & Style", "/lifeandstyle", "Life &amp; style"),
      SectionLink("culture", "Culture", "/culture", "Culture"),
      SectionLink("business", "Business", "/business", "Business"),
      SectionLink("technology", "Technology", "/technology", "Technology"),
      SectionLink("film", "Film", "/film", "Film"),
      SectionLink("music", "Music", "/music", "Music")
    )

    sections
  }
}

object Zones {
  def apply() = {

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
          SectionLink("blogs", "Blogs", "/tone/blogs", "Blogs"),
          SectionLink("inpictures", "Galleries", "/inpictures", "In pictures") //This throws a 404 in our app
        )), //End News

      Zone(
        SectionLink("sport", "Sport", "/sport", "Sport"),
        Seq(
          SectionLink("football", "Football", "/football", "Football"),
          SectionLink("sport", "Sport blog", "/sport/blog", "Sport blog"),
          SectionLink("sport", "Rugby union", "/sport/rugby-union", "Rugby union"),
          SectionLink("sport", "Motor sport", "/sport/motor-sport", "Motor sport"),
          SectionLink("sport", "Tennis", "/sport/tennis", "Tennis"),
          SectionLink("sport", "Golf", "/sport/golf", "Golf"),
          SectionLink("sport", "Rugby league", "/sport/rugby-league", "Rugby league"),
          SectionLink("sport", "Horse racing", "/sport/horse-racing", "Horse racing")
        )), //End Sport

      Zone(
        SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
        Seq(
          SectionLink("commentisfree", "Cif America", "/commentisfree/us-edition", "Cif America"),
          SectionLink("commentisfree", "Cif belief", "/commentisfree/belief", "Cif belief"),
          SectionLink("commentisfree", "Cif Middle East", "/commentisfree/middleeast", "Cif Middle East"),
          SectionLink("commentisfree", "Cif green", "/commentisfree/cif-green", "Cif green")
        )), // end comment is free

      Zone(
        SectionLink("culture", "Culture", "/culture", "Culture"),
        Seq(
          SectionLink("culture", "Art & design", "/artanddesign", "Art & design"),
          SectionLink("culture", "Books", "/books", "Books"),
          SectionLink("culture", "Film", "/film", "Film"),
          SectionLink("culture", "Music", "/music", "Music"),
          SectionLink("culture", "Stage", "/stage", "Stage"),
          SectionLink("culture", "Television & radio", "/tv-and-radio", "Television & radio")
        )), //End culture

      Zone(
        SectionLink("business", "Business", "/business", "Business"),
        Seq(
          SectionLink("business", "Economics", "/business/economics", "Economics"),
          SectionLink("business", "US economy", "/business/useconomy", "US economy"),
          SectionLink("business", "Recession", "/business/recession", "Recession"),
          SectionLink("business", "Investing", "/business/investing", "Business"),
          SectionLink("business", "Banking", "/busisness/banking", "Banking"),
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
          SectionLink("money", "Borrowing & debt", "/money/debt", "Borrowing & debt"),
          SectionLink("money", "Insurance", "/money/insurance", "Insurance"),
          SectionLink("money", "Work & careers", "/money/work-and-careers", "Work & careers"),
          SectionLink("money", "Consumer affairs", "/money/consumer-affairs", "Consumer affairs")
        )), //End Money

      Zone(
        SectionLink("lifeandstyle", "Life & Style", "/lifeandstyle", "Life & style"),
        Seq(
          SectionLink("lifeandstyle", "Fashion", "/fashion", "Fashion"),
          SectionLink("lifeandstyle", "Food", "/food", "Food"),
          SectionLink("lifeandstyle", "Family", "/lifeandstyle/family", "Family"),
          SectionLink("lifeandstyle", "Lost in Showbiz", "/lifeandstyle/lostinshowbiz", "Lost in Showbiz")
        )), //End Life and style

      Zone(
        SectionLink("travel", "Travel", "/travel", "Travel"),
        Seq(
          SectionLink("travel", "Types of trip", "/travel/typesoftrip", "Types of trip"),
          SectionLink("travel", "Short breaks", "/travel/short-breaks", "Short breaks"),
          SectionLink("travel", "Hotels", "/travel/hotels", "Hotels"),
          SectionLink("travel", "Restaurants", "/travel/restaurants", "Restaurants"),
          SectionLink("travel", "Budget travel", "/travel/budget", "Budget travel")
        ))
    ) //End zones

    zones
  }
}