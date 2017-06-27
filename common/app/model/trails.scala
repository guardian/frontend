package model

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import implicits.Dates._
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.libs.json.{JsBoolean, JsString, JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.{ImgSrc, Naked}

/**
 * additional information needed to display something on a facia page from CAPI
 */
object Trail {

  private val trailPicMinDesiredSize = 460

  // if you change these rules make sure you update IMAGES.md (in this project)
  private def findTrailImages(elements: Elements): Option[ImageMedia] = {
    // Try to pick a thumbnail element which contains an image with at least 460 width.
    val trailImageMedia = elements.thumbnail.find(_.images.imageCrops.exists(_.width >= trailPicMinDesiredSize)).map(_.images)
      .orElse(elements.mainPicture.map(_.images))
      .orElse(elements.videos.headOption.map(_.images))
      .orElse(elements.thumbnail.map(_.images))

    // Try to take the master (or largest) 5:3 image and the smallest 5:3 image. At render-time, the image resizing service
    // will size the largest image according to card width.  If the resizing service is switched off, we use the smallest.
    // Filtering the list of images here means that facia-press does not need to slim down the Trail object any further.
    trailImageMedia.flatMap { imageMedia =>
      val filteredTrailImages = imageMedia.allImages.filter { image =>
        IsRatio(5, 3, image.width, image.height) && image.width >= trailPicMinDesiredSize
      } sortBy(_.width)

      Seq(
        filteredTrailImages.find(_.isMaster).orElse(filteredTrailImages.lastOption), // master 5:3 image or largest
        filteredTrailImages.headOption // smallest 5:3 image over 460 width
      ).flatten match {
        case Nil => None
        case imgs => Some(ImageMedia.make(imgs))
      }
    }
  }

  def make(
    tags: Tags,
    fields: Fields,
    commercial: Commercial,
    elements: Elements,
    metadata: MetaData,
    apiContent: contentapi.Content): Trail = {

    Trail(
      webPublicationDate = apiContent.webPublicationDate.map(_.toJodaDateTime).getOrElse(DateTime.now),
      headline = apiContent.fields.flatMap(_.headline).getOrElse(""),
      sectionName = apiContent.sectionName.getOrElse(""),
      thumbnailPath = apiContent.fields.flatMap(_.thumbnail).map(ImgSrc(_, Naked)),
      isCommentable = apiContent.fields.flatMap(_.commentable).exists(b => b),
      isClosedForComments = !apiContent.fields.flatMap(_.commentCloseDate).map(_.toJodaDateTime).exists(_.isAfterNow),
      byline = apiContent.fields.flatMap(_.byline).map(stripHtml),
      trailPicture = findTrailImages(elements),
      tags = tags,
      commercial = commercial,
      fields = fields,
      metadata = metadata,
      elements = elements
    )
  }
}

final case class Trail (
  tags: Tags,
  commercial: Commercial,
  fields: Fields,
  metadata: MetaData,
  elements: Elements,
  webPublicationDate: DateTime,
  headline: String,
  byline: Option[String],
  sectionName: String,
  trailPicture: Option[ImageMedia],
  thumbnailPath: Option[String] = None,
  discussionId: Option[String] = None,
  isCommentable: Boolean = false,
  isClosedForComments: Boolean = false
){
  /** TODO - this should be set in the Facia tool */
  lazy val showByline: Boolean = tags.isComment

  def shouldHidePublicationDate(implicit request: RequestHeader): Boolean = {
    val isPaidContent = metadata.commercial.exists(_.isPaidContent)
    isPaidContent && webPublicationDate.isOlderThan(2.weeks)
  }

  def faciaUrl: Option[String] = this match {
    case t: Trail => Option(t.metadata.url)
  }

  lazy val trailType: Option[String] = {
    if (tags.tags.exists(_.id == "tone/comment")) {
      Option("comment")
    } else if (tags.tags.exists(_.id == "tone/features")) {
      Option("feature")
    } else {
      Option("news")
    }
  }

  def javascriptConfig: Map[String, JsValue] = Map(
    ("sectionName", JsString(sectionName)),
    ("thumbnail", thumbnailPath.map(JsString.apply).getOrElse(JsBoolean(false))),
    ("isLive", JsBoolean(fields.isLive)),
    ("webPublicationDate", Json.toJson(webPublicationDate)),
    ("headline", JsString(headline)),
    ("commentable", JsBoolean(isCommentable))
  )
}
