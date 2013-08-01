package model

import common.ManifestData

trait MetaData {
  def id: String
  def section: String
  def webTitle: String
  def analyticsName: String

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build

  //must be one of... http://schema.org/docs/schemas.html
  def schemaType: Option[String] = None

  def metaData: Map[String, Any] = Map(
    "page-id" -> id,
    "section" -> section,
    "web-title" -> webTitle,
    "build-number" -> buildNumber,
    "analytics-name" -> analyticsName
  )

  def cacheSeconds = 60
}

class Page(
  val id: String,
  val section: String,
  val webTitle: String,
  val analyticsName: String) extends MetaData

object Page {
  def apply(
    id: String,
    section: String,
    webTitle: String,
    analyticsName: String) = new Page(id, section, webTitle, analyticsName)
}

trait Images {
  def images: Seq[Image]
  def videoImages: Seq[Image]

  def imageOfWidth(desiredWidth: Int, tolerance: Int = 0): Option[Image] = {
    val widthRange = (desiredWidth - tolerance) to (desiredWidth + tolerance)
    val imagesInWidthRange = images filter { _.width in widthRange }
    val imagesByDistance = imagesInWidthRange sortBy { _.width distanceFrom desiredWidth }

    imagesByDistance.headOption
  }

  //I know the stuff below this line looks a bit weird. There is longer term work going on in the content api to
  //improve how pictures work. It is not going to be done in time for us, so for now we have to infer a lot and work to
  //some arbitrary conventions.

  //Assumption number 1 - All alt-size images are crops of the main picture
  private lazy val mainPictureCrops: Seq[Image] = mainPicture.map { main =>
    var crops = images.filter(_.rel == "alt-size").filter(_.aspectRatio == main.aspectRatio)
    // if there's more than one body image, use the crops with the same index
    if (images.filter(i => i.rel == "body" || i.rel=="main").size > 1) {
      crops = crops.filter(_.index == main.index)
    }
    crops
  } getOrElse (Nil)

  //at the moment all the crops will exists, or none of them will exist. If we have no crops then
  //fall back to full size image
  def mainPicture(width: Int): Option[Image] = mainPictureCrops.filter(_.width == width).headOption.orElse(mainPicture)

  def mainPicture(width: Int, height: Int): Option[Image] =
    mainPictureCrops.filter(_.width == width).filter(_.height == height).headOption.orElse(mainPicture)

  //the canonical main picture, the actual one the editor chose
  // Assume it's the one with the lowest index (including videos)
  lazy val mainPicture: Option[Image] = if (hasMainPicture)
    (images.filter(List("body", "main", "gallery") contains _.rel) ++ videoImages).sortBy(_.index).headOption
  else
    // otherwise just get the 460 sized crop
    // NOTE safe?
    images.filter(_.rel == "alt-size").filter(_.width == 460).headOption

  //Assumption number 2 - the first rel="body" picture is the main picture if (and only if) there are more rel="body"
  //pictures than there are in-body pictures. If there are the same amount, then there is no main picture.
  lazy val hasMainPicture: Boolean = {
    val bodyPictureCount = (images.filter(List("body", "main" , "gallery") contains _.rel) ++ videoImages).size
    bodyPictureCount > inBodyPictureCount
  }

  lazy val inBodyPictureCount: Int = 0

}

trait Tags {
  def tags: Seq[Tag] = Nil

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")
}
