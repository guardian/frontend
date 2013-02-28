package model

import org.joda.time.DateTime
import views.support.Style

trait Trail extends Images with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def headline: String
  def url: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnail: Option[String] = None
  def isLive: Boolean
  def storyItems: Option[StoryItems] = None

  def importance = storyItems.map(_.importance).getOrElse(0)
  def colour = storyItems.map(_.colour).getOrElse(0)
  def quote = storyItems.flatMap(_.quote)

}

case class Trailblock(description: TrailblockDescription, trails: Seq[Trail])
case class TrailblockDescription(
    id: String, name: String, numItemsVisible: Int, style: Option[Style] = None, showMore: Boolean = false) {
  lazy val section = id.split("/").headOption.filterNot(_ == "").getOrElse("news")
}