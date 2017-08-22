package navigation

import Pillars._

object NavLinks2 {

// News
  val networkFront = NavLink2("", "/", "headlines", newsPillar, None, Some(NetworkFrontSections))
  val ukNews = NavLink2("uk-news", "/uk-news", "UK", newsPillar, None, Some(UkNewsSubnav))
  val world = NavLink2("world", "/world", "world", newsPillar, None, Some(WorldSubnav))
  val environment = NavLink2("environment", "/environment", "environment", newsPillar, None, Some(EnvironmentSubnav))
  val business = NavLink2("business", "/business", "business", newsPillar, None, Some(BusinessSubnav))
  val economy = business.copy(title = "economy")
  val money = NavLink2("money", "/money", "money", newsPillar, None, Some(MoneySubnav))
  val science = NavLink2("science", "/science", "science", newsPillar, None, None)
  val tech = NavLink2("tech", "/technology", "technology", newsPillar, None, None)
  val politics = NavLink2("politics", "/politics", "UK politics", newsPillar, Some(ukNews), None)
  val media = NavLink2("media", "/media", "media", newsPillar, Some(ukNews), None)
  val cities = NavLink2("cities", "/cities", "cities", newsPillar, Some(world), None)
  val globalDevelopment = NavLink2("global-development", "/global-development", "global development", newsPillar, Some(world), None)
  val australiaNews = NavLink2("australia-news", "/australia-news", "australia", newsPillar, None, None)
  val auPolitics = NavLink2("australia-news/australian-politics", "/australia-news/australian-politics", "AU politics", newsPillar, None, None)
  val auImmigration = NavLink2("australia-news/australian-immigration-and-asylum", "/australia-news/australian-immigration-and-asylum", "immigration", newsPillar, None, None)
  val indigenousAustralia = NavLink2("australia-news/indigenous-australians", "/australia-news/indigenous-australians", "indigenous australia", newsPillar, None, None)
  val indigenousAustraliaOpinion = NavLink2("commentisfree/series/indigenousx", "/commentisfree/series/indigenousx", "Indigenous", newsPillar, None, None)
  val usNews = NavLink2("us-news", "/us-news", "US", newsPillar, None, None)
  val usPolitics = NavLink2("us-news/us-politics", "/us-news/us-politics", "US politics", newsPillar, None, None)
  val education = NavLink2("education", "/education", "education", newsPillar, Some(ukNews), None)
  val society = NavLink2("society", "/society", "society", newsPillar, Some(ukNews), None)
  val law = NavLink2("law", "/law", "law", newsPillar, Some(ukNews), None)
  val scotland = NavLink2("uk/scotland", "/uk/scotland", "scotland", newsPillar, Some(ukNews), None)
  val wales = NavLink2("wales", "/uk/wales", "uk/wales", newsPillar, Some(ukNews), None)
  val northernIreland = NavLink2("uk/northern ireland", "/uk/northernireland", "northernireland", newsPillar, Some(ukNews), None)
  val europe = NavLink2("world/europe-news", "/world/europe-news", "europe", newsPillar, Some(world), None)
  val americas = NavLink2("world/americas", "/world/americas", "americas", newsPillar, Some(world), None)
  val asia = NavLink2("world/asia", "/world/asia", "asia", newsPillar, Some(world), None)
  val africa = NavLink2("world/africa", "/world/africa", "africa", newsPillar, Some(world), None)
  val middleEast = NavLink2("world/middleeast", "/world/middleeast", "middle east", newsPillar, Some(world), None)
  val economics = NavLink2("business/economics", "/business/economics", "economics", newsPillar, Some(business), None)
  val inequality = NavLink2("inequality", "/inequality", "inequality", newsPillar, Some(world), None)
  val banking = NavLink2("business/banking", "/business/banking", "banking", newsPillar, Some(business), None)
  val retail = NavLink2("business/retail", "/business/retail", "retail", newsPillar, None, None)
  val markets = NavLink2("business/stock-markets", "/business/stock-markets", "markets", newsPillar, Some(business), None)
  val eurozone = NavLink2("business/eurozone", "/business/eurozone", "eurozone", newsPillar, Some(business), None)
  val sustainableBusiness = NavLink2("us/sustainable-business", "/us/sustainable-business", "sustainable business", newsPillar, Some(business), None)
  val diversityEquality = NavLink2("business/diversity-and-equality", "/business/diversity-and-equality", "diversity & equality in business", newsPillar, Some(business), None)
  val smallBusiness = NavLink2("business/us-small-business", "/business/us-small-business", "small business", newsPillar, Some(business), None)
  val climateChange = NavLink2("environment/climate-change", "/environment/climate-change", "climate change", newsPillar, Some(environment), None)
  val wildlife = NavLink2("environment/wildlife", "/environment/wildlife", "wildlife", newsPillar, Some(environment), None)
  val energy = NavLink2("environment/energy", "/environment/energy", "energy", newsPillar, Some(environment), None)
  val pollution = NavLink2("environment/pollution", "/environment/pollution", "pollution", newsPillar, Some(environment), None)
  val property = NavLink2("money/property", "/money/property", "property", newsPillar, Some(money), None)
  val pensions = NavLink2("money/pensions", "/money/pensions", "pensions", newsPillar, Some(money), None)
  val savings = NavLink2("money/savings", "/money/savings", "savings", newsPillar, Some(money), None)
  val borrowing = NavLink2("money/debt", "/money/debt", "borrowing", newsPillar, Some(money), None)
  val careers = NavLink2("money/work-and-careers", "/money/work-and-careers", "careers", newsPillar, Some(money), None)
  val obituaries = NavLink2("obituaries", "/tone/obituaries", "obituaries",  newsPillar, None, None)

// Opinion
  val opinion = NavLink2("commentisfree", "/commentisfree", "opinion", opinionPillar,None, None)
  val columnists = NavLink2("index/contributors", "/index/contributors", "columnists", opinionPillar,None, None)
  val auColumnists = NavLink2("au/index/contributors", "/au/index/contributors", "columnists", opinionPillar,None, None)
  val theGuardianView = NavLink2("profile/editorial", "/profile/editorial", "the guardian view", opinionPillar,None, None)
  val cartoons = NavLink2("cartoons/archive", "/cartoons/archive", "cartoons", opinionPillar,None, None)
  val inMyOpinion = NavLink2("commentisfree/series/comment-is-free-weekly", "/commentisfree/series/comment-is-free-weekly", "opinion videos", opinionPillar,None, None)
  val letters = NavLink2("", "/tone/letters", "letters", opinionPillar,None, None)

// Sport
  val sport = NavLink2("sport", "/sport", "sport", sportPillar, None, None)
  val football = NavLink2("football", "/football", "football", sportPillar, None, None)
  val soccer = football.copy(title = "soccer")
  val cricket = NavLink2("sport/cricket", "/sport/cricket", "cricket", sportPillar, None, None)
  val cycling = NavLink2("sport/cycling", "/sport/cycling", "cycling", sportPillar, None, None)
  val rugbyUnion = NavLink2("sport/rugby-union", "/sport/rugby-union", "rugby union", sportPillar, None, None)
  val formulaOne = NavLink2("sport/formulaone", "/sport/formulaone", "F1", sportPillar, None, None)
  val tennis = NavLink2("sport/tennis", "/sport/tennis", "tennis", sportPillar, None, None)
  val golf = NavLink2("sport/golf", "/sport/golf", "golf", sportPillar, None, None)
  val boxing = NavLink2("sport/boxing", "/sport/boxing", "boxing", sportPillar, None, None)
  val usSports = NavLink2("sport/us-sport", "/sport/us-sport", "US sports", sportPillar, None, None)
  val racing = NavLink2("sport/horse-racing", "/sport/horse-racing", "racing", sportPillar, None, None)
  val rugbyLeague = NavLink2("sport/rugbyleague", "/sport/rugbyleague", "rugby league", sportPillar, None, None)
  val australiaSport = NavLink2("sport/australia-sport", "/sport/australia-sport", "australia sport", sportPillar, None, None)
  val AFL = NavLink2("sport/afl", "/sport/afl", "AFL", sportPillar, None, None)
  val NRL = NavLink2("sport/nrl", "/sport/nrl", "NRL", sportPillar, None, None)
  val aLeague = NavLink2("football/a-league", "/football/a-league", "a-league", sportPillar, None, None)
  val NFL = NavLink2("sport/nfl", "/sport/nfl", "NFL", sportPillar, None, None)
  val MLS = NavLink2("football/mls", "/football/mls", "MLS", sportPillar, None, None)
  val MLB = NavLink2("sport/mlb", "/sport/mlb", "MLB", sportPillar, None, None)
  val NBA = NavLink2("sport/nba", "/sport/nba", "NBA", sportPillar, None, None)
  val NHL = NavLink2("sport/nhl", "/sport/nhl", "NHL", sportPillar, None, None)

// Arts
  val arts = NavLink2("culture", "/culture", "arts", artsPillar, None, None)
  val film = NavLink2("film", "/film", "film", artsPillar, None, None)
  val tvAndRadio = NavLink2("tv-and-radio", "/tv-and-radio", "tv & radio", artsPillar, None, None)
  val music = NavLink2("music", "/music", "music", artsPillar, None, None)
  val games = NavLink2("technology/games", "/technology/games", "games", artsPillar, None, None)
  val books = NavLink2("books", "/books", "books", artsPillar, None, None)
  val artAndDesign = NavLink2("artanddesign", "/artanddesign", "art & design", artsPillar, None, None)
  val stage = NavLink2("stage", "/stage", "stage", artsPillar, None, None)
  val classical = NavLink2("music/classicalmusicandopera", "/music/classicalmusicandopera", "classical", artsPillar, None, None)

// Life
  val life = NavLink2("lifeandstyle", "/lifeandstyle", "life", lifePillar, None, None)
  val fashion = NavLink2("fashion", "/fashion", "fashion", lifePillar, None, None)
  val fashionAu = NavLink2("au/lifeandstyle/fashion", "/au/lifeandstyle/fashion", "fashion", lifePillar, None, None)
  val food = NavLink2("lifeandstyle/food-and-drink", "/lifeandstyle/food-and-drink", "food", lifePillar, None, None)
  val foodAu = NavLink2("au/lifeandstyle/food-and-drink", "/au/lifeandstyle/food-and-drink", "food", lifePillar, None, None)
  val travel = NavLink2("travel", "/travel", "travel", lifePillar, None, None)
  val relationshipsAu = NavLink2("au/lifeandstyle/relationships", "/au/lifeandstyle/relationships", "relationships", lifePillar, None, None)
  val loveAndSex = NavLink2("lifeandstyle/love-and-sex", "/lifeandstyle/love-and-sex", "love & sex", lifePillar, None, None)
  val family = NavLink2("lifeandstyle/family", "/lifeandstyle/family", "family", lifePillar, None, None)
  val home = NavLink2("lifeandstyle/home-and-garden", "/lifeandstyle/home-and-garden", "home & garden", lifePillar, None, None)
  val health = NavLink2("lifeandstyle/health-and-wellbeing", "/lifeandstyle/health-and-wellbeing", "health & fitness", lifePillar, None, None)
  val healthAu = NavLink2("au/lifeandstyle/health-and-wellbeing", "/au/lifeandstyle/health-and-wellbeing", "health & fitness", lifePillar, None, None)
  val women = NavLink2("lifeandstyle/women", "/lifeandstyle/women", "women", lifePillar, None, None)
  val recipes = NavLink2("tone/recipes", "/tone/recipes", "recipes", lifePillar, None, None)
  val travelUk = NavLink2("travel/uk", "/travel/uk", "UK", lifePillar, Some(travel), None)
  val travelEurope = NavLink2("travel/europe", "/travel/europe", "europe", lifePillar, Some(travel), None)
  val travelUs = NavLink2("travel/usa", "/travel/usa", "US", lifePillar, Some(travel), None)
  val skiing = NavLink2("travel/skiing", "/travel/skiing", "skiing", lifePillar, Some(travel), None)
  val travelAustralasia = NavLink2("travel/australasia", "/travel/australasia", "australasia", lifePillar, Some(travel), None)
  val travelAsia = NavLink2("travel/asia", "/travel/asia", "asia", lifePillar, Some(travel), None)


// Other
  val todaysPaper = NavLink2("theguardian", "/theguardian", "today's paper", newsPillar, None, None)
  val observer = NavLink2("observer", "/observer", "the observer", newsPillar, None, None)
  val crosswords = NavLink2("crosswords", "/crosswords", "crosswords", newsPillar, None, None)
  val video =  NavLink2("video", "/video", "video", newsPillar, None, None)
  val podcasts =  NavLink2("podcasts", "/podcasts", "podcasts", newsPillar, None, None)
  val pictures =  NavLink2("pictures", "/inpictures", "pictures", newsPillar, None, None)
  val newsletters =  NavLink2("", "/email-newsletters", "newsletters", newsPillar, None, None)
}

object NavLinks {

  val todaysPaper = NavLink("today's paper", "/theguardian", "theguardian")
  val observer = NavLink("the observer", "/observer", "observer")
  val digitalNewspaperArchive = NavLink("digital archive", "https://theguardian.newspapers.com")
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
  var holidays = NavLink("holidays", "https://holidays.theguardian.com")

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
