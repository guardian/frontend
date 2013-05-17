package common.editions

import common._
import org.joda.time.DateTimeZone
import model.{QueryTrailblockDescription, ItemTrailblockDescription, MetaData}
import views.support.{Headline, Thumbnail, Featured}
import scala.Some
import common.NavItem
import conf.ContentApi
import contentapi.QueryDefaults

object Uk extends Edition("UK", "UK edition", DateTimeZone.forID("Europe/London")) with Sections with Zones
  with QueryDefaults {

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
    "front" -> Seq(
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

    "sport" -> Seq(
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

    "culture" -> Seq(
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline))
    ),

    "australia" -> Seq(
      ItemTrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true)(Au),
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 3, style = Some(Featured), showMore = true)(Au),
      ItemTrailblockDescription("sport/australia-sport", "Australia sport", numItemsVisible = 3, style = Some(Featured), showMore = true)(Au),
      QueryTrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Featured), showMore = true,
        customQuery=ContentApi.item.itemId("culture")
          .edition("au")
          .showTags("all")
          .showFields(trailFields)
          .showInlineElements(inlineElements)
          .showMedia("all")
          .showReferences(references)
          .showStoryPackage(true)
          .tag(s"-stage/stage,-artanddesign/art,-stage/theatre,-stage/dance,-stage/comedy,-stage/musicals,-artanddesign/photography,($supportedTypes)")),
      QueryTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true,
        customQuery=ContentApi.item.itemId("commentisfree")
          .edition("au")
          .showTags("all")
          .showFields(trailFields)
          .showInlineElements(inlineElements)
          .showMedia("all")
          .showReferences(references)
          .showStoryPackage(true)
          .tag(s"world/australia,($supportedTypes)")),
      ItemTrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail))(Au)
    )
  )
}
