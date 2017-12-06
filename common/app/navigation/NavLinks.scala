package navigation

object NavLinks {
  /* NEWS */
  val science = NavLink("science", "/science")
  val tech = NavLink("tech", "/technology")
  val politics = NavLink("UK politics", "/politics")
  val media = NavLink("media", "/media", "media")
  val cities = NavLink("cities", "/cities", "cities")
  val globalDevelopment = NavLink("global development", "/global-development")
  val australiaNews = NavLink("australia", "/australia-news", longTitle = "australia news")
  val auPolitics = NavLink("AU politics", "/australia-news/australian-politics", longTitle = "politics")
  val auImmigration = NavLink("immigration", "/australia-news/australian-immigration-and-asylum")
  val indigenousAustralia = NavLink("indigenous australia", "/australia-news/indigenous-australians")
  val indigenousAustraliaOpinion = NavLink("Indigenous", "/commentisfree/series/indigenousx")
  val usNews = NavLink("US", "/us-news", longTitle = "US news")
  val usPolitics = NavLink("US politics", "/us-news/us-politics", longTitle = "US politics")
  val education = NavLink("education", "/education")
  val society = NavLink("society", "/society")
  val law = NavLink("law", "/law")
  val scotland = NavLink("scotland", "/uk/scotland")
  val wales = NavLink("wales", "/uk/wales")
  val northernIreland = NavLink("northern ireland", "/uk/northernireland")
  val europe = NavLink("europe", "/world/europe-news")
  val americas = NavLink("americas", "/world/americas")
  val asia = NavLink("asia", "/world/asia")
  val africa = NavLink("africa", "/world/africa")
  val middleEast = NavLink("middle east", "/world/middleeast")
  val economics = NavLink("economics", "/business/economics")
  val inequality = NavLink("inequality", "/inequality")
  val banking = NavLink("banking", "/business/banking")
  val retail = NavLink("retail", "/business/retail")
  val markets = NavLink("markets", "/business/stock-markets")
  val eurozone = NavLink("eurozone", "/business/eurozone")
  val businessToBusiness = NavLink("b2b", "/business-to-business")
  val sustainableBusiness = NavLink("sustainable business", "/us/sustainable-business")
  val diversityEquality = NavLink("diversity & equality in business", "/business/diversity-and-equality")
  val smallBusiness = NavLink("small business", "/business/us-small-business")
  val projectSyndicate = NavLink("project syndicate", "/business/series/project-syndicate-economists")
  val climateChange = NavLink("climate change", "/environment/climate-change")
  val wildlife = NavLink("wildlife", "/environment/wildlife")
  val energy = NavLink("energy", "/environment/energy")
  val pollution = NavLink("pollution", "/environment/pollution")
  val property = NavLink("property", "/money/property")
  val pensions = NavLink("pensions", "/money/pensions")
  val savings = NavLink("savings", "/money/savings")
  val borrowing = NavLink("borrowing", "/money/debt")
  val careers = NavLink("careers", "/money/work-and-careers")
  val obituaries = NavLink("obituaries", "/tone/obituaries")
  val ukNews = NavLink("UK", "/uk-news", longTitle = "UK news",
    children = List(politics, education, media, society, law, scotland, wales, northernIreland)
  )
  val world = NavLink("world", "/world", longTitle = "world news",
    children = List(europe, usNews, americas, asia, australiaNews, middleEast, africa, inequality, cities, globalDevelopment)
  )

  val ukEnvironment = NavLink("environment", "/environment",
    children = List(climateChange, wildlife, energy, pollution)
  )
  val auEnvironment = ukEnvironment.copy(
    children = List(cities, globalDevelopment, sustainableBusiness)
  )

  val money = NavLink("money", "/money",
    children = List(property, pensions, savings, borrowing, careers)
  )

  val ukBusiness = NavLink("business", "/business",
    children = List(economics, banking, money, markets, projectSyndicate, businessToBusiness)
  )

  val usBusiness = ukBusiness.copy(
    children = List(economics, sustainableBusiness, diversityEquality, smallBusiness)
  )
  val auBusiness = ukBusiness.copy(
    children = List( markets, money, projectSyndicate)
  )

