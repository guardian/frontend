package common

import model._

case class SectionLink(zone: String, title: String, breadcrumbTitle: String, href: String)
case class NavItem(name: SectionLink, links: Seq[SectionLink] = Nil)

trait Navigation {
  //News
  val home = SectionLink("news", "home", "Home", "/")
  val news = SectionLink("news", "news", "News", "/")
  val world = SectionLink("world", "world", "World", "/world")
  val uk = SectionLink("uk-news", "UK", "UK News", "/uk-news")
  val us = SectionLink("us-news", "US", "US News", "/us-news")
  val usPolitics = SectionLink("politics", "politics", "Politics", "/us-news/us-politics")
  val politics = SectionLink("politics", "politics", "Politics", "/politics")
  val australiaPolitics = SectionLink("politics", "politics", "Politics", "/australia-news/australian-politics")
  val technology = SectionLink("technology", "tech", "Technology", "/technology")
  val environment = SectionLink("environment", "environment", "Environment", "/environment")
  val media = SectionLink("media", "media", "Media", "/media")
  val education = SectionLink("education", "education", "Education", "/education")
  val teachersNetwork = SectionLink("education", "teacher network", "Teacher network", "/teacher-network")
  val students = SectionLink("education", "students", "Students", "/education/students")
  val society = SectionLink("society", "society", "Society", "/society")
  val development = SectionLink("globaldevelopment", "global development", "Global development", "/global-development")
  val science = SectionLink("science", "science", "Science", "/science")
  val law = SectionLink("law", "law", "Law", "/law")
  val blogs = SectionLink("blogs", "blogs", "Blogs", "/tone/blog")
  val inpictures = SectionLink("inpictures", "galleries", "In pictures", "/inpictures")
  val europeNews = SectionLink("world", "europe", "Europe", "/world/europe-news")
  val americas = SectionLink("world", "americas", "Americas", "/world/americas")
  val australia = SectionLink("australia-news", "australia", "Australia", "/australia-news")
  val asia = SectionLink("world", "asia", "Asia", "/world/asia")
  val africa = SectionLink("world", "africa", "Africa", "/world/africa")
  val middleEast = SectionLink("world", "middle east", "Middle east", "/world/middleeast")
  val video = SectionLink("video", "video", "Video", "/video")
  val podcast = SectionLink("podcasts", "podcasts", "Podcasts", "/podcasts")
  val guardianProfessional = SectionLink("guardian-professional", "professional networks", "Guardian Professional", "/guardian-professional")
  val observer = SectionLink("observer", "the observer", "The Observer", "/observer")
  val health = SectionLink("society", "health", "Health", "/society/health")
  val scotland = SectionLink("scotland", "scotland", "Scotland", "/uk/scotland")
  val wales = SectionLink("wales", "wales", "Wales", "/uk/wales")
  val northernIreland = SectionLink("northernireland", "northern ireland", "Northern Ireland", "/uk/northernireland")

  // Columnists
  val columnists = SectionLink("columnists", "columnists", "Columnists", "/index/contributors")

  //Sport
  val sport = SectionLink("sport", "sport", "Sport", "/sport")
  val sports = sport.copy(title = "sports", breadcrumbTitle = "Sports")
  val usSport = SectionLink("sport", "US sports", "US sports", "/sport/us-sport")
  val australiaSport = SectionLink("australia sport", "australia sport", "Australia sport", "/sport/australia-sport")
  val afl = SectionLink("afl", "AFL", "AFL", "/sport/afl")
  val nrl = SectionLink("nrl", "NRL", "NFL", "/sport/nrl")
  val aLeague = SectionLink("a-league", "a-league", "A-league", "/football/a-league")
  val football = SectionLink("football", "football", "Football", "/football")
  val soccer = football.copy(title = "soccer", breadcrumbTitle = "Soccer")
  val cricket = SectionLink("sport", "cricket", "Cricket", "/sport/cricket")
  val sportblog = SectionLink("sport", "sport blog", "Sport blog", "/sport/blog")
  val cycling = SectionLink("sport", "cycling", "Cycling", "/sport/cycling")
  val rugbyunion = SectionLink("sport", "rugby union", "Rugby union", "/sport/rugby-union")
  val rugbyLeague = SectionLink("sport", "rugby league", "Rugby union", "/sport/rugbyleague")
  val motorsport = SectionLink("sport", "motor sport", "Motor sport", "/sport/motorsports")
  val tennis = SectionLink("sport", "tennis", "Tennis", "/sport/tennis")
  val golf = SectionLink("sport", "golf", "Golf", "/sport/golf")
  val horseracing = SectionLink("sport", "horse racing", "Horse racing", "/sport/horse-racing")
  val boxing = SectionLink("sport", "boxing", "Boxing", "/sport/boxing")
  val formulaOne = SectionLink("sport", "F1", "Formula one", "/sport/formulaone")
  val racing = SectionLink("sport", "racing", "Racing", "/sport/horse-racing")

