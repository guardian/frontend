package model

case class EmailNewsletters(subscriptions: List[EmailNewsletter])
case class EmailNewsletter(
  name: String,
  theme: String,
  teaser: String,
  description: String,
  frequency: String,
  listId: Int,
  aliases: List[Int] = List.empty,
  subheading: Option[String] = None,
  tone: Option[String] = None,
  imageFilename: Option[String] = None,
  signupPage: Option[String] = None,
  exampleUrl: Option[String] = None,
  triggerId: Option[Int] = None
) {
  val allIds = listId :: aliases
  def subscribedTo(subscriptions: List[String]): Boolean = {
    subscriptions.exists(allIds.map(_.toString).contains(_))
  }
}

object EmailNewsletters {

  val guardianTodayUk = EmailNewsletter(
    name = "Guardian Today",
    theme = "news",
    teaser = "The headlines, the analysis, the debate. Get the whole picture from a source you trust, emailed to you every morning",
    description = "The headlines, the analysis, the debate. Get the whole picture from a source you trust, emailed to you every morning. The biggest stories examined, and diverse, independent views - the Guardian Today delivers the best of our journalism",
    frequency = "Every day",
    listId = 37,
    subheading = Some("UK"),
    signupPage = Some("/info/2015/dec/08/daily-email-uk"),
    triggerId = Some(2529)
  )

  val guardianTodayUs = EmailNewsletter(
    name = "Guardian Today",
    theme = "news",
    teaser = "Cut through the noise and get straight to the heart of the day’s breaking news in double-quick time with our daily email",
    description = "Cut through the noise. Get straight to the heart of the day’s breaking news in double-quick time with the Guardian Today. We’ll email you the stories you need to read, and bundle them up with the best of sport, culture, lifestyle and more",
    frequency = "Every weekday",
    listId = 1493,
    subheading = Some("US"),
    signupPage = Some("/info/2015/dec/08/daily-email-uk"),
    exampleUrl = Some("/email/us/daily"),
    triggerId = Some(2564)
  )

  val guardianTodayAu = EmailNewsletter(
    name = "Guardian Today",
    theme = "news",
    teaser = "All the day’s top news, commentary and features in one handy lunchtime email",
    description = "Our editors’ picks for the day's top news and commentary delivered to your inbox each weekday",
    frequency = "Every weekday",
    listId = 1506,
    subheading = Some("AUS"),
    signupPage = Some("/info/2015/dec/08/daily-email-au"),
    triggerId = Some(2563)
  )

  val morningBriefing = EmailNewsletter(
    name = "Morning Briefing UK",
    theme = "news",
    teaser = "Breaking down the day's stories, from latest manoeuvring in global politics to the ‘and finally’ story that’s going viral",
    description = "Breaking down the news stories of the day and telling you why they matter so you’ll be completely up-to-speed. Besides the headlines, you'll get a fantastic lunchtime read and highlights of what’s on the UK’s front pages that morning",
    frequency = "Every weekday",
    listId = 3640,
    signupPage = Some("/info/2016/mar/01/the-morning-briefing-start-the-day-one-step-ahead"),
    exampleUrl = Some("/world/series/guardian-morning-briefing/latest/email")
  )

  val morningMail = EmailNewsletter(
    name = "Morning Mail",
    theme = "news",
    teaser = "Get ahead with a shot of early morning news - our editors bring you everything you need",
    description = "Get ahead with a shot of early morning news - our editors bring you everything you need",
    frequency = "Every weekday",
    listId = 2636,
    subheading = Some("AUS"),
    signupPage = Some("/world/guardian-australia-morning-mail/2014/jun/24/-sp-guardian-australias-morning-mail-subscribe-by-email")
  )

  val businessToday = EmailNewsletter(
    name = "Business Today",
    theme = "news",
    teaser = "Every morning, Business Today will deliver the biggest stories, smartest analysis and hottest topics direct to your inbox",
    description = "We'll deliver the biggest stories, smartest analysis and hottest topics direct to your inbox. Along with the key news headlines, there’ll be an at-a-glance agenda of the day’s main events, insightful opinion pieces and a quality feature to sink your teeth into",
    frequency = "Weekday mornings",
    listId = 3887,
    tone = Some("news"),
    signupPage = Some("/info/2017/may/16/guardian-business-today-sign-up-financial-news-email"),
    exampleUrl = Some("/email/business-today")
  )