  /* OPINION */
  val columnists = NavLink("columnists", "/index/contributors")
  val auColumnists = NavLink("columnists", "/au/index/contributors")
  val theGuardianView = NavLink("the guardian view", "/profile/editorial")
  val cartoons = NavLink("cartoons", "/cartoons/archive")
  val inMyOpinion = NavLink("opinion videos", "/commentisfree/series/comment-is-free-weekly")
  val letters = NavLink("letters", "/tone/letters")

  /* SPORT */
  val football = NavLink("football", "/football",
    children = List(
      NavLink("live scores", "/football/live", "football/live"),
      NavLink("tables", "/football/tables", "football/tables"),
      NavLink("competitions", "/football/competitions", "football/competitions"),
      NavLink("results", "/football/results", "football/results"),
      NavLink("fixtures", "/football/fixtures", "football/fixtures"),
      NavLink("clubs", "/football/teams", "football/teams")
    )
  )
  val soccer = football.copy(title = "soccer")
  val cricket = NavLink("cricket", "/sport/cricket")
  val cycling = NavLink("cycling", "/sport/cycling")
  val rugbyUnion = NavLink("rugby union", "/sport/rugby-union")
  val formulaOne = NavLink("F1", "/sport/formulaone")
  val tennis = NavLink("tennis", "/sport/tennis")
  val golf = NavLink("golf", "/sport/golf")
  val boxing = NavLink("boxing", "/sport/boxing")
  val usSports = NavLink("US sports", "/sport/us-sport")
  val racing = NavLink("racing", "/sport/horse-racing")
  val rugbyLeague = NavLink("rugby league", "/sport/rugbyleague")
  val australiaSport = NavLink("australia sport", "/sport/australia-sport")
  val AFL = NavLink("AFL", "/sport/afl")
  val NRL = NavLink("NRL", "/sport/nrl")
  val aLeague = NavLink("a-league", "/football/a-league")
  val NFL = NavLink("NFL", "/sport/nfl")
  val MLS = NavLink("MLS", "/football/mls")
  val MLB = NavLink("MLB", "/sport/mlb")
  val NBA = NavLink("NBA", "/sport/nba")
  val NHL = NavLink("NHL", "/sport/nhl")

  /* ARTS */
  val film = NavLink("film", "/film")
  val tvAndRadio = NavLink("tv & radio", "/tv-and-radio")
  val music = NavLink("music", "/music")
  val games = NavLink("games", "/games")
  val books = NavLink("books", "/books")
  val artAndDesign = NavLink("art & design", "/artanddesign")
  val stage = NavLink("stage", "/stage")
  val classical = NavLink("classical", "/music/classicalmusicandopera")

  /* LIFE */
  val fashion = NavLink("fashion", "/fashion")
  val fashionAu = NavLink("fashion", "/au/lifeandstyle/fashion")
  val food = NavLink("food", "/lifeandstyle/food-and-drink")
  val foodAu = NavLink("food", "/au/lifeandstyle/food-and-drink")
  val relationshipsAu = NavLink("relationships", "/au/lifeandstyle/relationships")
  val loveAndSex = NavLink("love & sex", "/lifeandstyle/love-and-sex")
  val family = NavLink("family", "/lifeandstyle/family")
  val home = NavLink("home & garden", "/lifeandstyle/home-and-garden")
  val health = NavLink("health & fitness", "/lifeandstyle/health-and-wellbeing")
  val healthAu = NavLink("health & fitness", "/au/lifeandstyle/health-and-wellbeing")
  val women = NavLink("women", "/lifeandstyle/women")
  val recipes = NavLink("recipes", "/tone/recipes")
  val travelUk = NavLink("UK", "/travel/uk")
  val travelEurope = NavLink("europe", "/travel/europe")
  val travelUs = NavLink("US", "/travel/usa")
  val skiing = NavLink("skiing", "/travel/skiing")
  val travelAustralasia = NavLink("australasia", "/travel/australasia")
  val travelAsia = NavLink("asia", "/travel/asia")
  val ukTravel = NavLink("travel", "/travel",
    children = List(travelUk, travelEurope, travelUs)
  )
  val usTravel = ukTravel.copy(
    children = List(travelUs, travelEurope, travelUk)
  )
  val auTravel = ukTravel.copy(
    children = List(travelAustralasia, travelAsia, travelUk, travelEurope, travelUs)
  )

