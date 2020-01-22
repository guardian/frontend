package models

import com.gu.contentapi.client.utils.{Article, DesignType}
import common.LinkTo
import model.pressed.{MediaType, PressedContent}
import play.api.mvc.RequestHeader
import views.support.{ContentOldAgeDescriber, GUDateTimeFormat, ImgSrc, RemoveOuterParaHtml}
import play.api.libs.json._
import implicits.FaciaContentFrontendHelpers._
import layout.ContentCard
import models.dotcomponents.OnwardsUtils.findPillar
import org.joda.time.DateTimeZone

case class OnwardItem(
  url: String,
  linkText: String,
  showByline: Boolean,
  byline: Option[String],
  image: Option[String],
  ageWarning: Option[String],
  isLiveBlog: Boolean,
  pillar: String,
  designType: String,
  webPublicationDate: String,
  headline: String,
  mediaType: Option[String],
)

object OnwardItem {
  def maybeFromContentCard(contentCard: ContentCard): Option[OnwardItem] = {
    for {
      url <- contentCard.shortUrl
      linkText <- contentCard.trailText
      webPublicationDate <- contentCard.webPublicationDate.map( x => x.toDateTime().toString() )
    } yield OnwardItem(
      url= url,
      linkText = linkText,
      showByline = false,
      byline = contentCard.byline.map( x => x.get ),
      image = None,
      ageWarning = None,
      isLiveBlog = false,
      pillar = "news",
      designType = "",
      webPublicationDate = webPublicationDate,
      headline = "",
      mediaType = contentCard.mediaType.map( x => x.toString ))
  }
}

case class MostPopularGeoResponse(
  country: Option[String],
  heading: String,
  trails: Seq[OnwardItem]
)

case class OnwardCollectionResponse(
  heading: String,
  trails: Seq[OnwardItem]
)

case class OnwardCollectionForDCRv2(
  tabs: Seq[OnwardCollectionResponse],
  mostCommented: Option[OnwardItem],
  mostShared: Option[OnwardItem]
)

object OnwardCollection {

  implicit val itemWrites = Json.writes[OnwardItem]
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
  implicit val onwardCollectionResponseForDRCv2Writes = Json.writes[OnwardCollectionForDCRv2]

  def trailsToItems(trails: Seq[PressedContent])(implicit request: RequestHeader): Seq[OnwardItem] = {
    def ageWarning(content: PressedContent): Option[String] = {
      content.properties.maybeContent
        .filter(c => c.tags.tags.exists(_.id == "tone/news"))
        .map(ContentOldAgeDescriber.apply)
        .filterNot(_ == "")
    }

    trails.take(10).map(content =>
      OnwardItem(
        url = LinkTo(content.header.url),
        linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
        showByline = content.properties.showByline,
        byline = content.properties.byline,
        image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
        ageWarning = ageWarning(content),
        isLiveBlog = content.properties.isLiveBlog,
        pillar = findPillar(content.maybePillar, content.properties.maybeContent.map(_.metadata.designType)),
        designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
        webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
        headline = content.header.headline,
        mediaType = content.card.mediaType.map(_.toString())
      )
    )
  }
}
