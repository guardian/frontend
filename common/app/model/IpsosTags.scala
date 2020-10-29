package model

object IpsosTags {

  val tags = Map(
    "uk" -> "uk",
    "us" -> "us",
    "au" -> "au",
    "artanddesign" -> "artanddesign",
    "australia-news" -> "australianews",
    "books" -> "books",
    "business" -> "business", /* Default for business articles */
    "uk/business" -> "business",
    "uk/business-to-business" -> "business",
    "au/business" -> "business",
    "us/business" -> "usbusiness",
    "careers" -> "careers",
    "cities" -> "cities",
    "uk/commentisfree" -> "commentisfree",
    "commentisfree" -> "commentisfree", /* Default for comment articles */
    "us/commentisfree" -> "uscommentisfree",
    "community" -> "community",
    "crosswords" -> "crosswords",
    "uk/culture" -> "culture", /* There is no US or AU culture tag - should these map to culture? */
    "education" -> "education",
    "uk/environment" -> "environment", /* There is no US or AU environment tag - should these map to environment? */
    "environment" -> "environment", /* Default for environment articles */
    "fashion" -> "fashion",
    "uk/film" -> "film", /* There is no US or AU film tag - should these map to film? */
    "film" -> "film",
    "food" -> "food",
    "football" -> "football",
    "games" -> "games",
    "global-development" -> "globaldevelopment",
    "guardian-masterclasses" -> "masterclasses",
    "healthcare-network" -> "healthcarenetwork",
    "help" -> "help",
    "housing-network" -> "housingnetwork",
    "inequality" -> "inequality",
    "about" -> "info",
    "law" -> "law",
    "uk/lifeandstyle" -> "lifeandstyle", /* There is no US or AU lifeandstyle tag - should these map to lifeandstyle? */
    "lifeandstyle" -> "lifeandstyle",
    "lifeandstyle/love-and-sex" -> "lifeandstyle",
    "us/lifeandstyle" -> "lifeandstyle",
    "uk/media" -> "media", /* There is no US or AU media tag - should these map to media? */
    "membership" -> "membership",
    "uk/money" -> "money", /* There is no US or AU money tag - should these map to money? */
    "music" -> "music",
    "international" -> "international",
    "/email-newsletters" -> "emailnewsletters",
    "newsletter-signup-page" -> "emailnewsletters",
    "observer-food-monthly-awards" -> "ofmawards",
    "observer" -> "observer",
    "politics" -> "politics",
    "public-leaders-network" -> "publicleaders",
    "science" -> "science",
    "small-business-network" -> "smallbusiness",
    "society" -> "society",
    "uk/sport" -> "sport",
    "sport/cricket" -> "cricket",
    "sport/rugby-union" -> "rugbyunion",
    "sport/tennis" -> "tennis",
    "sport/cycling" -> "cycling",
    "sport/formulaone" -> "formulaone",
    "sport/golf" -> "golf",
    "sport/boxing" -> "boxing",
    "sport/rugbyleague" -> "rugbyleague",
    "sport/horse-racing" -> "horseracing",
    "sport/us-sport" -> "ussport",
    "sport" -> "sport", /* Default for sport articles */
    "stage" -> "stage",
    "teacher-network" -> "teachernetwork",
    "uk/technology" -> "technology", /* There is no US or AU technology tag - should these map to technology? */
    "technology" -> "technology", /* Default for technology (including motoring) articles */
    "the-guardian-foundation" -> "foundation",
    "theguardian" -> "theguardian",
    "theobserver" -> "theobserver",
    "uk/travel" -> "travel",
    "travel" -> "travel", /* Default for travel articles */
    "us/travel" -> "travel",
    "au/travel" -> "travel",
    "tv-and-radio" -> "tvandradio",
    "uk/tv-and-radio" -> "tvandradio",
    "uk-news" -> "uknews",
    "us-news" -> "us-news",
    "voluntary-sector-network" -> "voluntarysector",
    "world" -> "world",
    "world/coronavirus-outbreak" -> "coronavirusoutbreak",
    "tone/obituaries" -> "obituaries",
    "tone/recipes" -> "recipes",
    "type/video" -> "video",
    "video" -> "video",
    "documentaries" -> "documentaries",
    "type/podcast" -> "podcasts",
    "podcasts" -> "podcasts",
    "inpictures" -> "inpictures",
    "type/gallery" -> "inpictures",
    "publication/guardianweekly" -> "weekly",
    "weekly" -> "weekly",
    "guardian-professional" -> "professional",
    "lifeandstyle/health-and-wellbeing" -> "healthandwellbeing",
    "jobs" -> "jobs",
  )

  // Default to top level `guardian` tag if key is not found
  def getScriptTag(id: String): String = {
    tags.getOrElse(id, "guardian")
  }

}
