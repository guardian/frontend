package common

object NavLinks {
  /* NEWS */

  val headlines = NavLink("news", "/", "",longTitle = "headlines", iconName = "home")
  val ukNews = NavLink("UK", "/uk-news", "uk-news", longTitle = "UK news")
  val world = NavLink("world", "/world", "world", longTitle = "world news")
  val environment = NavLink("environment", "/environment", "environment")
  val business = NavLink("business", "/business", "business")
  val economy = business.copy(title = "economy")
  val money = NavLink("money", "/money", "money")
  val science = NavLink("science", "/science", "science")
  var tech = NavLink("tech", "/technology", "technology")
  var politics = NavLink("politics", "/politics", "politics")
  var media = NavLink("media", "/media", "media")
  var cities = NavLink("cities", "/cities", "cities")
  var globalDevelopment = NavLink("development", "/global-development", "global-development")
  var australiaNews = NavLink("australia", "/australia-news", "australia-news", longTitle = "australia news")
  var auPolitics = NavLink("politics", "/australia-news/australian-politics", "australia-news/australian-politics", longTitle = "australian politics")
  var auImmigration = NavLink("immigration", "/australia-news/australian-immigration-and-asylum", "australia-news/australian-immigration-and-asylum")
  var indigenousAustralia = NavLink("indigenous australia", "/australia-news/indigenous-australians", "australia-news/indigenous-australians")
  var usNews = NavLink("US", "/us-news", "us-news", longTitle = "US news")
  var usPolitics = NavLink("politics", "/us-news/us-politics", "us-news/us-politics", longTitle = "US politics")
  val education = NavLink("education", "/education", "education")
  val society = NavLink("society", "/society", "society")
  val law = NavLink("law", "/law", "law")
  val scotland = NavLink("scotland", "/uk/scotland", "uk/scotland")
  val wales = NavLink("wales", "/uk/wales", "uk/wales")
  val northernIreland = NavLink("northern ireland", "/uk/northernireland", "uk/northernireland")
  val europe = NavLink("europe", "/world/europe-news", "world/europe-news")
  val americas = NavLink("americas", "/world/americas", "world/americas")
  val asia = NavLink("asia", "/world/asia", "world/asia")
  val africa = NavLink("africa", "/world/africa", "world/africa")
  val middleEast = NavLink("middle east", "/world/middleeast", "world/middleeast")
  val economics = NavLink("economics", "/business/economics", "business/economics")
  val banking = NavLink("banking", "/business/banking", "business/banking")
  val retail = NavLink("retail", "/business/retail", "business/retail")
  val markets = NavLink("markets", "/business/stock-markets", "business/stock-markets")
  val eurozone = NavLink("eurozone", "/business/eurozone", "business/eurozone")
  val sustainableBusiness = NavLink("sustainable business", "/us/sustainable-business", "us/sustainable-business")
  val diversityEquality = NavLink("diversity & equality in business", "/business/diversity-and-equality", "business/diversity-and-equality")
  val smallBusiness = NavLink("small business", "/business/us-small-business", "business/us-small-business")
  val climateChange = NavLink("climate change", "/environment/climate-change", "environment/climate-change")
  val wildlife = NavLink("wildlife", "/environment/wildlife", "environment/wildlife")
  val energy = NavLink("energy", "/environment/energy", "environment/energy")
  val pollution = NavLink("pollution", "/environment/pollution", "environment/pollution")
  val property = NavLink("property", "/money/property", "money/property")
  val pensions = NavLink("pensions", "/money/pensions", "money/pensions")
  val savings = NavLink("savings", "/money/savings", "money/savings")
  val borrowing = NavLink("borrowing", "/money/debt", "money/debt")
  val careers = NavLink("careers", "/money/work-and-careers", "money/work-and-careers")

  /* OPINION */
  val opinion = NavLink("opinion", "/commentisfree", longTitle = "opinion home", iconName = "home", uniqueSection = "commentisfree")
  var columnists = NavLink("columnists", "/index/contributors", "index/contributors")
  val theGuardianView = NavLink("the guardian view", "/profile/editorial", "profile/editorial")
  val cartoons = NavLink("cartoons", "/cartoons/archive", "cartoons/archive")
  val inMyOpinion = NavLink("in my opinion", "/commentisfree/series/comment-is-free-weekly", "commentisfree/series/comment-is-free-weekly")

  /* SPORT */
  val sport = NavLink("sport", "/sport", longTitle = "sport home", iconName = "home", uniqueSection = "sport")
  val football = NavLink("football", "/football", uniqueSection = "football")
  val soccer = football.copy(title = "soccer")
  val cricket = NavLink("cricket", "/sport/cricket", "sport/cricket")
  var rugbyUnion = NavLink("rugby union", "/sport/rugby-union", "sport/rugby-union")
  var formulaOne = NavLink("F1", "/sport/formulaone", "sport/formulaone")
  var tennis = NavLink("tennis", "/sport/tennis", "sport/tennis")
  var golf = NavLink("golf", "/sport/golf", "sport/golf")
  var cycling = NavLink("cycling", "/sport/cycling", "sport/cycling")
  var boxing = NavLink("boxing", "/sport/boxing", "sport/boxing")
  var usSports = NavLink("US sports", "/sport/us-sport", "sport/us-sport")
  val racing = NavLink("racing", "/sport/horse-racing", "sport/horse-racing")
  val rugbyLeague = NavLink("rugby league", "/sport/rugbyleague", "sport/rugbyleague")
  val australiaSport = NavLink("australia sport", "/sport/australia-sport", "sport/australia-sport")
  val AFL = NavLink("AFL", "/sport/afl", "sport/afl")
  val NRL = NavLink("NRL", "/sport/nrl", "sport/nrl")
  val aLeague = NavLink("a-league", "/football/a-league", "football/a-league")
  val NFL = NavLink("NFL", "/sport/nfl", "sport/nfl")
  val MLS = NavLink("MLS", "/football/mls", "football/mls")
  val MLB = NavLink("MLB", "/sport/mlb", "sport/mlb")
  val NBA = NavLink("NBA", "/sport/nba", "sport/nba")
  val NHL = NavLink("NHL", "/sport/nhl", "sport/nhl")