  val todaysPaper = NavLink("today's paper", "/theguardian",
    children = List(
      NavLink("obituaries", "/tone/obituaries"),
      NavLink("g2", "/theguardian/g2"),
      NavLink("weekend", "/theguardian/weekend"),
      NavLink("the guide", "/theguardian/theguide"),
      NavLink("saturday review", "/theguardian/guardianreview")
    )
  )
  val observer = NavLink("the observer", "/observer",
    children = List(
      NavLink("comment", "/theobserver/news/comment"),
      NavLink("the new review", "/theobserver/new-review"),
      NavLink("observer magazine", "/theobserver/magazine")
    )
  )
  val digitalNewspaperArchive = NavLink("digital archive", "https://theguardian.newspapers.com")
  val crosswords = NavLink("crosswords", "/crosswords",
    children = List(
      NavLink("blog", "/crosswords/crossword-blog"),
      NavLink("editor", "/crosswords/series/crossword-editor-update"),
      NavLink("quick", "/crosswords/series/quick"),
      NavLink("cryptic", "/crosswords/series/cryptic"),
      NavLink("prize", "/crosswords/series/prize"),
      NavLink("weekend", "/crosswords/series/weekend-crossword"),
      NavLink("quiptic", "/crosswords/series/quiptic"),
      NavLink("genius", "/crosswords/series/genius"),
      NavLink("speedy", "/crosswords/series/speedy"),
      NavLink("everyman", "/crosswords/series/everyman"),
      NavLink("azed", "/crosswords/series/azed")
    )
  )
  val video = NavLink("video", "/video")
  val podcasts = NavLink("podcasts", "/podcasts")
  val pictures = NavLink("pictures", "/inpictures")
  val newsletters = NavLink("newsletters", "/email-newsletters")
  val jobs = NavLink("jobs", "https://jobs.theguardian.com")
  val dating = NavLink("dating", "https://soulmates.theguardian.com")
  val apps = NavLink("the guardian app", "https://app.adjust.com/f8qm1x_8q69t7?campaign=NewHeader&adgroup=Mobile&creative=generic")
  val ukMasterClasses = NavLink("masterclasses", "https://membership.theguardian.com/masterclasses?INTCMP=masterclasses_uk_web_newheader")
  val auEvents = NavLink("events", "/guardian-live-australia")
  var holidays = NavLink("holidays", "https://holidays.theguardian.com")

  // News Pillar
  val ukNewsPillar = NavLink("news", "/", longTitle = "headlines", iconName = "home",
    List(
      ukNews,
      world,
      ukBusiness,
      football,
      ukEnvironment,
      tech,
      politics,
      science,
      globalDevelopment,
      cities,
      obituaries
    )
  )
  val auNewsPillar = ukNewsPillar.copy(
    children = List(
      australiaNews,
      world,
      auPolitics,
      auEnvironment,
      football,
      indigenousAustralia,
      auImmigration,
      media,
      auBusiness
    )
  )
  val usNewsPillar = ukNewsPillar.copy(children = List(
      usNews,
      world,
      ukEnvironment,
      soccer,
      usPolitics,
      usBusiness,
      science,
      money,
      tech,
      obituaries
    )
  )
  val intNewsPillar = ukNewsPillar.copy(
    children = List(
      world,
      ukNews,
      science,
      cities,
      globalDevelopment,
      football,
      tech,
      ukBusiness,
      ukEnvironment,
      obituaries
    )
  )

  // Opinion Pillar
  val ukOpinionPillar = NavLink("opinion", "/commentisfree", longTitle = "opinion home", iconName = "home",
    List(
      theGuardianView,
      columnists,
      cartoons,
      inMyOpinion,
      letters
    )
  )
  val auOpinionPillar = ukOpinionPillar.copy(
    children = List(
      auColumnists,
      cartoons,
      indigenousAustraliaOpinion,
      theGuardianView.copy(title = "editorials"),
      letters
    )
  )
  val usOpinionPillar = ukOpinionPillar.copy(
    children = List(
      theGuardianView,
      columnists,
      letters,
      inMyOpinion,
      cartoons
    )
  )
  val intOpinionPillar = ukOpinionPillar.copy(
    children = List(
      theGuardianView,
      columnists,
      cartoons,
      inMyOpinion,
      letters
    )
  )

