package navigation

object NavLinks {
  /* NEWS */
  val science = NavLink("Science", "/science")
  val tech = NavLink("Tech", "/technology")
  val politics = NavLink("UK politics", "/politics")
  val media = NavLink("Media", "/media")
  val cities = NavLink("Cities", "/cities")
  val globalDevelopment = NavLink("Global development", "/global-development")
  val australiaNews = NavLink("Australia", "/australia-news", longTitle = "Australia news")
  val auPolitics = NavLink("AU politics", "/australia-news/australian-politics", longTitle = "Politics")
  val auImmigration = NavLink("Immigration", "/australia-news/australian-immigration-and-asylum")
  val indigenousAustralia = NavLink("Indigenous Australia", "/australia-news/indigenous-australians")
  val indigenousAustraliaOpinion = NavLink("Indigenous", "/commentisfree/series/indigenousx")
  val usNews = NavLink("US", "/us-news", longTitle = "US news")
  val usPolitics = NavLink("US politics", "/us-news/us-politics", longTitle = "US politics")
  val education = NavLink("Education", "/education")
  val society = NavLink("Society", "/society")
  val law = NavLink("Law", "/law")
  val scotland = NavLink("Scotland", "/uk/scotland")
  val wales = NavLink("Wales", "/uk/wales")
  val northernIreland = NavLink("Northern Ireland", "/uk/northernireland")
  val europe = NavLink("Europe", "/world/europe-news")
  val americas = NavLink("Americas", "/world/americas")
  val asia = NavLink("Asia", "/world/asia")
  val africa = NavLink("Africa", "/world/africa")
  val middleEast = NavLink("Middle East", "/world/middleeast")
  val economics = NavLink("Economics", "/business/economics")
  val inequality = NavLink("Inequality", "/inequality")
  val banking = NavLink("Banking", "/business/banking")
  val retail = NavLink("Retail", "/business/retail")
  val markets = NavLink("Markets", "/business/stock-markets")
  val eurozone = NavLink("Eurozone", "/business/eurozone")
  val businessToBusiness = NavLink("B2B", "/business-to-business")
  val sustainableBusiness = NavLink("Sustainable business", "/us/sustainable-business")
  val diversityEquality = NavLink("Diversity & equality in business", "/business/diversity-and-equality")
  val smallBusiness = NavLink("Small business", "/business/us-small-business")
  val projectSyndicate = NavLink("Project Syndicate", "/business/series/project-syndicate-economists")
  val climateChange = NavLink("Climate change", "/environment/climate-change")
  val wildlife = NavLink("Wildlife", "/environment/wildlife")
  val energy = NavLink("Energy", "/environment/energy")
  val pollution = NavLink("Pollution", "/environment/pollution")
  val property = NavLink("Property", "/money/property")
  val pensions = NavLink("Pensions", "/money/pensions")
  val savings = NavLink("Savings", "/money/savings")
  val borrowing = NavLink("Borrowing", "/money/debt")
  val careers = NavLink("Careers", "/money/work-and-careers")
  val obituaries = NavLink("Obituaries", "/tone/obituaries")
  val ukNews = NavLink("UK", "/uk-news", longTitle = "UK news", children = List(politics, education, media, society, law, scotland, wales, northernIreland))
  val world = NavLink("World", "/world", longTitle = "World news", children = List(europe, usNews, americas, asia, australiaNews, middleEast, africa, inequality, cities, globalDevelopment))
  val ukEnvironment = NavLink("Environment", "/environment", children = List(climateChange, wildlife, energy, pollution))
  val auEnvironment = ukEnvironment.copy(children = List(cities, globalDevelopment, sustainableBusiness))
  val money = NavLink("Money", "/money", children = List(property, pensions, savings, borrowing, careers))
  val ukBusiness = NavLink("Business", "/business", children = List(economics, banking, money, markets, projectSyndicate, businessToBusiness))
  val usBusiness = ukBusiness.copy(children = List(economics, sustainableBusiness, diversityEquality, smallBusiness))
  val auBusiness = ukBusiness.copy(children = List(markets, money, projectSyndicate))
  val homelessness = NavLink("Homelessness", "/us-news/series/outside-in-america")

  /* OPINION */
  val columnists = NavLink("Columnists", "/index/contributors")
  val auColumnists = NavLink("Columnists", "/au/index/contributors")
  val theGuardianView = NavLink("The Guardian view", "/profile/editorial")
  val cartoons = NavLink("Cartoons", "/cartoons/archive")
  val inMyOpinion = NavLink("Opinion videos", "/commentisfree/series/comment-is-free-weekly")
  val letters = NavLink("Letters", "/tone/letters")