  val nfl = SectionLink("sport", "NFL", "NFL", "/sport/nfl")
  val mlb = SectionLink("sport", "MLB", "MLB", "/sport/mlb")
  val nba = SectionLink("sport", "NBA", "NBA", "/sport/nba")
  val mls = SectionLink("football", "MLS", "MLS", "/football/mls")
  val nhl = SectionLink("sport", "NHL", "NHL", "/sport/nhl")

  //Cif
  val cif = SectionLink("commentisfree", "comment", "Comment", "/commentisfree")
  val opinion = SectionLink("commentisfree", "opinion", "Opinion", "/commentisfree")
  val cifbelief = SectionLink("commentisfree", "cif belief", "Cif belief", "/commentisfree/belief")
  val cifgreen = SectionLink("commentisfree", "cif green", "Cif green", "/commentisfree/cif-green")

  //Culture
  val culture = SectionLink("culture", "culture", "Culture", "/culture")
  val arts = SectionLink("culture", "arts", "Arts", "/culture")
  val artanddesign = SectionLink("culture", "art & design", "Art & design", "/artanddesign")
  val books = SectionLink("culture", "books", "Books", "/books")
  val film = SectionLink("culture", "film", "Film", "/film")
  val movies = film.copy(title = "movies", breadcrumbTitle = "Movies")
  val music = SectionLink("culture", "music", "Music", "/music")
  val stage = SectionLink("culture", "stage", "Stage", "/stage")
  val televisionAndRadio = SectionLink("culture", "tv & radio", "TV & radio", "/tv-and-radio")
  val classicalMusic = SectionLink("classical", "classical", "Classical", "/music/classicalmusicandopera")

  //Technology
  val technologyblog = SectionLink("technology", "technology blog", "Technology blog", "/technology/blog")
  val games = SectionLink("culture", "games", "Games", "/games")
  val gamesblog = SectionLink("technology", "games blog", "Games blog", "/technology/gamesblog")
  val appsblog = SectionLink("technology", "apps blog", "Apps blog", "/technology/appsblog")
  val askjack = SectionLink("technology", "ask jack", "Ask Jack blog", "/technology/askjack")
  val internet = SectionLink("technology", "internet", "Internet", "/technology/internet")
  val mobilephones = SectionLink("technology", "mobile phones", "Mobile phones", "/technology/mobilephones")
  val gadgets = SectionLink("technology", "gadgets", "Gadgets", "/technology/gadgets")

  //Business
  val economy = SectionLink("business", "economy", "Economy", "/business")
  val business = economy.copy(title = "business", breadcrumbTitle = "Business")
  val companies = SectionLink("business", "companies", "Companies", "/business/companies")
  val economics = SectionLink("business", "economics", "Economics", "/business/economics")
  val markets = SectionLink("business", "markets", "Markets", "/business/stock-markets")
  val useconomy = SectionLink("business", "US economy", "US economy", "/business/useconomy")
  val ussustainablebusiness = SectionLink("business", "sustainable business", "Sustainable business", "/us/sustainable-business")
  val ausustainablebusiness = SectionLink("business", "sustainable business", "Sustainable business", "/au/sustainable-business")
  val ussmallbusiness = SectionLink("business", "small business", "small business", "/business/us-small-business")
  val recession = SectionLink("business", "recession", "Recession", "/business/recession")
  val investing = SectionLink("business", "investing", "Investing", "/business/investing")
  val banking = SectionLink("business", "banking", "Banking", "/business/banking")
  val marketforceslive = SectionLink("business", "market forces live", "Market Forces live", "/business/marketforceslive")
  val businessblog = SectionLink("business", "business blog", "Business blog", "/business/blog")
  val retail = SectionLink("business", "retail", "Retail", "/business/retail")
  val eurozone = SectionLink("business", "eurozone", "Eurozone", "/business/eurozone")
  val businessToBusiness = SectionLink("business", "business to business", "Business to Business", "/business-to-business")
  val diversityequality = SectionLink("business", "diversity & equality in business", "Diversity & equality in business", "/business/diversity-and-equality")
  val projectSyndicate = SectionLink("business", "project syndicate", "Project Syndicate", "/business/series/project-syndicate-economists")

