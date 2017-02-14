package model

import controllers.ListIds

case class EmailNewsletters(subscriptions: List[EmailNewsletter])
case class EmailNewsletter(
  name: String,
  theme: String,
  teaser: String,
  description: String,
  frequency: String,
  listId: String,
  subscribedTo: (Iterable[String]) => Boolean,
  subheading: Option[String],
  tone: Option[String],
  imageFilename: Option[String],
  signupPage: Option[String],
  exampleUrl: Option[String]
)

object EmailNewsletter {
  def apply(emailSubscription: EmailNewsletter) = emailSubscription

  def apply(
    name: String,
    theme: String,
    teaser: String,
    description: String,
    frequency: String,
    listId: String,
    aliases: List[String] = List.empty,
    subheading: Option[String] = None,
    tone: Option[String] = None,
    imageFilename: Option[String] = None,
    signupPage: Option[String] = None,
    exampleUrl: Option[String] = None
  ): EmailNewsletter = EmailNewsletter(
    name,
    theme,
    teaser,
    description,
    frequency,
    listId,
    subscribedTo = { subscriptions => subscriptions.exists((listId :: aliases).contains(_)) },
    subheading,
    tone,
    imageFilename,
    signupPage,
    exampleUrl
  )
}

object EmailNewsletters {

  val newsRoundUpEmails = List(
    EmailNewsletter(
      name = "Guardian Today",
      theme = "news",
      teaser = "The stories you need to read, delivered to your inbox each morning",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      frequency = "Every day",
      listId = ListIds.guardianTodayUk.toString,
      subheading = Some("UK"),
      signupPage = Some("/info/2015/dec/08/daily-email-uk")
    ),
    EmailNewsletter(
      name = "Guardian Today",
      theme = "news",
      teaser = "Our editors break down the big news for you in the daily briefing",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      frequency = "Every weekday",
      listId = ListIds.guardianTodayUs.toString,
      subheading = Some("US"),
      signupPage = Some("/info/2015/dec/08/daily-email-uk"),
      exampleUrl = Some("/us-news/series/guardian-us-briefing/latest/email")
    ),
    EmailNewsletter(
      name = "Guardian Today",
      theme = "news",
      teaser = "All the day's top news, commentary and features in one handy lunchtime email",
      description = "Our editors' picks for the day's top news and commentary delivered to your inbox each weekday.",
      frequency = "Every weekday",
      listId = ListIds.guardianTodayAu.toString,
      subheading = Some("AUS"),
      signupPage = Some("/info/2015/dec/08/daily-email-au")
    ),
    EmailNewsletter(
      name = "Morning Mail",
      theme = "news",
      teaser = "Get ahead with a shot of early morning news - our editors bring you everything you need",
      description = "Get ahead with a shot of early morning news - our editors bring you everything you need",
      frequency = "Every weekday",
      listId = ListIds.morningMail.toString,
      subheading = Some("AUS"),
      signupPage = Some("/world/guardian-australia-morning-mail/2014/jun/24/-sp-guardian-australias-morning-mail-subscribe-by-email")
    )
  )

