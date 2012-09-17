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

case class TrailWithPackage(trail: Trail, storyPackage: Seq[Trail] = Nil) {
  lazy val hasCorrectSizeImage = trail.imageOfWidth(460).isDefined
  lazy val layout = if (hasCorrectSizeImage && storyPackage.size > 1) "impact" else "normal"
}

case class Trailblock(description: TrailblockDescription, trails: Seq[TrailWithPackage])
case class TrailblockDescription(id: String, name: String, numItemsVisible: Int)