package model

case class EmailSubscriptions(subscriptions: List[EmailSubscription])
case class EmailSubscription(
  name: String,
  theme: String,
  about: String,
  teaser: String,
  description: String,
  frequency: String,
  listId: String,
  subscribedTo: Boolean = false,
  subheading: Option[String] = None,
  signupPage: Option[String] = None,
  exampleUrl: Option[String] = None
)

object EmailSubscription {
  def apply(emailSubscription: EmailSubscription) = emailSubscription
}

object EmailSubscriptions {

  def newsEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "The Guardian Today",
      theme = "news",
      about = "News",
      teaser = "The stories you need to read, delivered to your inbox each morning",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      frequency = "Every day",
      listId = "37",
      subscribedTo = subscribedListIds.exists{ x => x == "37" },
      subheading = Some("UK"),
      signupPage = Some("https://www.theguardian.com/info/2015/dec/08/daily-email-uk")
    ),
    EmailSubscription(
      name = "The Guardian Today",
      theme = "news",
      about = "News",
      teaser = "Our editors break down the big news for you in the daily briefing",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      frequency = "Every day",
      listId = "1493",
      subscribedTo = subscribedListIds.exists{ x => x == "1493" },
      subheading = Some("US"),
      signupPage = Some("https://www.theguardian.com/info/2015/dec/08/daily-email-uk"),
      exampleUrl = Some("https://www.theguardian.com/us-news/series/guardian-us-briefing/latest/email")
    ),
    EmailSubscription(
      name = "The Guardian Today",
      theme = "news",
      about = "News",
      teaser = "All the day's top news, commentary and features in one handy lunchtime email",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each weekday.",
      frequency = "Every day",
      listId = "1506",
      subscribedTo = subscribedListIds.exists{ x => x == "1506" },
      subheading = Some("AUS"),
      signupPage = Some("https://www.theguardian.com/info/2015/dec/08/daily-email-au")
    ),
    EmailSubscription(
      name = "Morning Mail",
      theme = "news",
      about = "Guardian Australia's morning news briefing from around the web",
      teaser = "Get ahead with a shot of early morning news - our editors bring you everything you need",
      description = "Get ahead with a shot of early morning news - our editors bring you everything you need",
      frequency = "Every weekday",
      listId = "2636",
      subscribedTo = subscribedListIds.exists{ x => x == "2636" },
      subheading = Some("AUS"),
      signupPage = Some("https://www.theguardian.com/world/guardian-australia-morning-mail/2014/jun/24/-sp-guardian-australias-morning-mail-subscribe-by-email")
    ),
    EmailSubscription(
      name = "MediaGuardian briefing",
      theme = "news",
      about = "Media",
      teaser = "An indispensable summary of what the papers are saying about media on your desktop before 9am",
      description = "An indispensable summary of the media industry headlines in your inbox before 9am. We dig out the most important stories from every and any newspaper, broadcaster and website.",
      frequency = "Weekday mornings",
      listId = "217",
      subscribedTo = subscribedListIds.exists{ x => x == "217" },
      signupPage = Some("https://www.theguardian.com/info/2016/feb/15/sign-up-to-the-media-briefing"),
      exampleUrl = Some("https://www.theguardian.com/media/series/mediaguardian-briefing/latest/email")
    ),
    EmailSubscription(
      name = "Brexit briefing",
      theme = "news",
      about = "News",
      teaser = "Get a weekly update on Britain's progress down the long road to leaving the EU",
      description = "Get a weekly rundown of the debates and developments as Britain starts out on the long road to leaving the European Union.",
      frequency = "Tuesday mornings",
      listId = "3698",
      subscribedTo = subscribedListIds.exists{ x => x == "3698" },
      exampleUrl = Some("https://www.theguardian.com/politics/series/eu-referendum-morning-briefing/latest/email")
    ),
    EmailSubscription(
      name = "Green light",
      theme = "news",
      about = "Environment",
      teaser = "The most important stories for the planet, plus data, multimedia highlights and green living guides",
      description = "In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We'll also flag up our best video, picture galleries, podcasts, blogs and green living guides.",
      frequency = "Every Friday",
      listId = "38",
      subscribedTo = subscribedListIds.exists{ x => x == "38" },
      signupPage = Some("https://www.theguardian.com/environment/2015/oct/19/sign-up-to-the-green-light-email"),
      exampleUrl = Some("https://www.theguardian.com/environment/series/green-light/latest/email")
    ),
    EmailSubscription(
      name = "Lab notes",
      theme = "news",
      about = "Science",
      teaser = "Important breakthroughs, insider knowledge, and some distractingly good fun and games",
      description = "Get a weekly round-up of the biggest stories in science, insider knowledge from our network of bloggers, and some distractingly good fun and games.",
      frequency = "Every Friday",
      listId = "3701",
      subscribedTo = subscribedListIds.exists{ x => x == "3701" },
      signupPage = Some("https://www.theguardian.com/science/2016/jun/07/sign-up-for-lab-notes-the-guardians-weekly-science-update"),
      exampleUrl = Some("https://www.theguardian.com/science/series/lab-notes/latest/email")
    ),
    EmailSubscription(
      name = "Poverty matters",
      theme = "news",
      about = "Global development",
      teaser = "From the shocking to the uplifting - get the world's biggest stories that you're missing",
      description = "Our editors track what's happening in development with a special focus on the millennium development goals. Sign up to get all the most important debate and discussion from around the world delivered to your inbox every fortnight.",
      frequency = "Every other Tuesday",
      listId = "113",
      subscribedTo = subscribedListIds.exists{ x => x == "113" },
      signupPage = Some("https://www.theguardian.com/global-development/2015/nov/10/sign-up-to-the-poverty-matters-email-newsletter"),
      exampleUrl = Some("https://www.theguardian.com/global-development/series/poverty-matters/latest/email")
    ),
    EmailSubscription(
      name = "Australian politics",
      theme = "news",
      about = "Politics",
      teaser = "A daily dose of the latest news and comment on Australian politics from the Guardian",
      description = "All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday.",
      frequency = "Weekdays at 10am",
      listId = "1866",
      subscribedTo = subscribedListIds.exists{ x => x == "1866" },
      signupPage = Some("https://www.theguardian.com/australia-news/2014/dec/10/australian-politics-subscribe-by-email")
    )
  )

  def sportEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "The Fiver",
      theme = "sport",
      about = "Football",
      teaser = "Rounding up the day's football news and gossip in our own belligerent, sometimes intelligent and (occasionally) funny way",
      description = "The Fiver is theguardian.com/sport's free football email. Every weekday we round up the day's news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way. The Fiver is delivered every Monday to Friday at around 5pm — hence the name.",
      frequency = "Weekday afternoons",
      listId = "218",
      subscribedTo = subscribedListIds.exists{ x => x == "218" },
      signupPage = Some("https://www.theguardian.com/info/2016/jan/05/the-fiver-email-sign-up"),
      exampleUrl = Some("https://www.theguardian.com/football/series/thefiver/latest/email")
    ),
    EmailSubscription(
      name = "The Breakdown",
      theme = "sport",
      about = "Rugby Union",
      teaser = "Rugby union's big stories, latest action and gossip from behind the scenes",
      description = "Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style.",
      frequency = "Every Thursday",
      listId = "219",
      subscribedTo = subscribedListIds.exists{ x => x == "219" },
      signupPage = Some("https://www.theguardian.com/sport/2016/aug/18/sign-up-to-the-breakdown"),
      exampleUrl = Some("https://www.theguardian.com/sport/series/breakdown/latest/email")
    ),
    EmailSubscription(
      name = "The Spin",
      theme = "sport",
      about = "Cricket",
      teaser = "News, rumour and humour from the world of cricket. No tired cricket cliches, but it might bowl you over",
      description = "The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over.",
      frequency = "Every Tuesday",
      listId = "220",
      subscribedTo = subscribedListIds.exists{ x => x == "220" },
      signupPage = Some("https://www.theguardian.com/sport/2016/aug/18/sign-up-to-the-spin"),
      exampleUrl = Some("https://www.theguardian.com/sport/series/thespin/latest/email")
    )
  )

  def featureEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "Weekend Reading",
      theme = "feature",
      about = "Feature",
      teaser = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture",
      description = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture.",
      frequency = "Every Saturday",
      listId = "3744",
      subscribedTo = subscribedListIds.exists{ x => x == "3743" || x == "3744" },
      signupPage = Some("https://www.theguardian.com/signup/weekendreading"),
      exampleUrl = Some("https://www.theguardian.com/membership/series/weekend-reading/latest/email")
    ),
    EmailSubscription(
      name = "The Long Read",
      theme = "feature",
      about = "Feature",
      teaser = "Get your teeth into the Long Read with a weekly delivery of the latest features and podcasts",
      description = "Bringing you the latest Long Read features and podcasts, delivered to your inbox.",
      frequency = "Every Saturday",
      listId = "3322",
      subscribedTo = subscribedListIds.exists{ x => x == "3322" },
      signupPage = Some("https://www.theguardian.com/news/2015/jul/20/sign-up-to-the-long-read-email")
    )
  )

  def cultureEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "Sleeve notes",
      theme = "culture",
      about = "Music",
      teaser = "Everything you need to know from the Guardian's music site, squeezed into one handy email",
      description = "Everything you need to know from the Guardian's music site, squeezed into one handy email.",
      frequency = "Every Friday",
      listId = "39",
      subscribedTo = subscribedListIds.exists{ x => x == "39" }
    ),
    EmailSubscription(
      name = "Close up",
      theme = "culture",
      about = "Film",
      teaser = "Rely on Close up to bring you Guardian film news, reviews and much, much more",
      description = "Rely on Close up to bring you Guardian film news, reviews and much, much more.",
      frequency = "Every Friday",
      listId = "40",
      subscribedTo = subscribedListIds.exists{ x => x == "40" }
    ),
    EmailSubscription(
      name = "Film Today",
      theme = "culture",
      about = "Film",
      teaser = "Our film editors recap the top headlines each weekday in time for your evening commute",
      description = "Our film editors recap the top headlines each weekday and deliver them straight to your inbox in time for your evening commute.",
      frequency = "Every weekday",
      listId = "1950",
      subscribedTo = subscribedListIds.exists{ x => x == "1950" },
      signupPage = Some("https://www.theguardian.com/info/2016/feb/12/film-today-email-sign-up"),
      exampleUrl = Some("https://www.theguardian.com/artanddesign/series/art-weekly/latest/email")
    ),
    EmailSubscription(
      name = "Bookmarks",
      theme = "culture",
      about = "Weekly email from the books team",
      teaser = "The books team provide their pick of the latest news, views and reviews",
      description = "A weekly email from the books team with our pick of the latest news, views and reviews, delivered to your inbox.",
      frequency = "Every Thursday",
      listId = "3039",
      subscribedTo = subscribedListIds.exists{ x => x == "3039" },
      signupPage = Some("https://www.theguardian.com/books/2015/feb/03/sign-up-to-our-bookmarks-email")
    ),
    EmailSubscription(
      name = "Art Weekly",
      theme = "culture",
      about = "Art and design",
      teaser = "Your one-stop shop for all your arty needs with the best exhibition openings and the week's biggest stories",
      description = "For your art world low-down, sign up to the Guardian's Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox.",
      frequency = "Every Friday",
      listId = "99",
      subscribedTo = subscribedListIds.exists{ x => x == "99" },
      signupPage = Some("https://www.theguardian.com/artanddesign/2015/oct/19/sign-up-to-the-art-weekly-email"),
      exampleUrl = Some("https://www.theguardian.com/artanddesign/series/art-weekly/latest/email")
    )
  )

  def lifestyleEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "Zip File",
      theme = "lifestyle",
      about = "Technology",
      teaser = "The week's top technology stories, games news and review, plus podcasts and video reports",
      description = "For all you need to know about technology in the world this week, news, analysis and comment.",
      frequency = "Every Thursday",
      listId = "1902",
      subscribedTo = subscribedListIds.exists{ x => x == "1902" }
    ),
    EmailSubscription(
      name = "The Flyer",
      theme = "lifestyle",
      about = "Travel",
      teaser = "Unconventional destinations and old favourites, top 10s and top tips - let our travel editors inspire you",
      description = "Sign up to The Flyer for all the latest travel stories, plus find links to hundreds of UK hotel and restaurant reviews; insider tips on the world's best cities; a road-tripper's guide to the US; and highlights of our most inspiring top 10s.",
      frequency = "Every Wednesday",
      listId = "2211",
      subscribedTo = subscribedListIds.exists{ x => x == "2211" },
      signupPage = Some("https://www.theguardian.com/travel/2016/aug/18/sign-up-to-the-flyer"),
      exampleUrl = Some("https://www.theguardian.com/travel/series/the-flyer/latest/email")
    ),
    EmailSubscription(
      name = "Money Talks",
      theme = "lifestyle",
      about = "Money",
      teaser = "Stay on top of your personal finance with insight and behind-the-scenes reports from the Guardian Money editors",
      description = "Stay on top of the best personal finance and money news of the week, including insight and behind-the-scenes accounts from your favourite Guardian Money editors.",
      frequency = "Every Thursday",
      listId = "1079",
      subscribedTo = subscribedListIds.exists{ x => x == "1079" },
      signupPage = Some("https://www.theguardian.com/money/2015/nov/10/sign-up-to-the-guardians-money-email"),
      exampleUrl = Some("https://www.theguardian.com/money/series/money-talks/latest/email")
    ),
    EmailSubscription(
      name = "Fashion Statement",
      theme = "lifestyle",
      about = "Fashion",
      teaser = "Sorting the wheat from the chaff to deliver the latest news, views and shoes from the style frontline",
      description = "The Guardian sorts the wheat from the chaff to deliver the latest news, views and shoes from the style frontline.",
      frequency = "Every Monday",
      listId = "105",
      subscribedTo = subscribedListIds.exists{ x => x == "105" },
      signupPage = Some("https://www.theguardian.com/fashion/2016/aug/18/sign-up-for-the-guardians-fashion-email")
    ),
    EmailSubscription(
      name = "Crossword editor's update",
      theme = "lifestyle",
      about = "Crosswords",
      teaser = "Get a monthly missive from the Guardian's crossword editor on what's been occupying solvers and setters",
      description = "Register to receive our monthly crossword email by the Guardian's crossword editor with the latest issues and tips about theguardian.com/crosswords.",
      frequency = "Monthly",
      listId = "101",
      subscribedTo = subscribedListIds.exists{ x => x == "101" },
      signupPage = Some("https://www.theguardian.com/crosswords/2016/aug/18/sign-up-to-the-crossword-editors-update-email"),
      exampleUrl = Some("https://www.theguardian.com/crosswords/series/crossword-editor-update/latest/email")
    ),
    EmailSubscription(
      name = "The Observer Food Monthly",
      theme = "lifestyle",
      about = "Food & Drink",
      teaser = "Observer Food Monthly serves up the tastiest culinary news, tips, offers, recipes and competitions",
      description = "Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions.",
      frequency = "Monthly",
      listId = "248",
      subscribedTo = subscribedListIds.exists{ x => x == "248" },
      signupPage = Some("https://www.theguardian.com/lifeandstyle/2015/oct/19/observer-food-monthly-newsletter")
    )
  )

  def commentEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      name = "Best of Guardian Opinion",
      theme = "comment",
      about = "Opinion's daily email newsletter",
      teaser = "Get up to speed on the most interesting and provoking issues and join the debate every afternoon",
      description = "Guardian Opinion's daily email newsletter with the most shared opinion, analysis and editorial articles from the last 24 hours — sign up to read, share and join the debate every afternoon.",
      frequency = "Weekday afternoons",
      listId = "2313",
      subscribedTo = subscribedListIds.exists{ x => x == "2313" },
      subheading = Some("UK"),
      signupPage = Some("https://www.theguardian.com/commentisfree/2014/jan/29/comment-is-free-daily-roundup")
    ),
    EmailSubscription(
      name = "Best of Guardian Opinion",
      theme = "comment",
      about = "Opinion's daily email newsletter",
      teaser = "Keep up with today’s pressing issues in the US with the Guardian’s American edition of the opinion email",
      description = "Keep up on today’s pressing issues with the Guardian’s Best of Opinion US email. We’ll send the most shared opinion, analysis and editorial articles from the last 24 hours, every weekday, direct to your inbox.",
      frequency = "Weekday afternoons",
      listId = "3228",
      subscribedTo = subscribedListIds.exists{ x => x == "3228" },
      subheading = Some("US"),
      signupPage = Some("https://www.theguardian.com/commentisfree/2015/may/11/sign-up-for-the-best-of-opinion-us-daily-email")
    ),
    EmailSubscription(
      name = "Best of Guardian Opinion",
      theme = "comment",
      about = "An evening selection of the best reads from Guardian Opinion in Australia",
      teaser = "An evening selection of the best reads from Guardian Opinion in Australia",
      description = "An evening selection of the best reads from Guardian Opinion in Australia",
      frequency = "Daily",
      listId = "2976",
      subscribedTo = subscribedListIds.exists{ x => x == "2976" },
      subheading = Some("AUS"),
      signupPage = Some("https://www.theguardian.com/commentisfree/2014/dec/04/best-of-comment-is-free-australia-subscribe-by-email")
    ),
    EmailSubscription(
      name = "First Dog on the Moon",
      theme = "comment",
      about = "Cartoons from Guardian Australia's resident Walkley-winning cartoonist",
      teaser = "Love First Dog? Sign up and we'll let you know whenever there's a new cartoon to see",
      description = "Subscribe to First Dog on the Moon to get his cartoons straight to your inbox every time they're published",
      frequency = "About three times a week",
      listId = "2635",
      subscribedTo = subscribedListIds.exists{ x => x == "2635" },
      signupPage = Some("https://www.theguardian.com/commentisfree/2014/jun/16/-sp-first-dog-on-the-moon-subscribe-by-email")
    )
  )

  def apply(subscribedListIds: Iterable[String] = None): EmailSubscriptions = EmailSubscriptions(List(

  ) ++ newsEmails(subscribedListIds) ++ featureEmails(subscribedListIds) ++ sportEmails(subscribedListIds) ++ cultureEmails(subscribedListIds) ++ lifestyleEmails(subscribedListIds) ++ commentEmails(subscribedListIds))
}
