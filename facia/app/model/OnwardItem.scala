package model

import com.github.nscala_time.time.Imports.DateTimeZone
import common.{Edition, LinkTo}
import model.facia.PressedCollection
import model.pressed.PressedContent
import play.api.libs.json.Json
import views.support.{ImageProfile, ImgSrc, Item300, Item460, RemoveOuterParaHtml}
import implicits.FaciaContentFrontendHelpers._
import play.api.mvc.RequestHeader
import model.dotcomrendering.OnwardItemNx2

case class OnwardItem(
    url: String,
    linkText: String,
    showByline: Boolean,
    byline: Option[String],
    image: Option[String],
    carouselImages: Map[String, Option[String]],
    ageWarning: Option[String],
    isLiveBlog: Boolean,
    pillar: String,
    designType: String,
    webPublicationDate: String,
    headline: String,
    mediaType: Option[String],
    shortUrl: String,
    kickerText: Option[String],
    starRating: Option[Int]
)

// object OnwardItem {

//   implicit def writes = Json.writes[OnwardItem]


//   // We ideally want this to be replaced by something else in the near future. Probably
//   // image-rendering or similar. But this will do for now.
//   // Duplicated from onward/app/models/MostPopularNx2.scala#L64
//   // TODO: Replace this when we have a more solid API for trails.

//   def getImageSources(imageMedia: Option[ImageMedia]): Map[String, Option[String]] = {
//     val images = for {
//       profile: ImageProfile <- List(Item300, Item460)
//       width: Int <- profile.width
//       trailPicture: ImageMedia <- imageMedia
//     } yield {
//       width.toString -> profile.bestSrcFor(trailPicture)
//     }
//     images.toMap
//   }

//   def pressedContentToOnwardItem(content: PressedContent, edition: Edition): OnwardItem = {
//     // a DCR hack that we should standardise
//     def pillarToString(pillar: Pillar): String = {
//       pillar.toString.toLowerCase() match {
//         case "arts" => "culture"
//         case other  => other
//       }
//     }

//     OnwardItem(
//       url = LinkTo(content.header.url, edition),
//       linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
//       showByline = content.properties.showByline,
//       byline = content.properties.byline,
//       image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
//       carouselImages = getImageSources(content.trailPicture),
//       ageWarning = content.ageWarning,
//       isLiveBlog = content.properties.isLiveBlog,
//       pillar = content.maybePillar.map(pillarToString).getOrElse("news"),
//       designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
//       webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
//       headline = content.header.headline,
//       mediaType = content.card.mediaType.map(_.toString()),
//       shortUrl = content.card.shortUrl,
//       kickerText = content.header.kicker.flatMap(_.properties.kickerText),
//       starRating = content.card.starRating,
//     )
//   }
// }

case class OnwardCollection(
    displayName: String,
    heading: String,
    trails: List[OnwardItemNx2],
)

object OnwardCollection {

  implicit def writes = Json.writes[OnwardCollection]

  def pressedCollectionToOnwardCollection(
      collection: PressedCollection,
  )(implicit request: RequestHeader): OnwardCollection = {
    val trails = collection.curatedPlusBackfillDeduplicated
      .take(10)
      .map(pressed => OnwardItemNx2.pressedContentToOnwardItemNx2(pressed))

    OnwardCollection(
      displayName = collection.displayName,
      heading = collection.displayName,
      trails = trails,
    )
  }
}
