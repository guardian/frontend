package common.editions

import org.joda.time.DateTimeZone
import model._
import common._
import views.support.{TopStories, Headline, Thumbnail, Featured}
import scala.concurrent.Future
import conf.ContentApi
import contentapi.QueryDefaults
import com.gu.openplatform.contentapi.model.ItemResponse
import common.NavItem


//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition(
  id = "AU",
  displayName = "Australia edition",
  DateTimeZone.forID("Australia/Sydney")
  ) with Sections with Zones with QueryDefaults {

  implicit val AU = Au

  val cultureCustomBlock = CustomTrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail)){

    val promiseOfCulture: Future[ItemResponse] = ContentApi.item.itemId("culture")
      .edition("au")
      .showTags("all")
      .showFields(trailFields)
      .showInlineElements(inlineElements)
      .showMedia("all")
      .showReferences(references)
      .showStoryPackage(true)
      .tag(s"-stage/stage,-artanddesign/art,-stage/theatre,-stage/dance,-stage/comedy,-stage/musicals,-artanddesign/photography,($supportedTypes)")
      .response

    EditorsPicsOrLeadContentAndLatest(promiseOfCulture)
  }

  val commentCustomBlock = CustomTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured)){

    val promiseOfComment: Future[ItemResponse] = ContentApi.item.itemId("commentisfree")
      .edition("au")
      .showTags("all")
      .showFields(trailFields)
      .showInlineElements(inlineElements)
      .showMedia("all")
      .showEditorsPicks(true)
      .showReferences(references)
      .showStoryPackage(true)
      .tag(s"($supportedTypes)")
      .response

    EditorsPicsOrLeadContentAndLatest(promiseOfComment)
  }

  val videoCustomBlock = CustomTrailblockDescription("type/video", "Video", numItemsVisible = 1, style = Some(Featured)){

    val promiseOfAustralianVideo: Future[ItemResponse] = ContentApi.item.itemId("type/video")
      .edition("au")
      .showTags("all")
      .showFields(trailFields)
      .showInlineElements(inlineElements)
      .showMedia("all")
      .showReferences(references)
      .showStoryPackage(true)
      .tag(s"world/australia")
      .response

    promiseOfAustralianVideo.map(_.results.map(new Content(_)))
  }


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
    Editionalise("", Au) -> Seq(
      ItemTrailblockDescription("", "News", numItemsVisible = 8, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 3, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport/australia-sport", "Australia sport", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      Au.cultureCustomBlock,
      Au.commentCustomBlock,
      ItemTrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      ItemTrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      ItemTrailblockDescription("science", "Science", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      ItemTrailblockDescription("environment", "Environment", numItemsVisible = 1, style = Some(Thumbnail), showMore = false),
      Au.videoCustomBlock
    ),

    Editionalise("sport", Au) -> Seq(
      ItemTrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("football", "Football", numItemsVisible = 3, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("sport/cricket", "Cricket", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/afl", "AFL", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/nrl", "NRL", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/rugby-union", "Rugby Union", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/tennis", "Tennis", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/golf", "Golf", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/motorsports", "Motor Sport", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("sport/cycling", "Cycling", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/us-sport", "US Sport", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("sport/boxing", "Boxing", numItemsVisible = 1, style = Some(Headline))

    ),

    Editionalise("culture", Au) -> Seq(
      ItemTrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      ItemTrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      ItemTrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      ItemTrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline))
    ),

    Editionalise("commentisfree", Au) -> Seq(
      ItemTrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("business", Au) -> Seq(
      ItemTrailblockDescription("business", "Business", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("money", Au) -> Seq(
      ItemTrailblockDescription("money", "Money", numItemsVisible = 20, style = Some(Featured))
    ),

    Editionalise("australia", Au) -> Seq(
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
    (Editionalise("", Au), Seq(
      RunningOrderTrailblockDescription("news", "au/news/top-stories", "Top Stories", 5, style = Some(TopStories)),
      RunningOrderTrailblockDescription("news", "au/sport/top-stories", "Sports", 5, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "au/commentisfree/top-stories", "Comment is free", 3, style = Some(Featured)),
      RunningOrderTrailblockDescription("news", "au/culture/top-stories", "Culture", 3, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "au/business/top-stories", "Business", 1),
      RunningOrderTrailblockDescription("news", "au/lifeandstyle/top-stories", "Life and style", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "au/technology/top-stories", "Technology", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("news", "au/travel/top-stories", "Travel", 1, style = Some(Thumbnail))
    )),

    (Editionalise("culture", Au), Seq(
      RunningOrderTrailblockDescription("culture", "au/culture/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("culture", "au/culture/features", "Features", 5),
      RunningOrderTrailblockDescription("culture", "au/culture/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("fashion", Au), Seq(
      RunningOrderTrailblockDescription("fashion", "au/fashion/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("fashion", "au/fashion/features", "Features", 5),
      RunningOrderTrailblockDescription("fashion", "au/fashion/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("technology", Au), Seq(
      RunningOrderTrailblockDescription("technology", "au/technology/top-stories", "Top Stories", 5),
      RunningOrderTrailblockDescription("technology", "au/technology/features", "Features", 5),
      RunningOrderTrailblockDescription("technology", "au/technology/editors-picks", "Editor's Picks", 5)
    )),

    (Editionalise("film", Au), Seq(
      RunningOrderTrailblockDescription("film", "au/film/top-stories", "Film", 15)
    ))
  )
}
