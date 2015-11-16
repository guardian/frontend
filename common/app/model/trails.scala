package model

import com.gu.contentapi.client.{model => contentapi}
import implicits.Dates._
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.scala_tools.time.Imports._
import play.api.libs.json.{Json, JsBoolean, JsString, JsValue}
import views.support.{Naked, ImgSrc}
import scala.collection.JavaConversions._

/**
 * additional information needed to display something on a facia page from CAPI
 */
object Trail {
  def make(
    tags: Tags,
    fields: Fields,
    commercial: Commercial,
    elements: Elements,
    metadata: MetaData,
    apiContent: contentapi.Content) = {
    Trail(
      webPublicationDate = apiContent.webPublicationDateOption.getOrElse(DateTime.now),
      headline = apiContent.safeFields.getOrElse("headline", ""),
      sectionName = apiContent.sectionName.getOrElse(""),
      thumbnailPath = apiContent.safeFields.get("thumbnail").map(ImgSrc(_, Naked)),
      isCommentable = apiContent.safeFields.get("commentable").exists(_.toBoolean),
      isClosedForComments = !apiContent.safeFields.get("commentCloseDate").exists(_.parseISODateTime.isAfterNow),
      leadingParagraphs = {
        val body = apiContent.safeFields.get("body")
        val souped = body flatMap { body =>
          val souped = Jsoup.parseBodyFragment(body).body().select("p")
          Option(souped) map { _.toList }
        }
        souped getOrElse Nil
      },
      byline = apiContent.safeFields.get("byline").map(stripHtml),
      trailPicture = elements.thumbnail.find(_.imageCrops.exists(_.width >= elements.trailPicMinDesiredSize))
        .orElse(elements.mainPicture)
        .orElse(elements.thumbnail),
      tags = tags,
      commercial = commercial,
      fields = fields,
      metadata = metadata,
      elements = elements
    )
  }
}

case class Trail (
  tags: Tags,
  commercial: Commercial,
  fields: Fields,
  metadata: MetaData,
  elements: Elements,
  webPublicationDate: DateTime,
  headline: String,
  byline: Option[String],
  sectionName: String,
  trailPicture: Option[ImageContainer],
  thumbnailPath: Option[String] = None,
  discussionId: Option[String] = None,
  isCommentable: Boolean = false,
  isClosedForComments: Boolean = false,
  leadingParagraphs: List[org.jsoup.nodes.Element] = Nil
){
  /** TODO - this should be set in the Facia tool */
  lazy val showByline: Boolean = tags.isComment

  lazy val shouldHidePublicationDate: Boolean = {
    commercial.isAdvertisementFeature && webPublicationDate.isOlderThan(2.weeks)
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
