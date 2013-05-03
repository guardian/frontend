package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{MetaData, TrailblockDescription}
import views.support.{Headline, Thumbnail, Featured}
import scala.Some
import common.NavItem
import model.TrailblockDescription

object Us extends Edition("US", "US edition", DateTimeZone.forID("America/New_York")) with Sections with Zones {

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
    "front" -> Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      TrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    "sport" -> Seq(
      TrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport/nfl", "NFL", numItemsVisible = 3, style = Some(Featured)),
      TrailblockDescription("sport/mlb", "MLB", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/nba", "NBA", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("football/mls", "MLS", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/nhl", "NHL", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    "culture" -> Seq(
      TrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail))
    )
  )
}
