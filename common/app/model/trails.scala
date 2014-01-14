package model

import conf.{Configuration, ContentApi}
import common._
import contentapi.QueryDefaults
import org.joda.time.DateTime
import play.api.libs.ws.{ WS, Response }
import play.api.libs.json.Json._
import play.api.libs.json.JsObject
import scala.concurrent.Future
import services.S3FrontsApi
import views.support.Style


trait Trail extends Elements with Tags with FaciaFields {
  def webPublicationDate: DateTime
  def linkText: String
  def headline: String
  def url: String
  def webUrl: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnailPath: Option[String] = None
  def isLive: Boolean
  def discussionId: Option[String] = None
  def isClosedForComments: Boolean = false
  def leadingParagraphs: List[org.jsoup.nodes.Element] = Nil
  def byline: Option[String] = None
  def trailType: Option[String] = None
}

//Facia tool values
trait FaciaFields {
  def group: Option[String] = None
  def supporting: List[Trail] = Nil
  def imageAdjust: Option[String] = None
}
