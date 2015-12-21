package model

case class EmailSubscriptions(subscriptions: List[EmailSubscription])
case class EmailSubscription(
  name: String,
  theme: String,
  about: String,
  description: String,
  frequency: String,
  listId: String,
  popularity: Int = 0,
  subscribedTo: Boolean = false
)
object EmailSubscription {
  def apply(emailSubscription: EmailSubscription) = emailSubscription
}
object EmailSubscriptions {
  def australianEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      "The Guardian today - AUS",
      "news",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each weekday.",
      "Every day",
      "1506",
      11,
      subscribedTo = subscribedListIds.exists{ x => x == "1506" }
    ),
    EmailSubscription(
      "Morning Mail",
      "news",
      "Guardian Australia's morning news briefing from around the web",
      "A brief mobile-friendly roundup of all the news you need to know in Australia, sent first thing in the morning",
      "Every weekday",
      "2636",
      11,
      subscribedTo = subscribedListIds.exists{ x => x == "2636" }
    ),
    EmailSubscription(
      "Australian politics",
      "news",
      "Politics",
      "All the latest news and comment on Australian politics from the Guardian, delivered to you every weekday.",
      "Weekdays at midday",
      "1866",
      subscribedTo = subscribedListIds.exists{ x => x == "1866" }
    ),
    EmailSubscription(
      "First Dog on the Moon",
      "comment",
      "Cartoons from Guardian Australia's resident Walkley-winning cartoonist",
      "Subscribe to First Dog on the Moon to get his cartoons straight to your inbox every time they're published",
      "About three times a week",
      "2635",
      11,
      subscribedTo = subscribedListIds.exists{ x => x == "2635" }
    ),
    EmailSubscription(
      "Best of Comment is free - Australia",
      "comment",
      "Cartoons from Guardian Australia's resident Walkley-winning cartoonist",
      "An evening selection of the best reads on Comment is free in Australia",
      "Daily",
      "2976",
      11,
      subscribedTo = subscribedListIds.exists{ x => x == "2976" }
    )
  )

  def cultureEmails(subscribedListIds: Iterable[String] = None) = List(
    // Culture
    EmailSubscription(
      "Sleeve notes",
      "culture",
      "Music",
      "Everything you need to know from the Guardian's music site, squeezed into one handy email.",
      "Every Friday",
      "39",
      8,
      subscribedTo = subscribedListIds.exists{ x => x == "39" }
    ),
    EmailSubscription(
      "Close up",
      "culture",
      "Film",
      "Every Thursday, rely on Close up to bring you Guardian film news, reviews and much, much more.",
      "Every Thursday",
      "40",
      5,
      subscribedTo = subscribedListIds.exists{ x => x == "40" }
    ),
    EmailSubscription(
      "Film Today",
      "culture",
      "Film",
      "Our film editors recap the top headlines each weekday and deliver them straight to your inbox in time for your evening commute.",
      "Everyday",
      "1950",
      5,
      subscribedTo = subscribedListIds.exists{ x => x == "1950" }
    ),
    EmailSubscription(
      "Bookmarks",
      "culture",
      "Weekly email from the books team",
      "A weekly email from the books team with our pick of the latest news, views and reviews, delivered to your inbox every Thursday.",
      "Once a week",
      "3039",
      subscribedTo = subscribedListIds.exists{ x => x == "3039" }
    ),
    EmailSubscription(
      "Art Weekly",
      "culture",
      "Art and design",
      "For your art world low-down, sign up to the Guardian's Art Weekly email and get all the latest news, reviews and comment delivered straight to your inbox.",
      "",
      "99"
    )
  )

  def moreFromTheguardianEmails(subscribedListIds: Iterable[String] = None) = List(
    // Guardian favourites
    EmailSubscription(
      "Guardian Masterclasses",
      "guardian favourites",
      "Courses and training",
      "News on the latest classes, blog content and competitions from the Guardian's learning programme. Plus inspiring tips from world-class tutors on everything from journalism and creative writing to culture and general knowledge, delivered to your inbox three times per week.",
      "3 times per week",
      "3561",
      subscribedTo = subscribedListIds.exists{ x => x == "3561" }
    ),

    EmailSubscription(
      "Guardian Gardener",
      "guardian favourites",
      "Gardening",
      "Tips and seasonal advice from our expert gardeners to help you care for any green space: whether you have acres or plant pots. Plus shop for bulbs, plants and garden hardware sourced from our favourite independent suppliers.",
      "1-2 times per week",
      "3562",
      subscribedTo = subscribedListIds.exists{ x => x == "3562" }
    ),

    EmailSubscription(
      "Guardian Bookshop",
      "guardian favourites",
      "Books",
      "Every week you’ll receive our hand-picked edits of books we know you’ll enjoy. From thought-provoking collections, round-ups of the Guardian and Observer weekend reviews and special offers plus from time to time we’ll give you first preview of the books we publish and new and noteworthy titles to look out for each month.",
      "Every Wednesday, Saturday and Sunday",
      "3563",
      subscribedTo = subscribedListIds.exists{ x => x == "3563" }
    )
  )

  def newsEmails(subscribedListIds: Iterable[String] = None) = List(
    EmailSubscription(
      "The Long Read",
      "news",
      "The week’s Long Reads and audio features",
      "Bringing you the latest Long Read features and podcasts, delivered to your inbox every Saturday morning",
      "Every week",
      "3322",
      0,
      subscribedTo = subscribedListIds.exists{ x => x == "3322" }
    )
  )

  def apply(subscribedListIds: Iterable[String] = None): EmailSubscriptions = EmailSubscriptions(List(
    // News
    EmailSubscription(
      "The Guardian today - UK",
      "news",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      "Every day",
      "37",
      12,
      subscribedTo = subscribedListIds.exists{ x => x == "37" }
    ),
    EmailSubscription(
      "The Guardian today - US",
      "news",
      "News",
      "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",
      "Every day",
      "1493",
      11,
      subscribedTo = subscribedListIds.exists{ x => x == "1493" }
    ),
    EmailSubscription(
      "The best of CiF",
      "news",
      "The best of Comment is free",
      "Comment is free's daily email newsletter with the most shared comment, analysis and editorial articles from the last 24 hours — sign up to read, share and join the debate on the Guardian's most popular opinion pieces every lunchtime.",
      "Weekday lunchtime",
      "2313",
      10,
      subscribedTo = subscribedListIds.exists{ x => x == "2313" }
    ),
    EmailSubscription(
      "The Fiver",
      "news",
      "Football",
      "The Fiver is theguardian.com/sport's free football email. Every weekday we round up the day's news and gossip in our own belligerent, sometimes intelligent and — very occasionally — funny way. The Fiver is delivered every Monday to Friday at around 5pm — hence the name.",
      "5pm every weekday",
      "218",
      10,
      subscribedTo = subscribedListIds.exists{ x => x == "218" }
    ),
    EmailSubscription(
      "Media briefing",
      "news",
      "Media",
      "An indispensable summary of what the papers are saying about media on your desktop before 9am. We summarise the media headlines in every newspaper from the Wall Street Journal to the Daily Star.",
      "Weekday mornings",
      "217",
      7,
      subscribedTo = subscribedListIds.exists{ x => x == "217" }
    ),
    EmailSubscription(
      "Green light",
      "news",
      "Environment",
      "In each weekly edition our editors highlight the most important stories of the week including data, opinion pieces and background guides. We'll also flag up our best video, picture galleries, podcasts, blogs and green living guides.",
      "",
      "38",
      subscribedTo = subscribedListIds.exists{ x => x == "38" }
    ),
    EmailSubscription(
      "Poverty matters",
      "news",
      "Global development",
      "Our editors track what's happening in development with a special focus on the millennium development goals. Sign up to get all the most important debate and discussion from around the world delivered to your inbox every fortnight.",
      "",
      "113",
      subscribedTo = subscribedListIds.exists{ x => x == "113" }
    ),

    // Lifestyle
    EmailSubscription(
      "Zip file",
      "lifestyle",
      "Technology",
      "For all you need to know about technology in the world this week, news, analysis and comment.",
      "Every Thursday",
      "1902",
      10,
      subscribedTo = subscribedListIds.exists{ x => x == "10" }
    ),
    EmailSubscription(
      "The Flyer",
      "lifestyle",
      "Travel",
      "Sign up to The Flyer for all the latest travel stories, plus find links to hundreds of UK hotel and restaurant reviews; insider tips on the world's best cities; a road-tripper's guide to the US; and highlights of our most inspiring top 10s.",
      "Every Wednesday",
      "2211",
      10,
      subscribedTo = subscribedListIds.exists{ x => x == "2211" }
    ),
    EmailSubscription(
      "Money Talks",
      "lifestyle",
      "Money",
      "Stay on top of the best personal finance and money news of the week, including insight and behind-the-scenes accounts from your favourite Guardian Money editors.",
      "",
      "1079",
      9,
      subscribedTo = subscribedListIds.exists{ x => x == "1079" }
    ),
    EmailSubscription(
      "Fashion statement",
      "lifestyle",
      "Fashion",
      "The Guardian sorts the wheat from the chaff to deliver the latest news, views and shoes from the style frontline. Sign up to Fashion Statement, sent every Friday.",
      "Every Friday",
      "105",
      9,
      subscribedTo = subscribedListIds.exists{ x => x == "105" }
    ),
    EmailSubscription(
      "Crossword editor's update",
      "lifestyle",
      "Crosswords",
      "Register to receive our monthly crossword email by the Guardian's crossword editor with the latest issues and tips about theguardian.com/crosswords.",
      "",
      "101",
      subscribedTo = subscribedListIds.exists{ x => x == "101" }
    ),
    EmailSubscription(
      "The Observer Food Monthly",
      "lifestyle",
      "Food & Drink",
      "Sign up to the Observer Food Monthly newsletter for all your food and drink news, tips, offers, recipes and competitions.",
      "Monthly",
      "248",
      subscribedTo = subscribedListIds.exists{ x => x == "248" }
    ),

    // Sport
    EmailSubscription(
      "The Breakdown",
      "sport",
      "Rugby Union",
      "Sign up for our rugby union email, written by our rugby correspondent Paul Rees. Every Thursday Paul will give his thoughts on the big stories, review the latest action and provide gossip from behind the scenes in his unique and indomitable style.",
      "Every Thursday",
      "219",
      subscribedTo = subscribedListIds.exists{ x => x == "219" }
    ),
    EmailSubscription(
      "The Spin",
      "sport",
      "Cricket",
      "The Spin brings you all the latest comment and news, rumour and humour from the world of cricket every Tuesday. It promises not to use tired old cricket cliches, but it might just bowl you over.",
      "Every Tuesday",
      "220",
      subscribedTo = subscribedListIds.exists{ x => x == "220" }
    )
  ) ++ newsEmails(subscribedListIds) ++ australianEmails(subscribedListIds) ++ cultureEmails(subscribedListIds) ++ moreFromTheguardianEmails(subscribedListIds))
}