  //Money
  val money = SectionLink("money", "money", "Money", "/money")
  val property = SectionLink("money", "property", "Property", "/money/property")
  val houseprices = SectionLink("money", "house prices", "House prices", "/money/houseprices")
  val pensions = SectionLink("money", "pensions", "Pensions", "/money/pensions")
  val savings = SectionLink("money", "savings", "Savings", "/money/savings")
  val borrowing = SectionLink("money", "borrowing", "Borrowing", "/money/debt")
  val insurance = SectionLink("money", "insurance", "Insurance", "/money/insurance")
  val workAndCareers = SectionLink("money", "careers", "Careers", "/money/work-and-careers")
  val consumeraffairs = SectionLink("money", "consumer affairs", "Consumer affairs", "/money/consumer-affairs")

  //Life and style
  val lifeandstyle = SectionLink("lifeandstyle", "lifestyle", "Lifestyle", "/lifeandstyle")
  val fashion = SectionLink("lifeandstyle", "fashion", "Fashion", "/fashion")
  val australiaFashion = SectionLink("lifeandstyle", "fashion", "Fashion", "/au/lifeandstyle/fashion")
  val foodanddrink = SectionLink("lifeandstyle", "food", "Food", "/lifeandstyle/food-and-drink")
  val australiaFoodAndDrink = SectionLink("lifeandstyle", "food", "Food", "/au/lifeandstyle/food-and-drink")
  val recipes = SectionLink("lifeandstyle", "recipes", "Recipes", "/tone/recipes")
  val family = SectionLink("lifeandstyle", "family", "family", "/lifeandstyle/family")
  val lostinshowbiz = SectionLink("lifeandstyle", "lost in showbiz", "Lost in showbiz", "/lifeandstyle/lostinshowbiz")
  val women = SectionLink("lifeandstyle", "women", "Women", "/lifeandstyle/women")
  val relationships = SectionLink("lifeandstyle", "relationships", "Relationships", "/lifeandstyle/relationships")
  val australiaRelationships = SectionLink("lifeandstyle", "relationships", "Relationships", "/au/lifeandstyle/relationships")
  val healthandwellbeing = SectionLink("lifeandstyle", "health & fitness", "Health & fitness", "/lifeandstyle/health-and-wellbeing")
  val australiaHealthAndWellbeing = SectionLink("lifeandstyle", "health & fitness", "Health & fitness", "/au/lifeandstyle/health-and-wellbeing")
  val loveAndSex = SectionLink("lifeandstyle", "love & sex", "Love & sex", "/lifeandstyle/love-and-sex")
  val homeAndGarden = SectionLink("lifeandstyle", "home & garden", "Home & garden", "/lifeandstyle/home-and-garden")

  //Travel
  val travel = SectionLink("travel", "travel", "Travel", "/travel")
  val shortbreaks = SectionLink("travel", "short breaks", "Short breaks", "/travel/short-breaks")
  val uktravel = SectionLink("travel", "UK", "UK", "/travel/uk")
  val europetravel = SectionLink("travel", "europe", "europe", "/travel/europe")
  val usTravel = SectionLink("travel", "US", "US", "/travel/usa")
  val usaTravel = usTravel.copy(title = "USA", breadcrumbTitle = "USA")
  val hotels = SectionLink("travel", "hotels", "Hotels", "/travel/hotels")
  val resturants = SectionLink("travel", "restaurants", "Restaurants", "/travel/restaurants")
  val budget = SectionLink("travel", "budget travel", "Budget travel", "/travel/budget")
  val australasiaTravel = SectionLink("australasia", "australasia", "Australasia", "/travel/australasia")
  val asiaTravel = SectionLink("asia", "asia", "Asia", "/travel/asia")
  val skiingTravel = SectionLink("travel", "skiing", "Skiing", "/travel/skiing")

