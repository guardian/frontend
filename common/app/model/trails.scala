package model

import common.Edition
import dfp.DfpAgent
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

  /** TODO - this should be set in the Facia tool */
  def showByline: Boolean = isComment

  lazy val shouldHidePublicationDate: Boolean = {
    isAdvertisementFeature && webPublicationDate.isOlderThan(2.weeks)
  }

  override def isSponsored: Boolean = DfpAgent.isSponsored(tags, Some(section))
  override def isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(tags, Some(section))
  override def isFoundationSupported: Boolean = DfpAgent.isFoundationSupported(tags, Some(section))
}

//Facia tool values
trait FaciaFields {
  def group: Option[String] = None
  def supporting: List[Trail] = Nil
  def imageReplace: Boolean = false
  def imageSrc: Option[String] = None
  def imageSrcWidth: Option[String] = None
  def imageSrcHeight: Option[String] = None
  def isBoosted: Boolean = false
  def imageHide: Boolean = false
  def isBreaking: Boolean = false
  def showKickerTag: Boolean = false
  def showKickerSection: Boolean = false
  def showMainVideo: Boolean = false
  def imageCutoutReplace: Boolean = false
  def customImageCutout: Option[FaciaImageElement]
}
