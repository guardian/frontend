package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{RunningOrderTrailblockDescription, ItemTrailblockDescription, MetaData}
import views.support.{Headline, Thumbnail, Featured, SectionFront, TopStories}
import scala.Some
import common.NavItem


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
      RunningOrderTrailblockDescription("news", "uk/news/top-stories", "Top Stories", 4, style = Some(TopStories)),
      RunningOrderTrailblockDescription("news", "uk/sport/top-stories", "Sports", 5, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "uk/commentisfree/top-stories", "Comment is free", 3, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "uk/culture/top-stories", "Culture", 3, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "uk/business/top-stories", "Business", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "uk/lifeandstyle/top-stories", "Life and style", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "uk/technology/top-stories", "Technology", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "uk/money/top-stories", "Money", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "uk/travel/top-stories", "Travel", 1, style = Some(Thumbnail))
    )),

    (Editionalise("culture", Uk), Seq(
      RunningOrderTrailblockDescription("culture", "uk/culture/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("culture", "uk/culture/features", "Features", 5),
      RunningOrderTrailblockDescription("culture", "uk/culture/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("fashion", Uk), Seq(
      RunningOrderTrailblockDescription("fashion", "uk/fashion/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("fashion", "uk/fashion/features", "Features", 5),
      RunningOrderTrailblockDescription("fashion", "uk/fashion/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("technology", Uk), Seq(
      RunningOrderTrailblockDescription("technology", "uk/technology/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("technology", "uk/technology/features", "Features", 5),
      RunningOrderTrailblockDescription("technology", "uk/technology/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("film", Uk), Seq(
      RunningOrderTrailblockDescription("film", "uk/film/top-stories", "Film", 15, style = Some(SectionFront))
    ))
  )
}