  /* SPORT */
  val football = NavLink("Football", "/football",
    children = List(
      NavLink("Live scores", "/football/live", "football/live"),
      NavLink("Tables", "/football/tables", "football/tables"),
      NavLink("Fixtures", "/football/fixtures", "football/fixtures"),
      NavLink("Results", "/football/results", "football/results"),
      NavLink("Competitions", "/football/competitions", "football/competitions"),
      NavLink("Clubs", "/football/teams", "football/teams")
    )
  )
  val soccer = football.copy(title = "Soccer")
  val cricket = NavLink("Cricket", "/sport/cricket")
  val cycling = NavLink("Cycling", "/sport/cycling")
  val rugbyUnion = NavLink("Rugby union", "/sport/rugby-union")
  val formulaOne = NavLink("F1", "/sport/formulaone")
  val tennis = NavLink("Tennis", "/sport/tennis")
  val golf = NavLink("Golf", "/sport/golf")
  val boxing = NavLink("Boxing", "/sport/boxing")
  val usSports = NavLink("US sports", "/sport/us-sport")
  val racing = NavLink("Racing", "/sport/horse-racing")
  val rugbyLeague = NavLink("Rugby league", "/sport/rugbyleague")
  val australiaSport = NavLink("Australia sport", "/sport/australia-sport")
  val AFL = NavLink("AFL", "/sport/afl")
  val NRL = NavLink("NRL", "/sport/nrl")
  val aLeague = NavLink("A-League", "/football/a-league")
  val NFL = NavLink("NFL", "/sport/nfl")
  val MLS = NavLink("MLS", "/football/mls")
  val MLB = NavLink("MLB", "/sport/mlb")
  val NBA = NavLink("NBA", "/sport/nba")
  val NHL = NavLink("NHL", "/sport/nhl")

  /* CULTURE */
  val film = NavLink("Film", "/film")
  val tvAndRadio = NavLink("TV & radio", "/tv-and-radio")
  val music = NavLink("Music", "/music")
  val games = NavLink("Games", "/games")
  val books = NavLink("Books", "/books")
  val artAndDesign = NavLink("Art & design", "/artanddesign")
  val stage = NavLink("Stage", "/stage")
  val classical = NavLink("Classical", "/music/classicalmusicandopera")

  /* LIFE */
  val fashion = NavLink("Fashion", "/fashion")
  val fashionAu = NavLink("Fashion", "/au/lifeandstyle/fashion")
  val food = NavLink("Food", "/lifeandstyle/food-and-drink")
  val foodAu = NavLink("Food", "/au/lifeandstyle/food-and-drink")
  val relationshipsAu = NavLink("Relationships", "/au/lifeandstyle/relationships")
  val loveAndSex = NavLink("Love & sex", "/lifeandstyle/love-and-sex")
  val family = NavLink("Family", "/lifeandstyle/family")
  val beauty = NavLink("Beauty", "/fashion/beauty")
  val cars = NavLink("Cars", "/technology/motoring")
  val home = NavLink("Home & garden", "/lifeandstyle/home-and-garden")
  val health = NavLink("Health & fitness", "/lifeandstyle/health-and-wellbeing")
  val healthAu = NavLink("Health & fitness", "/au/lifeandstyle/health-and-wellbeing")
  val women = NavLink("Women", "/lifeandstyle/women")
  val recipes = NavLink("Recipes", "/tone/recipes")
  val travelUk = NavLink("UK", "/travel/uk")
  val travelEurope = NavLink("Europe", "/travel/europe")
  val travelUs = NavLink("US", "/travel/usa")
  val skiing = NavLink("Skiing", "/travel/skiing")
  val travelAustralasia = NavLink("Australasia", "/travel/australasia")
  val travelAsia = NavLink("Asia", "/travel/asia")
  val ukTravel = NavLink("Travel", "/travel", children = List(travelUk, travelEurope, travelUs))
  val usTravel = ukTravel.copy(children = List(travelUs, travelEurope, travelUk))
  val auTravel = ukTravel.copy(children = List(travelAustralasia, travelAsia, travelUk, travelEurope, travelUs))

