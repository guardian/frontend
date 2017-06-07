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
  val tech = NavLink("tech", "/technology", "technology")
  val politics = NavLink("UK politics", "/politics", "politics")
  val media = NavLink("media", "/media", "media")
  val cities = NavLink("cities", "/cities", "cities")
  val globalDevelopment = NavLink("global development", "/global-development", "global-development")
  val australiaNews = NavLink("australia", "/australia-news", "australia-news", longTitle = "australia news")
  val auPolitics = NavLink("AU politics", "/australia-news/australian-politics", "australia-news/australian-politics", longTitle = "australian politics")
  val auImmigration = NavLink("immigration", "/australia-news/australian-immigration-and-asylum", "australia-news/australian-immigration-and-asylum")
  val indigenousAustralia = NavLink("indigenous australia", "/australia-news/indigenous-australians", "australia-news/indigenous-australians")
  val indigenousAustraliaOpinion = NavLink("Indigenous", "/commentisfree/series/indigenousx", "commentisfree/series/indigenousx")
  val usNews = NavLink("US", "/us-news", "us-news", longTitle = "US news")
  val usPolitics = NavLink("US politics", "/us-news/us-politics", "us-news/us-politics", longTitle = "US politics")
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
  val obituaries = NavLink("obituaries", "/tone/obituaries")
  val ukElection2017 = NavLink("election", "/politics/general-election-2017")

  /* OPINION */
  val opinion = NavLink("opinion", "/commentisfree", longTitle = "opinion home", iconName = "home", uniqueSection = "commentisfree")
  val columnists = NavLink("columnists", "/index/contributors", "index/contributors")
  val auColumnists = NavLink("columnists", "/au/index/contributors", "au/index/contributors")
  val theGuardianView = NavLink("the guardian view", "/profile/editorial", "profile/editorial")
  val cartoons = NavLink("cartoons", "/cartoons/archive", "cartoons/archive")
  val inMyOpinion = NavLink("opinion videos", "/commentisfree/series/comment-is-free-weekly", "commentisfree/series/comment-is-free-weekly")
  val letters = NavLink("letters", "/theguardian/mainsection/editorialsandreply")
  val editorials = NavLink("editorials", "/tone/editorials")

  /* SPORT */
  val sport = NavLink("sport", "/sport", longTitle = "sport home", iconName = "home", uniqueSection = "sport")
  val football = NavLink("football", "/football", uniqueSection = "football")
  val soccer = football.copy(title = "soccer")
  val cricket = NavLink("cricket", "/sport/cricket", "sport/cricket")
  val rugbyUnion = NavLink("rugby union", "/sport/rugby-union", "sport/rugby-union")
  val formulaOne = NavLink("F1", "/sport/formulaone", "sport/formulaone")
  val tennis = NavLink("tennis", "/sport/tennis", "sport/tennis")
  val golf = NavLink("golf", "/sport/golf", "sport/golf")
  val boxing = NavLink("boxing", "/sport/boxing", "sport/boxing")
  val usSports = NavLink("US sports", "/sport/us-sport", "sport/us-sport")
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
  val fashionAu = NavLink("fashion", "/au/lifeandstyle/fashion", "au/lifeandstyle/fashion")
  val food = NavLink("food", "/lifeandstyle/food-and-drink", "lifeandstyle/food-and-drink")
  val foodAu = NavLink("food", "/au/lifeandstyle/food-and-drink", "au/lifeandstyle/food-and-drink")
  val travel = NavLink("travel", "/travel", "travel")
  val relationshipsAu = NavLink("relationships", "/au/lifeandstyle/relationships", "au/lifeandstyle/relationships")
  val loveAndSex = NavLink("love & sex", "/lifeandstyle/love-and-sex", "lifeandstyle/love-and-sex")
  val family = NavLink("family", "/lifeandstyle/family", "lifeandstyle/family")
  val home = NavLink("home & garden", "/lifeandstyle/home-and-garden", "lifeandstyle/home-and-garden")
  val health = NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing", "lifeandstyle/health-and-wellbeing")
  val healthAu = NavLink("health & fitness", "/au/lifeandstyle/health-and-wellbeing", "au/lifeandstyle/health-and-wellbeing")
  val women = NavLink("women", "/lifeandstyle/women", "lifeandstyle/women")
  val recipes = NavLink("recipes", "/tone/recipes", "tone/recipes")
  val travelUk = NavLink("UK", "/travel/uk", "travel/uk")
  val travelEurope = NavLink("europe", "/travel/europe", "travel/europe")
  val travelUs = NavLink("US", "/travel/usa", "travel/usa")
  val skiing = NavLink("skiing", "/travel/skiing", "travel/skiing")
  val travelAustralasia = NavLink("australasia", "/travel/australasia", "travel/australasia")
  val travelAsia = NavLink("asia", "/travel/asia", "travel/asia")

  val todaysPaper = NavLink("today's paper", "/theguardian", "theguardian")
  val observer = NavLink("the observer", "/observer", "observer")
  val digitalNewspaperArchive = NavLink("digital newspaper archive", "https://theguardian.newspapers.com")
  val crosswords = NavLink("crosswords", "/crosswords", "crosswords")
  val video =  NavLink("video", "/video")
  val podcasts =  NavLink("podcasts", "/podcasts")
  val pictures =  NavLink("pictures", "/inpictures")
  val newsletters =  NavLink("newsletters", "/email-newsletters")
  val jobs = NavLink("jobs", "https://jobs.theguardian.com")
  val dating = NavLink("dating", "https://soulmates.theguardian.com")
  val apps = NavLink("the guardian app", "https://app.adjust.com/f8qm1x_8q69t7?campaign=NewHeader&adgroup=Mobile&creative=generic")
  val ukMasterClasses = NavLink("masterclasses", "/guardian-masterclasses?INTCMP=masterclasses_uk_web_newheader")
  val auEvents = NavLink("events", "/guardian-live-australia")

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
    "type/cartoon",
    "profile/editorial",
    "au/index/contributors",
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
    "au/lifeandstyle/fashion",
    "au/lifeandstyle/food-and-drink",
    "au/lifeandstyle/relationships",
    "au/lifeandstyle/health-and-wellbeing",
    "travel/uk",
    "travel/europe",
    "travel/usa",
    "travel/skiing",
    "travel/australasia",
    "travel/asia",
    "theguardian",
    "observer",
    "football/live",
    "football/tables",
    "football/competitions",
    "football/results",
    "football/fixtures",
    "education"
  )
}
