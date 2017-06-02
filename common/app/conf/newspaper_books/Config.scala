package conf.newspaper_books

case class NewspaperBookSection(
  id: String,
  name: String
)

case class NewspaperBook(
  id: String,
  name: String,
  sections: Seq[NewspaperBookSection]
)

object Config {
  val order = Seq[NewspaperBook](
    NewspaperBook(
      "theguardian/mainsection",
      "Main section",
      Seq(
        NewspaperBookSection(
          "theguardian/mainsection/topstories",
          "Top stories"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/uknews",
          "UK news"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/international",
          "International"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/financial1",
          "Financial"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/financial2",
          "Financial"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/financial3",
          "Financial"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/money",
          "Money"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/the-long-read",
          "The long read"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/saturday",
          "Saturday features"
        ) ,
        NewspaperBookSection(
          "theguardian_mainsection_eyewitness",
          "Eye Witness"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/commentanddebate",
          "Comment and debate"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/editorialsandreply",
          "Editorial and reply"
        )  ,
        NewspaperBookSection(
          "theguardian/mainsection/education",
          "Education"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/society",
          "Society"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/media",
          "Media"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/obituaries",
          "Obituaries"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/reviews",
          "Reviews"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/weather2",
          "Weather"
        ),
        NewspaperBookSection(
          "extras/theguardianweather",
          "Weather"
        ),
        NewspaperBookSection(
          "theguardian/mainsection/sport",
          "Sport"
        )
      )
    ),
    NewspaperBook(
      "theguardian/sport",
      "Sport supplement",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/g2",
      "G2",
      Seq(
        NewspaperBookSection(
          "theguardian/g2/film-and-music",
          "Film and music"
        )
      )
    ),
    NewspaperBook(
      "theguardian/mediaguardian",
      "Media Guardian",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/educationguardian",
      "Education Guardian",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/societyguardian",
      "Society Guardian",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/filmandmusic",
      "Film and music",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/guardianreview",
      "Review",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/weekend",
      "Weekend",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/theguide",
      "The Guide",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/travel",
      "Travel",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/family",
      "Family",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/money",
      "Money",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/work",
      "Work",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/cook",
      "Cook",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/english-football-season-2012-13-preview",
      "English football season 2012-13 preview",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/the-season-2011-12",
      "The Season supplement",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/nhs-voices",
      "100 NHS Voices",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/100-nhs-voices",
      "100 NHS Voices",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/london-2012",
      "London Olympics",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/london-2012-daily",
      "London Olympics",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/paralympics-2012-daily",
      "Paralympics 2012",
      Seq.empty
    )    ,
    NewspaperBook(
      "theguardian/f1-2013-season-guide",
      "F1 2013 season guide",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/the-fashion",
      "Fashion magazine",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/fashion-magazine",
      "Fashion magazine",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/do-something",
      "Do something",
      Seq.empty
    ),
    NewspaperBook(
      "theguardian/guardian-world-cup-2014-guide",
      "Guardian World Cup 2014 guide",
      Seq.empty
    ),
    NewspaperBook(
      "theobserver/news",
      "Main section",
      Seq(
        NewspaperBookSection(
          "theobserver/news/uknews",
          "News"
        ),
        NewspaperBookSection(
          "theobserver/news/worldnews",
          "World news"
        ) ,
        NewspaperBookSection(
          "theobserver/news/focus",
          "Focus"
        ),
        NewspaperBookSection(
          "theobserver/news/comment",
          "Comment"
        ),
        NewspaperBookSection(
          "theobserver/news/7days",
          "Seven days"
        ) ,
        NewspaperBookSection(
          "theobserver/news/seven-days",
          "Seven days"
        ) ,
        NewspaperBookSection(
          "theobserver/news/business",
          "Business"
        ),
        NewspaperBookSection(
          "theobserver/news/cash",
          "Cash"
        )
      )
    ),
    NewspaperBook(
      "theobserver/sport",
      "Sport",
      Seq.empty
    ),

    NewspaperBook(
      "theobserver/new-review",
      "New review",
      Seq.empty
    ),
    NewspaperBook(
      "theobserver/magazine",
      "Magazine",
      Seq.empty
    ),
    NewspaperBook(
      "theobserver/foodmonthly",
      "Food monthly magazine",
      Seq.empty
    ),
    NewspaperBook(
      "theobserver/observer-olympic-previews",
      "Olympic previews",
      Seq.empty
    ),
    NewspaperBook(
      "theobserver/observer-tech-monthly",
      "Tech monthly",
      Seq.empty
    ),
    NewspaperBook(
      "extras/theobserverweather",
      "Weather",
      Seq.empty
    ),
    NewspaperBook(
      "standings/survey",
      "Survey",
      Seq.empty
    )
  )
}
