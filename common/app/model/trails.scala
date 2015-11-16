package model

import implicits.Dates._
import org.scala_tools.time.Imports._
import play.api.libs.json.{Json, JsBoolean, JsString, JsValue}

/**
 * additional information needed to display something on a facia page from CAPI
 */
case class Trail (
  tags: Tags,
  commercial: Commercial,
  fields: Fields,
  metadata: MetaData,
  elements: Elements,

  webPublicationDate: DateTime,
  //webPublicationDate(edition: Edition): DateTime = webPublicationDate(edition.timezone),
  //webPublicationDate(zone: DateTimeZone): DateTime = webPublicationDate.withZone(zone),

  headline: String,
  byline: Option[String],
  //section: String, //sectionId
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
