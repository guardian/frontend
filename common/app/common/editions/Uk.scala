package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{RunningOrderTrailblockDescription, ItemTrailblockDescription, MetaData}
import views.support._


object Uk extends Edition(
  id = "UK",
  displayName = "UK edition",
  timezone = DateTimeZone.forID("Europe/London")
  ) with Sections with Zones {

  implicit val UK = Uk
  val zones = Seq(
    newsZone,
    sportZone,
    cifZone,
    cultureZone,
    technologyZone,
    businessZone,
    moneyZone,
    lifeandstyleZone,
    travelZone
  )

  def navigation(metadata: MetaData) = Seq(
    NavItem(home),
    NavItem(uk, Seq(politics, media, science, society, health, education)),
    NavItem(world, Seq(us, europe, middleeast, asiapacific, africa, americas)),
    NavItem(cif, Seq(cifbelief, cifgreen)),
    NavItem(sport, Seq(football, cricket, tennis, rugbyunion, cycling)),
    footballNav(metadata),
    NavItem(lifeandstyle, Seq(foodanddrink, fashion, relationships, healthandwellbeing, women)),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business, Seq(economics, banking, property, workandcareers, savings)),
    NavItem(travel, Seq(shortbreaks, uktravel, europetravel, hotels, resturants)),
    NavItem(technology, Seq(internet, games, mobilephones, appsblog)),
    NavItem(environment, Seq(climatechange, wildlife, energy, conservation, food))
  )


  val configuredFronts = Map(
    Editionalise("", Uk) -> Seq(
      ItemTrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      ItemTrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("money", "Money", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    Editionalise("sport", Uk) -> Seq(
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("football", "Football", numItemsVisible = 3, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport/cricket", "Cricket", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/rugby-union", "Rugby Union", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/motorsports", "Motor Sport", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/tennis", "Tennis", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/golf", "Golf", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/horse-racing", "Horse Racing", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/rugbyleague", "Rugby League", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/us-sport", "US Sport", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/boxing", "Boxing", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/cycling", "Cycling", numItemsVisible = 1, style = Some(Headline))
    ),

    Editionalise("culture", Uk) -> Seq(
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline))
    ),

    Editionalise("commentisfree", Uk) -> Seq(
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("business", Uk) -> Seq(
      ItemTrailblockDescription("business", "Business", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("money", Uk) -> Seq(
      ItemTrailblockDescription("money", "Money", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("australia", Uk) -> Seq(
      ItemTrailblockDescription("", "News", numItemsVisible = 8, style = Some(Featured), showMore = false)(Au),
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 3, style = Some(Featured), showMore = false)(Au),
      ItemTrailblockDescription("sport/australia-sport", "Australia sport", numItemsVisible = 3, style = Some(Thumbnail), showMore = false)(Au),
      Au.cultureCustomBlock,
      Au.commentCustomBlock,
      ItemTrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      ItemTrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail), showMore = false)(Au),
      ItemTrailblockDescription("science", "Science", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      ItemTrailblockDescription("environment", "Environment", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      Au.videoCustomBlock

    )
  )

  val configuredFrontsFacia = Map(

    (Editionalise("", Uk), Seq(
      RunningOrderTrailblockDescription("", "uk/news/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("", "uk/news/top-stories", "News", 10, style = Some(FastNews)),
      RunningOrderTrailblockDescription("sport", "uk/sport/top-stories", "Sport", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("commentisfree", "uk/comment-is-free/top-stories", "Comment is free", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("culture", "uk/culture/top-stories", "Culture", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("business", "uk/business/top-stories", "Business", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("lifeandstyle", "uk/life-and-style/top-stories", "Life and style", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("technology", "uk/technology/top-stories", "Technology", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("money", "uk/money/top-stories", "Money", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("travel", "uk/travel/top-stories", "Travel", 3, style = Some(SectionZone))
    )),

    (Editionalise("sport", Uk), Seq(
      RunningOrderTrailblockDescription("sport", "uk/sport/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("sport", "uk/sport/top-stories", "Sport", 5, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("football", "uk/sport/football", "Football", 3, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("sport/cricket", "uk/sport/cricket", "Cricket", 1, style = Some(Featured)),
      RunningOrderTrailblockDescription("sport/rugby-union", "uk/sport/rugby-union", "Rugby Union", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/motorsports", "uk/sport/motor-sport", "Motor Sport", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/tennis", "uk/sport/tennis", "Tennis", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/golf", "uk/sport/golf", "Golf", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/horse-racing", "uk/sport/horse-racing", "Horse Racing", 1, style = Some(Headline)),
      RunningOrderTrailblockDescription("sport/rugbyleague", "uk/sport/rugby-league", "Rugby League", 1, style = Some(Headline)),
      RunningOrderTrailblockDescription("sport/us-sport", "uk/sport/us-sport", "US Sport", 1, style = Some(Headline)),
      RunningOrderTrailblockDescription("sport/boxing", "uk/sport/boxing", "Boxing", 1, style = Some(Headline)),
      RunningOrderTrailblockDescription("sport/cycling", "uk/sport/cycling", "Cycling", 1, style = Some(Headline))
    )),

    (Editionalise("culture", Uk), Seq(
      RunningOrderTrailblockDescription("culture", "uk/culture/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("culture", "uk/culture/top-stories", "Culture", 5, style = Some(Thumbnail), showMore = true),
      RunningOrderTrailblockDescription("tv-and-radio", "uk/culture/tv-and-radio", "TV & Radio", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("film", "uk/film/top-stories", "Film", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("music", "uk/culture/music", "Music", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("stage", "uk/culture/stage", "Stage", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("books", "uk/culture/books", "Books", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("artanddesign", "uk/culture/art-and-design", "Art & Design", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("technology/games", "uk/culture/games", "Games", 1, style = Some(Thumbnail))
    )),

    (Editionalise("commentisfree", Uk), Seq(
      RunningOrderTrailblockDescription("commentisfree", "uk/comment-is-free/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("commentisfree", "uk/comment-is-free/top-stories", "Comment is free", 20, style = Some(Featured))
    )),

    (Editionalise("business", Uk), Seq(
      RunningOrderTrailblockDescription("business", "uk/business/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("business", "uk/business/top-stories", "Business", 20, style = Some(Featured))
    )),

    (Editionalise("money", Uk), Seq(
      RunningOrderTrailblockDescription("money", "uk/money/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("money", "uk/money/top-stories", "Money", 20, style = Some(Featured))
    ))

  )
}