  val todaysPaper = NavLink("Today's paper", "/theguardian",
    children = List(
      NavLink("Obituaries", "/tone/obituaries"),
      NavLink("G2", "/theguardian/g2"),
      NavLink("Weekend", "/theguardian/weekend"),
      NavLink("The Guide", "/theguardian/theguide"),
      NavLink("Saturday review", "/theguardian/guardianreview")
    )
  )
  val observer = NavLink("The Observer", "/observer",
    children = List(
      NavLink("Comment", "/theobserver/news/comment"),
      NavLink("The New Review", "/theobserver/new-review"),
      NavLink("Observer Magazine", "/theobserver/magazine")
    )
  )
  val digitalNewspaperArchive = NavLink("Digital archive", "https://theguardian.newspapers.com")
  val crosswords = NavLink("Crosswords", "/crosswords",
    children = List(
      NavLink("Blog", "/crosswords/crossword-blog"),
      NavLink("Editor", "/crosswords/series/crossword-editor-update"),
      NavLink("Quick", "/crosswords/series/quick"),
      NavLink("Cryptic", "/crosswords/series/cryptic"),
      NavLink("Prize", "/crosswords/series/prize"),
      NavLink("Weekend", "/crosswords/series/weekend-crossword"),
      NavLink("Quiptic", "/crosswords/series/quiptic"),
      NavLink("Genius", "/crosswords/series/genius"),
      NavLink("Speedy", "/crosswords/series/speedy"),
      NavLink("Everyman", "/crosswords/series/everyman"),
      NavLink("Azed", "/crosswords/series/azed")
    )
  )
  val video = NavLink("Video", "/video")
  val podcasts = NavLink("Podcasts", "/podcasts")
  val pictures = NavLink("Pictures", "/inpictures")
  val newsletters = NavLink("Newsletters", "/email-newsletters")
  val jobs = NavLink("Jobs", "https://jobs.theguardian.com")
  val dating = NavLink("Dating", "https://soulmates.theguardian.com")
  val apps = NavLink("The Guardian app", "https://www.theguardian.com/mobile/2014/may/29/the-guardian-for-mobile-and-tablet")
  val ukMasterClasses = NavLink("Masterclasses", "https://membership.theguardian.com/masterclasses?INTCMP=masterclasses_uk_web_newheader")
  val auEvents = NavLink("Events", "/guardian-live-australia")
  var holidays = NavLink("Holidays", "https://holidays.theguardian.com")
  val guardianMasterClasses = NavLink("Guardian Masterclasses", "/guardian-masterclasses",
    children = List(
      NavLink("Journalism", "/guardian-masterclasses/journalism"),
      NavLink("Digital", "/guardian-masterclasses/digital"),
      NavLink("Business", "/guardian-masterclasses/business"),
      NavLink("Creative writing", "/guardian-masterclasses/writing-and-publishing"),
      NavLink("Wellbeing & Culture", "/guardian-masterclasses/culture"),
      NavLink("Corporate training", "/guardian-masterclasses/corporate-training"),
      NavLink("Calendar", "/guardian-masterclasses/calendar")
    )
  )

  // News Pillar
  val ukNewsPillar = NavLink("News", "/", longTitle = "Headlines", iconName = "home",
    List(
      ukNews,
      world,
      ukBusiness,
      football,
      politics,
      ukEnvironment,
      education,
      science,
      tech,
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
      auBusiness,
      science,
      tech
    )
  )
  val usNewsPillar = ukNewsPillar.copy(children = List(
      usNews,
      world,
      ukEnvironment,
      soccer,
      usPolitics,
      usBusiness,
      tech,
      science,
      homelessness
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
  val ukOpinionPillar = NavLink("Opinion", "/commentisfree", longTitle = "Opinion home", iconName = "home",
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
      theGuardianView.copy(title = "Editorials"),
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
  val ukSportPillar = NavLink("Sport", "/sport", longTitle = "Sport home", iconName = "home",
    List(
      football,
      rugbyUnion,
      cricket,
      tennis,
      cycling,
      formulaOne,
      golf,
      boxing,
      rugbyLeague,
      racing,
      usSports
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

  // Culture Pillar
  val ukCulturePillar = NavLink("Culture", "/culture", longTitle = "Culture home", iconName = "home",
    List(
      film,
      music,
      tvAndRadio,
      books,
      artAndDesign,
      stage,
      games,
      classical
    )
  )
  val auCulturePillar = ukCulturePillar.copy(
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
  val usCulturePillar = ukCulturePillar.copy(
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
  val intCulturePillar = ukCulturePillar.copy(
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
  val ukLifestylePillar = NavLink("Lifestyle", "/lifeandstyle", longTitle = "Lifestyle home", iconName = "home",
    List(
      fashion,
      food,
      recipes,
      ukTravel,
      health,
      women,
      loveAndSex,
      beauty,
      home,
      money,
      cars
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
    apps,
    video,
    podcasts,
    pictures,
    newsletters,
    todaysPaper,
    observer,
    digitalNewspaperArchive,
    NavLink("Professional networks", "/guardian-professional"),
    crosswords,
    guardianMasterClasses
  )
  val auOtherLinks = List(
    apps,
    video,
    podcasts,
    pictures,
    newsletters,
    digitalNewspaperArchive,
    crosswords
  )
  val usOtherLinks = List(
    apps,
    video,
    podcasts,
    pictures,
    newsletters,
    digitalNewspaperArchive,
    crosswords
  )
  val intOtherLinks = List(
    apps,
    video,
    podcasts,
    pictures,
    newsletters,
    todaysPaper,
    observer,
    digitalNewspaperArchive,
    crosswords
  )

  val ukBrandExtensions = List(
    jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
    dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
    holidays.copy(url = holidays.url + "?INTCMP=holidays_uk_web_newheader"),
    ukMasterClasses
  )
  val auBrandExtensions = List(
    auEvents
  )
  val usBrandExtensions= List(
    jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader")
  )
  val intBrandExtensions = List(
    jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
    dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
    holidays.copy(url = holidays.url + "?INTCMP=holidays_int_web_newheader")
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
    "music/classicalmusicandopera",
    "lifeandstyle/food-and-drink",
    "tone/recipes",
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
    "crosswords/series/azed",
    "fashion/beauty",
    "technology/motoring"
  )
}