  //Sport Pillar
  val ukSportPillar = NavLink("sport", "/sport", longTitle = "sport home", iconName = "home",
    List(
      football,
      rugbyUnion,
      cricket,
      tennis,
      cycling,
      formulaOne,
      rugbyLeague,
      racing,
      usSports,
      golf
    )
  )
  val auSportPillar = ukSportPillar.copy(
    children = List(
      football,
      AFL,
      NRL,
      aLeague,
      cricket,
      rugbyUnion,
      tennis
    )
  )
  val usSportPillar = ukSportPillar.copy(
    children = List(
      soccer,
      NFL,
      tennis,
      MLB,
      MLS,
      NBA,
      NHL
    )
  )
  val intSportPillar = ukSportPillar.copy(
    children = List(
      football,
      rugbyUnion,
      cricket,
      tennis,
      cycling,
      formulaOne,
      golf,
      usSports
    )
  )

  // Arts Pillar
  val ukArtsPillar = NavLink("arts", "/culture", longTitle = "culture home", iconName = "home",
    List(
      tvAndRadio,
      music,
      film,
      stage,
      books,
      games,
      artAndDesign,
      classical
    )
  )
  val auArtsPillar = ukArtsPillar.copy(
    children = List(
      film, music,
      books,
      tvAndRadio,
      artAndDesign,
      stage,
      games,
      classical
    )
  )
  val usArtsPillar = ukArtsPillar.copy(
    children = List(
      film,
      books,
      music,
      artAndDesign,
      tvAndRadio,
      stage,
      classical,
      games
    )
  )
  val intArtsPillar = ukArtsPillar.copy(
    children = List(
      books,
      music,
      tvAndRadio,
      artAndDesign,
      film,
      games,
      classical,
      stage
    )
  )

  // Lifestyle Pillar
  val ukLifestylePillar = NavLink("lifestyle", "/lifeandstyle", longTitle = "lifestyle home", iconName = "home",
    List(
      fashion,
      food,
      recipes,
      ukTravel,
      loveAndSex,
      family,
      home,
      health,
      women,
      money
    )
  )
  val auLifestylePillar = ukLifestylePillar.copy(
    children = List(
      auTravel,
      foodAu,
      relationshipsAu,
      fashionAu,
      healthAu,
      loveAndSex,
      family,
      home
    )
  )
  val usLifestylePillar = ukLifestylePillar.copy(
    children = List(
      fashion,
      food,
      recipes,
      loveAndSex,
      home,
      health,
      family,
      usTravel,
      money
    )
  )
  val intLifestylePillar = ukLifestylePillar.copy(
    children = List(
      fashion,
      food,
      recipes,
      loveAndSex,
      health,
      home,
      women,
      family,
      ukTravel,
      money
    )
  )

  val ukOtherLinks = List(
    apps.copy(url = apps.url + "?INTCMP=apps_uk_web_newheader"),
    video,
    podcasts,
    pictures,
    newsletters,
    todaysPaper,
    observer,
    digitalNewspaperArchive,
    NavLink("professional networks", "/guardian-professional"),
    crosswords
  )
  val auOtherLinks = List(
    apps.copy(url = apps.url + "?INTCMP=apps_au_web_newheader"),
    video,
    podcasts,
    pictures,
    newsletters,
    digitalNewspaperArchive,
    crosswords
  )
  val usOtherLinks = List(
    apps.copy(url = apps.url + "?INTCMP=apps_us_web_newheader"),
    video,
    podcasts,
    pictures,
    newsletters,
    digitalNewspaperArchive,
    crosswords
  )
  val intOtherLinks = List(
    apps.copy(url = apps.url + "?INTCMP=apps_int_web_newheader"),
    video,
    podcasts,
    pictures,
    newsletters,
    todaysPaper,
    observer,
    digitalNewspaperArchive,
    crosswords
  )

  // Tertiary Navigation
  val tagPages = List(
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
    "education",
    "crosswords/crossword-blog",
    "crosswords/series/crossword-editor-update",
    "crosswords/series/quick",
    "crosswords/series/cryptic",
    "crosswords/series/prize",
    "crosswords/series/weekend-crossword",
    "crosswords/series/quiptic",
    "crosswords/series/genius",
    "crosswords/series/speedy",
    "crosswords/series/everyman",
    "crosswords/series/azed"
  )
}