  //Environment
  val climateChange = SectionLink("environment", "climate change", "Climate change", "/environment/climate-change")
  val wildlife = SectionLink("environment", "wildlife", "Wildlife", "/environment/wildlife")
  val energy = SectionLink("environment", "energy", "Energy", "/environment/energy")
  val conservation = SectionLink("environment", "conservation", "Conservation", "/environment/conservation")
  val food = SectionLink("environment", "food", "Food", "/environment/food")
  val cities = SectionLink("environment", "cities", "Cities", "/cities")
  val globalDevelopment = SectionLink("environment", "development", "Development", "/global-development")
  val pollution = SectionLink("environment", "pollution", "Pollution", "/environment/pollution")

  //Games
  val crosswords = SectionLink("crosswords", "crosswords", "Crosswords", "/crosswords")
  val crosswordBlog = SectionLink("crosswords", "blog", "Blog", "/crosswords/crossword-blog")
  val crosswordEditorUpdate = SectionLink("crosswords", "editor", "Editor", "/crosswords/series/crossword-editor-update")
  val quick = SectionLink("crosswords", "quick", "Quick", "/crosswords/series/quick")
  val cryptic = SectionLink("crosswords", "cryptic", "Cryptic", "/crosswords/series/cryptic")
  val prize = SectionLink("crosswords", "prize", "Prize", "/crosswords/series/prize")
  val quiptic = SectionLink("crosswords", "quiptic", "Quiptic", "/crosswords/series/quiptic")
  val genius = SectionLink("crosswords", "genius", "Genius", "/crosswords/series/genius")
  val speedy = SectionLink("crosswords", "speedy", "Speedy", "/crosswords/series/speedy")
  val everyman = SectionLink("crosswords", "everyman", "Everyman", "/crosswords/series/everyman")
  val weekendSectionLink = SectionLink("crosswords", "weekend", "Weekend", "/crosswords/series/weekend-crossword")

  // R1 Azeds have been re-created as NGW content with a new landing page
  val azed = SectionLink("crosswords", "azed", "Azed", "/crosswords/series/azed")

  // Guardian newspaper
  val todaysPaper = SectionLink("todayspaper", "today's paper", "Today's Paper", "/theguardian")
  val letters = SectionLink("todayspaper", "letters", "Letters", "/tone/letters")
  val editorials = SectionLink("todayspaper", "editorials", "Editorials", "/tone/editorials")
  val obituaries = SectionLink("todayspaper", "obituaries", "Obituaries", "/tone/obituaries")
  val g2 = SectionLink("todayspaper", "g2", "G2", "/theguardian/g2")
  val weekend = SectionLink("todayspaper", "weekend", "Weekend", "/theguardian/weekend")
  val theGuide = SectionLink("todayspaper", "the guide", "The Guide", "/theguardian/theguide")
  val saturdayreview = SectionLink("todayspaper", "saturday review", "Saturday Review", "/theguardian/guardianreview")

  // Archive
  val digitalNewspaperArchive = SectionLink("archive", "digital archive", "Digital Newspaper Archive", "https://theguardian.newspapers.com")

  // Observer newspaper
  val sundayPaper = SectionLink("theobserver", "sunday's paper", "The Observer", "/theobserver")
  val observerComment = SectionLink("theobserver", "comment", "The Observer Comment", "/theobserver/news/comment")
  val observerNewReview = SectionLink("theobserver", "the new review", "Observer The New Review", "/theobserver/new-review")
  val observerMagazine = SectionLink("theobserver", "observer magazine", "Observer Magazine", "/theobserver/magazine")


  // Membership
  val membership = SectionLink("membership", "membership", "Membership", "/membership")

  val footballNav = Seq(
    SectionLink("football", "live scores", "Live scores", "/football/live"),
    SectionLink("football", "tables", "Tables", "/football/tables"),
    SectionLink("football", "competitions", "Competitions", "/football/competitions"),
    SectionLink("football", "results", "Results", "/football/results"),
    SectionLink("football", "fixtures", "Fixtures", "/football/fixtures"),
    SectionLink("football", "clubs", "Clubs", "/football/teams")
  )
}

// helper for the views
object Navigation {
  def getTagsFromPage(page: Page): Tags = {
    Page.getContent(page).map(_.tags).getOrElse(Tags(Nil))
  }
}