  val mediaBriefing = EmailNewsletter(
    name = "Media Briefing",
    theme = "news",
    teaser = "An indispensable summary of the media industry headlines in your inbox at 9am, plus thought-provoking features and the liveliest debate",
    description = "An indispensable summary of the media industry headlines in your inbox at 9am, plus thought-provoking features and the liveliest debate. Whether you’re in broadcasting, digital or print, whether you’re in news or marketing, we’ve got the stories you need to read",
    frequency = "Weekday mornings",
    listId = 217,
    tone = Some("news"),
    signupPage = Some("/info/2016/feb/15/sign-up-to-the-media-briefing"),
    exampleUrl = Some("/email/media-briefing")
  )

  val brexitBriefing = EmailNewsletter(
    name = "Brexit Briefing",
    theme = "news",
    teaser = "Keep on top of the key developments and most important debates as Britain takes its first steps on the long road to leaving the EU",
    description = "Brexit: your weekly briefing. Sign up and we’ll email you the key developments and most important debates as Britain takes its first steps on the long road to leaving the EU",
    frequency = "Tuesday mornings",
    listId = 3698,
    tone = Some("news"),
    signupPage = Some("/politics/2016/may/31/eu-referendum-morning-briefing-sign-up"),
    exampleUrl = Some("/politics/series/eu-referendum-morning-briefing/latest/email")
  )

  val greenLight = EmailNewsletter(
    name = "Green Light",
    theme = "news",
    teaser = "Environment: the most important stories for the planet, plus data, multimedia highlights and green living guides",
    description = "In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We’ll also flag up our best video, picture galleries, podcasts, blogs and green living guides",
    frequency = "Every Friday",
    listId = 38,
    signupPage = Some("/environment/2015/oct/19/sign-up-to-the-green-light-email"),
    exampleUrl = Some("/environment/series/green-light/latest/email")
  )

  val labNotes = EmailNewsletter(
    name = "Lab Notes",
    theme = "news",
    teaser = "Science news you’ll want to read. The top stories, from medical breakthroughs to dinosaur discoveries - plus brainteasers, podcasts and more",
    description = "Science news you’ll want to read. Fact. Sign up to Lab Notes and we’ll email you the top stories in science, from medical breakthroughs to dinosaur discoveries - plus brainteasers, podcasts and more",
    frequency = "Every Friday",
    listId = 3701,
    signupPage = Some("/science/2016/jun/07/sign-up-for-lab-notes-the-guardians-weekly-science-update"),
    exampleUrl = Some("/science/series/lab-notes/latest/email")
  )

  val povertyMatters = EmailNewsletter(
    name = "Poverty Matters",
    theme = "news",
    teaser = "From the shocking to the uplifting - get the world’s biggest stories that you’re missing",
    description = "Our editors track what’s happening in development with a special focus on the millennium development goals. Sign up to get all the most important debate and discussion from around the world delivered to your inbox every fortnight",
    frequency = "Every other Tuesday",
    listId = 113,
    signupPage = Some("/global-development/2015/nov/10/sign-up-to-the-poverty-matters-email-newsletter"),
    exampleUrl = Some("/global-development/series/poverty-matters/latest/email")
  )

  val australianPolitics = EmailNewsletter(
    name = "Australian Politics",
    theme = "news",
    teaser = "A daily dose of the latest news and comment on Australian politics from the Guardian",
    description = "All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday",
    frequency = "Weekdays at 10am",
    listId = 1866,
    signupPage = Some("/australia-news/2014/dec/10/australian-politics-subscribe-by-email")
  )

  val theRecap = EmailNewsletter(
    name = "The Recap",
    theme = "sport",
    teaser = "With the best of our sports journalism from the past seven days and a heads-up on the weekend’s action, you won’t miss a thing",
    description = "With the best of our sports journalism from the past seven days and a heads-up on the weekend’s action, you won’t miss a thing. Expect stand-out features and interviews, insightful analysis and highlights from the archive, plus films, podcasts, galleries and more.",
    frequency = "Every Friday",
    listId = 3888,
    signupPage = Some("/sport/2017/may/15/the-recap-sign-up-for-the-best-of-the-guardians-sport-coverage"),
    exampleUrl = Some("/email/the-recap")
  )

  val theFiver = EmailNewsletter(
    name = "The Fiver",
    theme = "sport",
    teaser = "Kick off your evenings with our football roundup. We’ll deliver the day’s news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way",
    description = "Kick off your evenings with our football roundup. Sign up to the Fiver, our daily email on the world of football. We’ll deliver the day’s news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way",
    frequency = "Weekday afternoons",
    listId = 218,
    tone = Some("news"),
    signupPage = Some("/info/2016/jan/05/the-fiver-email-sign-up"),
    exampleUrl = Some("/football/series/thefiver/latest/email")
  )

