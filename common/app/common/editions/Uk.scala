package common.editions

import common._
import org.joda.time.DateTimeZone
import model.MetaData
import views.support.{Headline, Thumbnail, Featured}
import scala.Some
import common.NavItem
import model.TrailblockDescription

object Uk extends Edition("UK", "UK edition", DateTimeZone.forID("Europe/London")) with Sections with Zones {

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
    "front" -> Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      TrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("money", "Money", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    ),

    "sport" -> Seq(
      TrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("football", "Football", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("sport/cricket", "Cricket", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/rugby-union", "Rugby Union", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/motorsports", "Motor Sport", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/tennis", "Tennis", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/golf", "Golf", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/horse-racing", "Horse Racing", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/rugbyleague", "Rugby League", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/us-sport", "US Sport", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/boxing", "Boxing", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/cycling", "Cycling", numItemsVisible = 1, style = Some(Headline))
    ),

    "culture" -> Seq(
      TrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline))
    )
  )
}