  val newsEmails = List(
    EmailNewsletter(
      name = "MediaGuardian Briefing",
      theme = "news",
      teaser = "An indispensable summary of what the papers are saying about media on your desktop before 9am",
      description = "An indispensable summary of the media industry headlines in your inbox before 9am. We dig out the most important stories from every and any newspaper, broadcaster and website.",
      frequency = "Weekday mornings",
      listId = ListIds.mediaBriefing.toString,
      tone = Some("news"),
      signupPage = Some("/info/2016/feb/15/sign-up-to-the-media-briefing"),
      exampleUrl = Some("/media/series/mediaguardian-briefing/latest/email")
    ),
    EmailNewsletter(
      name = "Brexit Briefing",
      theme = "news",
      teaser = "Get a weekly update on Britain's progress down the long road to leaving the EU",
      description = "Get a weekly rundown of the debates and developments as Britain starts out on the long road to leaving the European Union.",
      frequency = "Tuesday mornings",
      listId = ListIds.brexitBriefing.toString,
      tone = Some("news"),
      signupPage = Some("/politics/2016/may/31/eu-referendum-morning-briefing-sign-up"),
      exampleUrl = Some("/politics/series/eu-referendum-morning-briefing/latest/email")
    ),
    EmailNewsletter(
      name = "Green Light",
      theme = "news",
      teaser = "Environment: the most important stories for the planet, plus data, multimedia highlights and green living guides",
      description = "In each weekly edition our editors highlight the most important environment stories of the week including data, opinion pieces and background guides. We'll also flag up our best video, picture galleries, podcasts, blogs and green living guides.",
      frequency = "Every Friday",
      listId = ListIds.greenLight.toString,
      signupPage = Some("/environment/2015/oct/19/sign-up-to-the-green-light-email"),
      exampleUrl = Some("/environment/series/green-light/latest/email")
    ),
    EmailNewsletter(
      name = "Lab Notes",
      theme = "news",
      teaser = "Important breakthroughs, insider knowledge, and some distractingly good fun and games",
      description = "Get a weekly round-up of the biggest stories in science, insider knowledge from our network of bloggers, and some distractingly good fun and games.",
      frequency = "Every Friday",
      listId = ListIds.labNotes.toString,
      signupPage = Some("/science/2016/jun/07/sign-up-for-lab-notes-the-guardians-weekly-science-update"),
      exampleUrl = Some("/science/series/lab-notes/latest/email")
    ),
    EmailNewsletter(
      name = "Poverty Matters",
      theme = "news",
      teaser = "From the shocking to the uplifting - get the world's biggest stories that you're missing",
      description = "Our editors track what's happening in development with a special focus on the millennium development goals. Sign up to get all the most important debate and discussion from around the world delivered to your inbox every fortnight.",
      frequency = "Every other Tuesday",
      listId = ListIds.povertyMatters.toString,
      signupPage = Some("/global-development/2015/nov/10/sign-up-to-the-poverty-matters-email-newsletter"),
      exampleUrl = Some("/global-development/series/poverty-matters/latest/email")
    ),
    EmailNewsletter(
      name = "Australian Politics",
      theme = "news",
      teaser = "A daily dose of the latest news and comment on Australian politics from the Guardian",
      description = "All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday.",
      frequency = "Weekdays at 10am",
      listId = ListIds.australianPolitics.toString,
      signupPage = Some("/australia-news/2014/dec/10/australian-politics-subscribe-by-email")
    )
  )

  val sportEmails = List(
    EmailNewsletter(
      name = "The Fiver",
      theme = "sport",
      teaser = "Rounding up the day's football news and gossip in our own belligerent, sometimes intelligent and (occasionally) funny way",
      description = "The Fiver is theguardian.com/sport's free football email. Every weekday we round up the day's news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way. The Fiver is delivered every Monday to Friday at around 5pm — hence the name.",
      frequency = "Weekday afternoons",
      listId = ListIds.theFiver.toString,
      tone = Some("news"),
      signupPage = Some("/info/2016/jan/05/the-fiver-email-sign-up"),
      exampleUrl = Some("/football/series/thefiver/latest/email")
    ),
    EmailNewsletter(
      name = "The Breakdown",
      theme = "sport",
      teaser = "Rugby union's big stories, latest action and gossip from behind the scenes",
      description = "Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style.",
      frequency = "Every Thursday",
      listId = ListIds.theBreakdown.toString,
      tone = Some("news"),
      signupPage = Some("/sport/2016/aug/18/sign-up-to-the-breakdown"),
      exampleUrl = Some("/sport/series/breakdown/latest/email")
    ),
    EmailNewsletter(
      name = "The Spin",
      theme = "sport",
      teaser = "News, rumour and humour from the world of cricket. No tired cricket cliches, but it might bowl you over",
      description = "The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over.",
      frequency = "Every Tuesday",
      listId = ListIds.theSpin.toString,
      tone = Some("news"),
      signupPage = Some("/sport/2016/aug/18/sign-up-to-the-spin"),
      exampleUrl = Some("/sport/series/thespin/latest/email")
    ),
    EmailNewsletter(
      name = "Guardian Australia Sports",
      theme = "sport",
      teaser = "The latest sports news, features and comment from Guardian Australia",
      description = "The latest sports news, features and comment from Guardian Australia, delivered to your inbox each morning.",
      frequency = "Every day",
      listId = ListIds.guardianAustraliaSports.toString,
      tone = Some("news"),
      signupPage = Some("/info/2015/jun/05/guardian-australia-sport-newsletter-subscribe-by-email")
    )
  )