  val theBreakdown = EmailNewsletter(
    name = "The Breakdown",
    theme = "sport",
    teaser = "Rugby union’s big stories, latest action and gossip from behind the scenes",
    description = "Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style",
    frequency = "Every Thursday",
    listId = 219,
    tone = Some("news"),
    signupPage = Some("/sport/2016/aug/18/sign-up-to-the-breakdown"),
    exampleUrl = Some("/sport/series/breakdown/latest/email")
  )

  val theSpin = EmailNewsletter(
    name = "The Spin",
    theme = "sport",
    teaser = "News, rumour and humour from the world of cricket. No tired cricket cliches, but it might bowl you over",
    description = "The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over",
    frequency = "Every Tuesday",
    listId = 220,
    tone = Some("news"),
    signupPage = Some("/sport/2016/aug/18/sign-up-to-the-spin"),
    exampleUrl = Some("/sport/series/thespin/latest/email")
  )

  val guardianAustraliaSports = EmailNewsletter(
    name = "Guardian Australia Sports",
    theme = "sport",
    teaser = "The latest sports news, features and comment from Guardian Australia",
    description = "The latest sports news, features and comment from Guardian Australia, delivered to your inbox each morning",
    frequency = "Every day",
    listId = 3766,
    tone = Some("news"),
    signupPage = Some("/info/2015/jun/05/guardian-australia-sport-newsletter-subscribe-by-email")
  )

  val documentaries = EmailNewsletter(
    name = "Guardian Documentaries",
    theme = "feature",
    teaser = "Find out about our new films and get background on our film-makers and the subjects that they cover",
    description = "Be the first to find out about our new documentary films, created by top international filmmakers and following unseen global stories. Discover our latest documentaries, get background on our film-makers and the subjects that they cover, and find out about live documentary screenings",
    frequency = "Every four weeks",
    listId = 3745,
    tone = Some("media"),
    signupPage = Some("/info/2016/sep/02/sign-up-for-the-guardian-documentaries-update"),
    exampleUrl = Some("/news/series/guardian-documentaries-update/latest/email")
  )

  val weekendReading = EmailNewsletter(
    name = "Weekend Reading",
    theme = "feature",
    teaser = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture",
    description = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture",
    frequency = "Every Saturday",
    listId = 3743,
    tone = Some("feature"),
    signupPage = Some("/signup/weekendreading"),
    exampleUrl = Some("/membership/series/weekend-reading/latest/email")
  )

  val theLongRead = EmailNewsletter(
    name = "The Long Read",
    theme = "feature",
    teaser = "Get lost in a great story; the Guardian’s award-winning long reads bring you the biggest ideas and the arguments that matter",
    description = "Get lost in a great story. From politics to fashion, international investigations to new thinking, culture to crime - we’ll bring you the biggest ideas and the arguments that matter. Sign up to have the Guardian’s award-winning long reads emailed to you every Saturday morning",
    frequency = "Every Saturday",
    listId = 3890,
    aliases = List(3322),
    tone = Some("feature"),
    signupPage = Some("/news/2015/jul/20/sign-up-to-the-long-read-email")
  )

  val sleeveNotes = EmailNewsletter(
    name = "Sleeve Notes",
    theme = "culture",
    teaser = "Every genre, every era, every week. Get music news, bold reviews and unexpected extras emailed direct to you from the Guardian’s music desk",
    description = "Every genre, every era, every week. Get music news, bold reviews and unexpected extras emailed direct to you from the Guardian’s music desk",
    frequency = "Every Friday",
    listId = 39,
    aliases = List(3834, 3835),
    tone = Some("feature"),
    signupPage = Some("/info/ng-interactive/2017/mar/06/sign-up-for-the-sleeve-notes-email"),
    exampleUrl = Some("/email/sleevenotes")
  )

  val closeUp = EmailNewsletter(
    name = "Close Up",
    theme = "culture",
    teaser = "Rely on Close up to bring you Guardian film news, reviews and much, much more",
    description = "Rely on Close up to bring you Guardian film news, reviews and much, much more",
    frequency = "Every Friday",
    listId = 40,
    tone = Some("feature")
  )