  /* ARTS */
  val culture = NavLink("arts", "/culture", "culture", longTitle = "culture home", iconName = "home")
  val film = NavLink("film", "/film", "film")
  val tvAndRadio = NavLink("tv & radio", "/tv-and-radio", "tv-and-radio")
  val music = NavLink("music", "/music", "music")
  val games = NavLink("games", "/technology/games", "technology/games")
  val books = NavLink("books", "/books", "books")
  val artAndDesign = NavLink("art & design", "/artanddesign", "artanddesign")
  val stage = NavLink("stage", "/stage", "stage")
  val classical = NavLink("classical", "/music/classicalmusicandopera", "music/classicalmusicandopera")

  /* LIFE */
  val lifestyle = NavLink("life", "/lifeandstyle", "lifeandstyle", longTitle = "lifestyle home", iconName = "home")
  val fashion = NavLink("fashion", "/fashion", "fashion")
  val food = NavLink("food", "/lifeandstyle/food-and-drink", "lifeandstyle/food-and-drink")
  val travel = NavLink("travel", "/travel", "travel")
  val loveAndSex = NavLink("love & sex", "/lifeandstyle/love-and-sex", "lifeandstyle/love-and-sex")
  var family = NavLink("family", "/lifeandstyle/family", "lifeandstyle/family")
  var home = NavLink("home & garden", "/lifeandstyle/home-and-garden", "lifeandstyle/home-and-garden")
  var health = NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing", "lifeandstyle/health-and-wellbeing")
  var women = NavLink("women", "/lifeandstyle/women", "lifeandstyle/women")
  var recipes = NavLink("recipes", "/tone/recipes", "tone/recipes")
  val travelUk = NavLink("UK", "/travel/uk", "travel/uk")
  val travelEurope = NavLink("europe", "/travel/europe", "travel/europe")
  val travelUs = NavLink("US", "/travel/usa", "travel/usa")
  val skiing = NavLink("skiing", "/travel/skiing", "travel/skiing")
  val travelAustralasia = NavLink("australasia", "/travel/australasia", "travel/australasia")
  val travelAsia = NavLink("asia", "/travel/asia", "travel/asia")

  val todaysPaper = NavLink("today's paper", "/theguardian")
  val observer = NavLink("the observer", "/observer")
  val crosswords = NavLink("crosswords", "/crosswords")
  val video =  NavLink("video", "/video")
  val jobs = NavLink("jobs", "https://jobs.theguardian.com")
  val dating = NavLink("dating", "https://soulmates.theguardian.com")
  val apps = NavLink("apps", "/global/ng-interactive/2014/may/29/-sp-the-guardian-app-for-ios-and-android")
  val masterClasses = NavLink("masterclasses", "/guardian-masterclasses")

  val tagPages = List(
    "technology/games",
    "us-news/us-politics",
    "australia-news/australian-politics",
    "australia-news/australian-immigration-and-asylum",
    "australia-news/indigenous-australians",
    "uk/scotland",
    "uk/wales",
    "uk/northernireland",
    "world/europe-news",
    "world/americas",
    "world/asia",
    "world/africa",
    "world/middleeast",
    "business/economics",
    "business/banking",
    "business/retail",
    "business/stock-markets",
    "business/eurozone",
    "us/sustainable-business",
    "business/diversity-and-equality",
    "business/us-small-business",
    "environment/climate-change",
    "environment/wildlife",
    "environment/energy",
    "environment/pollution",
    "money/property",
    "money/pensions",
    "money/savings",
    "money/debt",
    "money/work-and-careers",
    "cartoons/archive",
    "profile/editorial",
    "index/contributors",
    "commentisfree/series/comment-is-free-weekly",
    "sport/rugby-union",
    "sport/cricket",
    "sport/tennis",
    "sport/cycling",
    "sport/golf",
    "sport/us-sport",
    "sport/horse-racing",
    "sport/rugbyleague",
    "sport/boxing",
    "sport/formulaone",
    "sport/nfl",
    "sport/mlb",
    "football/mls",
    "sport/nba",
    "sport/nhl",
    "sport/afl",
    "football/a-league",
    "sport/nrl",
    "sport/australia-sport",
    "music/classicalmusicandopera",
    "lifeandstyle/food-and-drink",
    "tone/recipes",
    "lifeandstyle/women",
    "lifeandstyle/health-and-wellbeing",
    "lifeandstyle/family",
    "lifeandstyle/home-and-garden",
    "lifeandstyle/love-and-sex",
    "travel/uk",
    "travel/europe",
    "travel/usa",
    "travel/skiing",
    "travel/australasia",
    "travel/asia"
  )
}
