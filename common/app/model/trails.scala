package model

import org.joda.time.{DateTimeZone, DateTime}
import common.Edition


trait Trail extends Elements with Tags with FaciaFields {
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
  def isClosedForComments: Boolean = false
  def leadingParagraphs: List[org.jsoup.nodes.Element] = Nil
  def byline: Option[String] = None
  def trailType: Option[String] = None
}

//Facia tool values
trait FaciaFields {
  def group: Option[String] = None
  def supporting: List[Trail] = Nil
  def imageAdjust: String = "default"
  def isBreaking: Boolean = false
}