  val filmToday = EmailNewsletter(
    name = "Film Today",
    theme = "culture",
    teaser = "Our film editors recap the day’s insider news and our latest reviews, plus big name interviews and film festival coverage",
    description = "Sign up to the Guardian Film Today email and we’ll make sure you don’t miss a thing - the day’s insider news and our latest reviews, plus big name interviews and film festival coverage",
    frequency = "Every weekday",
    listId = 1950,
    tone = Some("feature"),
    signupPage = Some("/info/2016/feb/12/film-today-email-sign-up")
  )

  val bookmarks = EmailNewsletter(
    name = "Bookmarks",
    theme = "culture",
    teaser = "Kick back and relax on a Sunday with our weekly email full of literary delights. Expert reviews, author interviews and top 10s, plus highlights from our columnists and community",
    description = "Join us in the world of books. Discover new books with our expert reviews, author interviews and top 10s, plus enjoy highlights from our columnists and community. Kick back on a Sunday with our weekly email full of literary delights",
    frequency = "Every Sunday",
    listId = 3039,
    aliases = List(3866, 3867),
    tone = Some("feature"),
    signupPage = Some("/books/2015/feb/03/sign-up-to-our-bookmarks-email"),
    exampleUrl = Some("/email/bookmarks")
  )

  val artWeekly = EmailNewsletter(
    name = "Art Weekly",
    theme = "culture",
    teaser = "Your one-stop shop for all your arty needs with the best exhibition openings and the week’s biggest stories",
    description = "For your art world low-down, sign up to the Guardian’s Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox",
    frequency = "Every Friday",
    listId = 99,
    tone = Some("feature"),
    signupPage = Some("/artanddesign/2015/oct/19/sign-up-to-the-art-weekly-email"),
    exampleUrl = Some("/artanddesign/series/art-weekly/latest/email")
  )

  val zipFile = EmailNewsletter(
    name = "Zip File",
    theme = "lifestyle",
    teaser = "The week’s top technology stories, games news and review, plus podcasts and video reports",
    description = "For all you need to know about technology in the world this week, news, analysis and comment",
    frequency = "Every Thursday",
    listId = 1902,
    signupPage = Some("/info/2016/sep/22/sign-up-to-the-zip-file-email")
  )

  val theFlyer = EmailNewsletter(
    name = "The Flyer",
    theme = "lifestyle",
    teaser = "Uncover unconventional destinations and rediscover old favourites - let our travel editors guide you to trips worth taking",
    description = "Weekly travel inspiration. Off-piste attractions, budget breaks, top 10s and reader reviews. Uncover unconventional destinations and rediscover old favourites - let our travel editors guide you to trips worth taking",
    frequency = "Every Monday",
    listId = 3806,
    tone = Some("feature"),
    aliases = List(2211, 3807),
    signupPage = Some("/travel/2016/aug/18/sign-up-to-the-flyer"),
    exampleUrl = Some("/email/the-flyer")
  )

  val moneyTalks = EmailNewsletter(
    name = "Money Talks",
    theme = "lifestyle",
    teaser = "Stay on top of your personal finance with insight and behind-the-scenes reports from the Guardian Money editors",
    description = "Stay on top of the best personal finance and money news of the week, including insight and behind-the-scenes accounts from your favourite Guardian Money editors",
    frequency = "Every Thursday",
    listId = 1079,
    signupPage = Some("/money/2015/nov/10/sign-up-to-the-guardians-money-email"),
    exampleUrl = Some("/money/series/money-talks/latest/email")
  )

  val fashionStatement = EmailNewsletter(
    name = "Fashion Statement",
    theme = "lifestyle",
    teaser = "A weekly hit of style with substance. The best of the week’s fashion brought to you with expertise, humour and irreverence",
    description = "A weekly hit of style with substance. Smart fashion writing and chic shopping galleries delivered straight to your inbox. Sign up for our Friday email for the best of the week’s fashion brought to you with expertise, humour and irreverence",
    frequency = "Every Monday",
    listId = 105,
    tone = Some("feature"),
    signupPage = Some("/fashion/2016/aug/18/sign-up-for-the-guardians-fashion-email")
  )

  val crosswordEditorUpdate = EmailNewsletter(
    name = "Crossword Editor's Update",
    theme = "lifestyle",
    teaser = "Get a monthly missive from the Guardian’s crossword editor on what's been occupying solvers and setters",
    description = "Register to receive our monthly crossword email by the Guardian’s crossword editor with the latest issues and tips about theguardian.com/crosswords",
    frequency = "Monthly",
    listId = 101,
    tone = Some("feature"),
    signupPage = Some("/crosswords/2016/aug/18/sign-up-to-the-crossword-editors-update-email"),
    exampleUrl = Some("/crosswords/series/crossword-editor-update/latest/email")
  )

