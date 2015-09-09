package model

import common.Edition
import common.dfp.DfpAgent
import implicits.Dates
import org.scala_tools.time.Imports._

/**
 * additional information needed to display something on a facia page from CAPI
 */
trait Trail extends Elements with Tags with Dates {
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

  override def isSponsored(maybeEdition: Option[Edition]): Boolean =
    DfpAgent.isSponsored(tags, Some(section))
  override lazy val isAdvertisementFeature: Boolean =
    DfpAgent.isAdvertisementFeature(tags, Some(section))
  override lazy val isFoundationSupported: Boolean =
    DfpAgent.isFoundationSupported(tags, Some(section))

  def faciaUrl: Option[String] = this match {
    case t: Trail => Option(t.url)
  }
}