  val featureEmails = List(
    EmailNewsletter(
      name = "Guardian Documentaries",
      theme = "feature",
      teaser = "Find out about our new films and get background on our film-makers and the subjects that they cover",
      description = "Be the first to find out about our new documentary films, created by top international filmmakers and following unseen global stories. Discover our latest documentaries, get background on our film-makers and the subjects that they cover, and find out about live documentary screenings.",
      frequency = "Every four weeks",
      listId = ListIds.documentaries.toString,
      tone = Some("media"),
      signupPage = Some("/info/2016/sep/02/sign-up-for-the-guardian-documentaries-update"),
      exampleUrl = Some("/news/2016/sep/23/from-gun-nation-to-desert-fire-welcome-to-guardian-documentaries/email")
    ),
    EmailNewsletter(
      name = "Weekend Reading",
      theme = "feature",
      teaser = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture",
      description = "The best stuff you didn't have time to read during the week - from features and news analysis to lifestyle and culture.",
      frequency = "Every Saturday",
      listId = ListIds.weekendReading.toString,
      tone = Some("feature"),
      signupPage = Some("/signup/weekendreading"),
      exampleUrl = Some("/membership/series/weekend-reading/latest/email")
    ),
    EmailNewsletter(
      name = "The Long Read",
      theme = "feature",
      teaser = "Get your teeth into the Long Read with a weekly delivery of the latest features and podcasts",
      description = "Bringing you the latest Long Read features and podcasts, delivered to your inbox.",
      frequency = "Every Saturday",
      listId = ListIds.theLongRead.toString,
      tone = Some("feature"),
      signupPage = Some("/news/2015/jul/20/sign-up-to-the-long-read-email")
    )
  )

  val cultureEmails = List(
    EmailNewsletter(
      name = "Sleeve Notes",
      theme = "culture",
      teaser = "Everything you need to know from the Guardian's music site, squeezed into one handy email",
      description = "Everything you need to know from the Guardian's music site, squeezed into one handy email.",
      frequency = "Every Friday",
      listId = ListIds.newSleeveNotes.toString,
      aliases = List(ListIds.sleeveNotes.toString, ListIds.newSleeveNotes.toString, ListIds.controlBestOfOpinion.toString),
      tone = Some("review"),
      signupPage = Some("/music/2016/aug/18/sign-up-to-sleeve-notes")
    ),
    EmailNewsletter(
      name = "Close Up",
      theme = "culture",
      teaser = "Rely on Close up to bring you Guardian film news, reviews and much, much more",
      description = "Rely on Close up to bring you Guardian film news, reviews and much, much more.",
      frequency = "Every Friday",
      listId = ListIds.closeUp.toString,
      tone = Some("feature")
    ),
    EmailNewsletter(
      name = "Film Today",
      theme = "culture",
      teaser = "Our film editors recap the top headlines each weekday in time for your evening commute",
      description = "Our film editors recap the top headlines each weekday and deliver them straight to your inbox in time for your evening commute.",
      frequency = "Every weekday",
      listId = ListIds.filmToday.toString,
      tone = Some("feature"),
      signupPage = Some("/info/2016/feb/12/film-today-email-sign-up")
    ),
    EmailNewsletter(
      name = "Bookmarks",
      theme = "culture",
      teaser = "The books team provide their pick of the latest news, views and reviews",
      description = "A weekly email from the books team with our pick of the latest news, views and reviews, delivered to your inbox.",
      frequency = "Every Thursday",
      listId = ListIds.bookmarks.toString,
      tone = Some("feature"),
      signupPage = Some("/books/2015/feb/03/sign-up-to-our-bookmarks-email")
    ),
    EmailNewsletter(
      name = "Art Weekly",
      theme = "culture",
      teaser = "Your one-stop shop for all your arty needs with the best exhibition openings and the week's biggest stories",
      description = "For your art world low-down, sign up to the Guardian's Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox.",
      frequency = "Every Friday",
      listId = ListIds.artWeekly.toString,
      tone = Some("feature"),
      signupPage = Some("/artanddesign/2015/oct/19/sign-up-to-the-art-weekly-email"),
      exampleUrl = Some("/artanddesign/series/art-weekly/latest/email")
    )
  )