  val theObserverFoodMonthly = EmailNewsletter(
    name = "The Observer Food Monthly",
    theme = "lifestyle",
    teaser = "Observer Food Monthly serves up the tastiest culinary news, tips, offers, recipes and competitions",
    description = "Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions",
    frequency = "Monthly",
    listId = 248,
    tone = Some("feature"),
    signupPage = Some("/lifeandstyle/2015/oct/19/observer-food-monthly-newsletter")
  )

  val bestOfOpinionUK = EmailNewsletter(
    name = "Best of Guardian Opinion",
    theme = "comment",
    teaser = "Get out of your bubble and see things from another point of view. Join the debate every afternoon and you might even change your mind",
    description = "Get out of your bubble. See things from another point of view - join the debate and you might even change your mind. Sign up to have the Guardian’s best opinion pieces emailed to you every weekday afternoon",
    frequency = "Weekday afternoons",
    listId = 3811,
    aliases = List(3814, 2313),
    subheading = Some("UK"),
    tone = Some("comment"),
    signupPage = Some("/commentisfree/2014/jan/29/comment-is-free-daily-roundup")
  )

  val bestOfOpinionUS = EmailNewsletter(
    name = "Best of Guardian Opinion",
    theme = "comment",
    teaser = "Keep up with today’s pressing issues in the US with the Guardian’s American edition of the opinion email",
    description = "Keep up on today’s pressing issues with the Guardian’s Best of Opinion US email. We’ll send the most shared opinion, analysis and editorial articles from the last 24 hours, every weekday, direct to your inbox",
    frequency = "Weekday afternoons",
    listId = 3228,
    subheading = Some("US"),
    tone = Some("comment"),
    signupPage = Some("/commentisfree/2015/may/11/sign-up-for-the-best-of-opinion-us-daily-email")
  )

  val bestOfOpinionAUS = EmailNewsletter(
    name = "Best of Guardian Opinion",
    theme = "comment",
    teaser = "An evening selection of the best reads from Guardian Opinion in Australia",
    description = "An evening selection of the best reads from Guardian Opinion in Australia",
    frequency = "Daily",
    listId = 2976,
    subheading = Some("AUS"),
    tone = Some("comment"),
    signupPage = Some("/commentisfree/2014/dec/04/best-of-comment-is-free-australia-subscribe-by-email")
  )

  val firstDogOnTheMoon = EmailNewsletter(
    name = "First Dog on the Moon",
    theme = "comment",
    teaser = "Love First Dog? Sign up and we’ll let you know whenever there's a new cartoon to see",
    description = "Subscribe to First Dog on the Moon to get his cartoons straight to your inbox every time they’re published",
    frequency = "About three times a week",
    listId = 2635,
    tone = Some("media"),
    signupPage = Some("/commentisfree/2014/jun/16/-sp-first-dog-on-the-moon-subscribe-by-email")
  )

  val newsRoundUpEmails = List(
    guardianTodayUk,
    guardianTodayUs,
    guardianTodayAu,
    morningBriefing,
    morningMail
  )

  val newsEmails = List(
    businessToday,
    mediaBriefing,
    brexitBriefing,
    greenLight,
    labNotes,
    povertyMatters,
    australianPolitics
  )

  val sportEmails = List(
    theRecap,
    theFiver,
    theBreakdown,
    theSpin,
    guardianAustraliaSports
  )

  val featureEmails = List(
    documentaries,
    weekendReading,
    theLongRead
  )

  val cultureEmails = List(
    sleeveNotes,
    closeUp,
    filmToday,
    bookmarks,
    artWeekly
  )

  val lifestyleEmails = List(
    zipFile,
    theFlyer,
    moneyTalks,
    fashionStatement,
    crosswordEditorUpdate,
    theObserverFoodMonthly
  )

  val commentEmails = List(
    bestOfOpinionUK,
    bestOfOpinionUS,
    bestOfOpinionAUS,
    firstDogOnTheMoon
  )

  val all: EmailNewsletters = EmailNewsletters(List(
    newsRoundUpEmails,
    newsEmails,
    featureEmails,
    sportEmails,
    cultureEmails,
    lifestyleEmails,
    commentEmails
  ).flatten)
}
