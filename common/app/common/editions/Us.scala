package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{RunningOrderTrailblockDescription, MetaData, ItemTrailblockDescription}
import views.support._
import contentapi.QueryDefaults
import common.NavItem

object Us extends Edition(
  id = "US",
  displayName = "US edition",
  timezone = DateTimeZone.forID("America/New_York")
  ) with Sections with Zones with QueryDefaults {

  implicit val US = Us
  val zones = Seq(
    newsZone,
    sportsZone,
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
    NavItem(us),
    NavItem(world, Seq(us, europe, middleeast, asiapacific, africa, americas)),
    NavItem(sports, Seq(nfl, mlb, nba, mls, nhl, football)),
    footballNav(metadata),
    NavItem(cif, Seq(cifbelief, cifgreen)),
    NavItem(lifeandstyle, Seq(foodanddrink, fashion, relationships, healthandwellbeing, women)),
    NavItem(culture, Seq(film, music, books, televisionandradio, artanddesign, stage)),
    NavItem(business, Seq(economics, banking, property, workandcareers, savings)),
    NavItem(technology, Seq(internet, games, mobilephones, appsblog)),
    NavItem(environment, Seq(climatechange, wildlife, energy, conservation, food)),
    NavItem(media)
  )


  val configuredFronts = Map(
    Editionalise("", Us) -> Seq(
      ItemTrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      ItemTrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    Editionalise("sport", Us) -> Seq(
      ItemTrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport/nfl", "NFL", numItemsVisible = 3, style = Some(Featured)),
      ItemTrailblockDescription("sport/mlb", "MLB", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/nba", "NBA", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("football/mls", "MLS", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/nhl", "NHL", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    Editionalise("culture", Us) -> Seq(
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    Editionalise("commentisfree", Us) -> Seq(
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("business", Us) -> Seq(
      ItemTrailblockDescription("business", "Business", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("money", Us) -> Seq(
      ItemTrailblockDescription("money", "Money", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("australia", Us)  -> Seq(
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

    (Editionalise("", Us), Seq(
      RunningOrderTrailblockDescription("", "us/news/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("", "us/news/top-stories", "News", 10, style = Some(FastNews)),
      RunningOrderTrailblockDescription("sport", "us/sport/top-stories", "Sports", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("commentisfree", "us/comment-is-free/top-stories", "Comment is free", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("culture", "us/culture/top-stories", "Culture", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("business", "us/business/top-stories", "Business", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("lifeandstyle", "us/life-and-style/top-stories", "Life and style", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("technology", "us/technology/top-stories", "Technology", 3, style = Some(SectionZone)),
      RunningOrderTrailblockDescription("travel", "us/travel/top-stories", "Travel", 3, style = Some(SectionZone))
    )),

    (Editionalise("sport", Us), Seq(
      RunningOrderTrailblockDescription("sport", "us/sport/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("sport", "us/sport/top-stories", "Sports", 5, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("sport/nfl", "us/sport/nfl", "NFL", 3, style = Some(Featured)),
      RunningOrderTrailblockDescription("sport/mlb", "us/sport/mlb", "MLB", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/nba", "us/sport/nba", "NBA", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("football/mls", "us/sport/mls", "MLS", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/nhl", "us/sport/nhl", "NHL", 1, style = Some(Thumbnail))
    )),

    (Editionalise("culture", Us), Seq(
      RunningOrderTrailblockDescription("culture", "us/culture/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("culture", "us/culture/top-stories", "Culture", 5, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("film", "us/film/top-stories", "Film", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("music", "us/culture/music", "Music", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("stage", "us/culture/stage", "Stage", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("books", "us/culture/books", "Books", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("artanddesign", "us/culture/art-and-design", "Art & Design", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("technology/games", "us/culture/games", "Games", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("tv-and-radio", "us/culture/tv-and-radio", "TV & Radio", 1, style = Some(Thumbnail))
    )),

    (Editionalise("commentisfree", Us), Seq(
      RunningOrderTrailblockDescription("commentisfree", "us/comment-is-free/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("commentisfree", "us/comment-is-free/top-stories", "Comment is free", 20, style = Some(Featured))
    )),

    (Editionalise("business", Us), Seq(
      RunningOrderTrailblockDescription("business", "us/business/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("business", "us/business/top-stories", "Business", 20, style = Some(Featured))
    )),

    (Editionalise("money", Us), Seq(
      RunningOrderTrailblockDescription("money", "us/money/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("money", "us/money/top-stories", "Money", 20, style = Some(Featured))
    ))

  )
}