  val lifestyleEmails = List(
    EmailNewsletter(
      name = "Zip File",
      theme = "lifestyle",
      teaser = "The week's top technology stories, games news and review, plus podcasts and video reports",
      description = "For all you need to know about technology in the world this week, news, analysis and comment.",
      frequency = "Every Thursday",
      listId = ListIds.zipFile.toString,
      signupPage = Some("/info/2016/sep/22/sign-up-to-the-zip-file-email")
    ),
    EmailNewsletter(
      name = "The Flyer",
      theme = "lifestyle",
      teaser = "Unconventional destinations and old favourites, top 10s and top tips - let our travel editors inspire you",
      description = "Sign up to The Flyer for all the latest travel stories, plus find links to hundreds of UK hotel and restaurant reviews; insider tips on the world's best cities; a road-tripper's guide to the US; and highlights of our most inspiring top 10s.",
      frequency = "Every Wednesday",
      listId = ListIds.theFlyer.toString,
      tone = Some("feature"),
      aliases = List("2211", "3806", "3807"),
      signupPage = Some("/travel/2016/aug/18/sign-up-to-the-flyer"),
      exampleUrl = Some("/email/the-flyer?format=email-connected")
    ),
    EmailNewsletter(
      name = "Money Talks",
      theme = "lifestyle",
      teaser = "Stay on top of your personal finance with insight and behind-the-scenes reports from the Guardian Money editors",
      description = "Stay on top of the best personal finance and money news of the week, including insight and behind-the-scenes accounts from your favourite Guardian Money editors.",
      frequency = "Every Thursday",
      listId = ListIds.moneyTalks.toString,
      signupPage = Some("/money/2015/nov/10/sign-up-to-the-guardians-money-email"),
      exampleUrl = Some("/money/series/money-talks/latest/email")
    ),
    EmailNewsletter(
      name = "Fashion Statement",
      theme = "lifestyle",
      teaser = "Sorting the wheat from the chaff to deliver the latest news, views and shoes from the style frontline",
      description = "The Guardian sorts the wheat from the chaff to deliver the latest news, views and shoes from the style frontline.",
      frequency = "Every Monday",
      listId = ListIds.fashionStatement.toString,
      tone = Some("feature"),
      signupPage = Some("/fashion/2016/aug/18/sign-up-for-the-guardians-fashion-email")
    ),
    EmailNewsletter(
      name = "Crossword Editor's Update",
      theme = "lifestyle",
      teaser = "Get a monthly missive from the Guardian's crossword editor on what's been occupying solvers and setters",
      description = "Register to receive our monthly crossword email by the Guardian's crossword editor with the latest issues and tips about theguardian.com/crosswords.",
      frequency = "Monthly",
      listId = ListIds.crosswordEditorUpdate.toString,
      tone = Some("feature"),
      signupPage = Some("/crosswords/2016/aug/18/sign-up-to-the-crossword-editors-update-email"),
      exampleUrl = Some("/crosswords/series/crossword-editor-update/latest/email")
    ),
    EmailNewsletter(
      name = "The Observer Food Monthly",
      theme = "lifestyle",
      teaser = "Observer Food Monthly serves up the tastiest culinary news, tips, offers, recipes and competitions",
      description = "Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions.",
      frequency = "Monthly",
      listId = ListIds.theObserverFoodMonthly.toString,
      tone = Some("feature"),
      signupPage = Some("/lifeandstyle/2015/oct/19/observer-food-monthly-newsletter")
    )
  )

  val commentEmails = List(
    EmailNewsletter(
      name = "Best of Guardian Opinion",
      theme = "comment",
      teaser = "Get up to speed on the most interesting and provoking issues and join the debate every afternoon",
      description = "Guardian Opinion's daily email newsletter with the most shared opinion, analysis and editorial articles from the last 24 hours — sign up to read, share and join the debate every afternoon.",
      frequency = "Weekday afternoons",
      listId = ListIds.newBestOfOpinion.toString,
      aliases = List(ListIds.newBestOfOpinion.toString, ListIds.controlBestOfOpinion.toString, ListIds.theBestOfOpinion.toString),
      subheading = Some("UK"),
      tone = Some("comment"),
      signupPage = Some("/commentisfree/2014/jan/29/comment-is-free-daily-roundup")
    ),
    EmailNewsletter(
      name = "Best of Guardian Opinion",
      theme = "comment",
      teaser = "Keep up with today’s pressing issues in the US with the Guardian’s American edition of the opinion email",
      description = "Keep up on today’s pressing issues with the Guardian’s Best of Opinion US email. We’ll send the most shared opinion, analysis and editorial articles from the last 24 hours, every weekday, direct to your inbox.",
      frequency = "Weekday afternoons",
      listId = ListIds.bestOfOpinionUS.toString,
      subheading = Some("US"),
      tone = Some("comment"),
      signupPage = Some("/commentisfree/2015/may/11/sign-up-for-the-best-of-opinion-us-daily-email")
    ),
    EmailNewsletter(
      name = "Best of Guardian Opinion",
      theme = "comment",
      teaser = "An evening selection of the best reads from Guardian Opinion in Australia",
      description = "An evening selection of the best reads from Guardian Opinion in Australia",
      frequency = "Daily",
      listId = ListIds.bestOfOpinionAUS.toString,
      subheading = Some("AUS"),
      tone = Some("comment"),
      signupPage = Some("/commentisfree/2014/dec/04/best-of-comment-is-free-australia-subscribe-by-email")
    ),
    EmailNewsletter(
      name = "First Dog on the Moon",
      theme = "comment",
      teaser = "Love First Dog? Sign up and we'll let you know whenever there's a new cartoon to see",
      description = "Subscribe to First Dog on the Moon to get his cartoons straight to your inbox every time they're published",
      frequency = "About three times a week",
      listId = ListIds.firstDogOnTheMoon.toString,
      tone = Some("media"),
      signupPage = Some("/commentisfree/2014/jun/16/-sp-first-dog-on-the-moon-subscribe-by-email")
    )
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
