package model

import org.joda.time.DateTime
import views.support.Style
import scala.math

trait Trail extends Images with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def headline: String
  def url: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnail: Option[String] = None
  def thumbnailPath: Option[String] = None
  def isLive: Boolean
  def storyItems: Option[StoryItems] = None

  def importance = storyItems.map(_.importance).getOrElse(0)
  def colour = storyItems.map(_.colour).getOrElse(0)
  def quote = storyItems.flatMap(_.quote)

  def shares = storyItems.flatMap(_.shares).getOrElse(0)
  def comments = storyItems.flatMap(_.comments).getOrElse(0)

  // Decayed performance, calculated as: ( shares + comments/2 ) / Days^1.5 (with days minimum = 1)
  lazy val performance = if (shares > 0 || comments > 0) (shares + comments / 2) / math.pow(math.max(1, ((new DateTime).getMillis - webPublicationDate.getMillis) / 86400000), 1.5).toFloat else 0
}

case class Trailblock(description: TrailblockDescription, trails: Seq[Trail])
case class TrailblockDescription(
    id: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false) {
  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")
}
