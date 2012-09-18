package model

import org.joda.time.DateTime

trait Trail extends Images with Tags {
  def webPublicationDate: DateTime
  def linkText: String
  def url: String
  def trailText: Option[String]
  def section: String //sectionId
  def sectionName: String
  def thumbnail: Option[String] = None
}

case class Trailblock(description: TrailblockDescription, trails: Seq[Trail])

case class TrailblockDescription(id: String, name: String, numItemsVisible: Int, numLargeImages: Int = 0)