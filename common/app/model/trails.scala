package model

import common.Edition
import implicits.Dates
import org.scala_tools.time.Imports._


trait Trail extends Elements with Tags with FaciaFields with Dates {
  def webPublicationDate: DateTime
  def webPublicationDate(edition: Edition): DateTime = webPublicationDate(edition.timezone)
  def webPublicationDate(zone: DateTimeZone): DateTime = webPublicationDate.withZone(zone)

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
  def isCommentable: Boolean = false
  def isClosedForComments: Boolean = false
  def leadingParagraphs: List[org.jsoup.nodes.Element] = Nil
  def byline: Option[String] = None
  def trailType: Option[String] = None

  lazy val shouldHidePublicationDate: Boolean = {
    isAdvertisementFeature && webPublicationDate.isOlderThan(2.weeks)
  }
}

//Facia tool values
trait FaciaFields {
  def group: Option[String] = None
  def supporting: List[Trail] = Nil
  def imageSrc: Option[String] = None
  def imageSrcWidth: Option[String] = None
  def imageSrcHeight: Option[String] = None
  def imageAdjust: String = "default"
  def isBreaking: Boolean = false
  def kicker: Option[String] = None
  def showMainVideo: Boolean = false
}
