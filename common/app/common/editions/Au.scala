package common.editions

import org.joda.time.DateTimeZone
import model._
import common._
import views.support._
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
      RunningOrderTrailblockDescription("", "au/news/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("", "au/news/top-stories", "Latest News", 20, style = Some(TopStories)),
      RunningOrderTrailblockDescription("news", "au/news/election2013", "Election 2013", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("sport", "au/sport/top-stories", "Sport", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("sport/australia-sport", "au/sport/australia-sport", "Australia Sport", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("culture", "au/culture/top-stories", "Culture", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("commentisfree", "au/comment-is-free/top-stories", "Comment is free", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("lifeandstyle", "au/life-and-style/top-stories", "Life and style", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("technology", "au/technology/top-stories", "Technology", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("travel", "au/travel/top-stories", "Travel", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("science", "au/science/top-stories", "Science", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("environment", "au/environment/top-stories", "Environment", 4, style = Some(Masthead))
    )),

    (Editionalise("sport", Au), Seq(
      RunningOrderTrailblockDescription("sport", "au/sport/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("sport", "au/sport/top-stories", "Sports", 5, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("football", "au/sport/football", "Football", 3, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("sport/cricket", "au/sport/cricket", "Cricket", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/afl", "au/sport/afl", "AFL", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/nrl", "au/sport/nrl", "NRL", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/rugby-union", "au/sport/rugby-union", "Rugby Union", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/tennis", "au/sport/tennis", "Tennis", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/golf", "au/sport/golf", "Golf", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/motorsports", "au/sport/motor-sport", "Motor Sport", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/cycling", "au/sport/cycling", "Cycling", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/us-sport", "au/sport/us-sport", "US Sport", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("sport/boxing", "au/sport/boxing", "Boxing", 1, style = Some(Thumbnail))
    )),

    (Editionalise("culture", Au), Seq(
      RunningOrderTrailblockDescription("culture", "au/culture/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("culture", "au/culture/top-stories", "Culture", 5, style = Some(Featured), showMore = true),
      RunningOrderTrailblockDescription("film", "au/film/top-stories", "Film", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("music", "au/culture/music", "Music", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("books", "au/culture/books", "Books", 1, style = Some(Thumbnail)),
      RunningOrderTrailblockDescription("technology/games", "au/culture/games", "Games", 1, style = Some(Thumbnail))
    )),

    (Editionalise("commentisfree", Au), Seq(
      RunningOrderTrailblockDescription("commentisfree", "au/comment-is-free/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("commentisfree", "au/comment-is-free/top-stories", "Comment is free", 20, style = Some(Featured))
    )),

    (Editionalise("business", Au), Seq(
      RunningOrderTrailblockDescription("business", "au/business/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("business", "au/business/top-stories", "Business", 20, style = Some(Featured))
    )),

    (Editionalise("money", Au), Seq(
      RunningOrderTrailblockDescription("money", "au/money/masthead", "", 4, style = Some(Masthead)),
      RunningOrderTrailblockDescription("money", "au/money/top-stories", "Money", 20, style = Some(Featured))
    ))

  )
}
