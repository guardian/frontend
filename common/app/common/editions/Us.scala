package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{RunningOrderTrailblockDescription, MetaData, ItemTrailblockDescription}
import views.support.{TopStories, Headline, Thumbnail, Featured}
import contentapi.QueryDefaults

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
      RunningOrderTrailblockDescription("news", "us/news/top-stories", "Top Stories", 5, style = Some(TopStories)),
      RunningOrderTrailblockDescription("news", "us/sport/top-stories", "Sports", 5, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "us/commentisfree/top-stories", "Comment is free", 3, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "us/culture/top-stories", "Culture", 3, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "us/business/top-stories", "Business", 1),
      RunningOrderTrailblockDescription("news", "us/lifeandstyle/top-stories", "Life and style", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "us/technology/top-stories", "Technology", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "us/travel/top-stories", "Travel", 1, style = Some(Thumbnail))
    )),

    (Editionalise("culture", Us), Seq(
      RunningOrderTrailblockDescription("culture", "us/culture/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("culture", "us/culture/features", "Features", 5),
      RunningOrderTrailblockDescription("culture", "us/culture/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("fashion", Us), Seq(
      RunningOrderTrailblockDescription("fashion", "us/fashion/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("fashion", "us/fashion/features", "Features", 5),
      RunningOrderTrailblockDescription("fashion", "us/fashion/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("technology", Us), Seq(
      RunningOrderTrailblockDescription("technology", "us/technology/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("technology", "us/technology/features", "Features", 5),
      RunningOrderTrailblockDescription("technology", "us/technology/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("film", Us), Seq(
      RunningOrderTrailblockDescription("film", "us/film/top-stories", "Film", 15)
    ))
  )
}
