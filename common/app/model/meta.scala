package model

import common.ManifestData

trait MetaData {
  // indicates the absolute url of this page (the one to be used for search engine indexing)
  // see http://googlewebmastercentral.blogspot.co.uk/2009/02/specify-your-canonical.html
  def canonicalUrl: String

  def id: String
  def section: String
  def apiUrl: String
  def webTitle: String

  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build

  def metaData: Map[String, Any] = Map(
    "page-id" -> id,
    "section" -> section,
    "canonical-url" -> canonicalUrl,
    "api-url" -> apiUrl,
    "web-title" -> webTitle,
    "build-number" -> buildNumber
  )
}

trait Images {
  def images: Seq[Image]

  def imageOfWidth(desiredWidth: Int, tolerance: Int = 0): Option[Image] = {
    val widthRange = (desiredWidth - tolerance) to (desiredWidth + tolerance)
    val imagesInWidthRange = images filter { _.width in widthRange }
    val imagesByDistance = imagesInWidthRange sortBy { _.width distanceFrom desiredWidth }

    imagesByDistance.headOption
  }

  //the rules below represent the best image data we can infer from the content api.
  lazy val mainPicture = if (hasMainPicture) {
    images.filter(i => i.rel == "body" && i.index == 1).headOption
  } else {
    None
  }

  lazy val mainPictureBase = mainPicture.flatMap { image =>
    altImagesWithSameAspectRatio(image).filter(_.width == 140).headOption.orElse(mainPictureMedian)
  }

  lazy val mainPictureMedian = mainPicture.flatMap { image =>
    altImagesWithSameAspectRatio(image).filter(_.width == 220).headOption.orElse(mainPicture)
  }

  private def altImagesWithSameAspectRatio(image: Image) = images.filter(_.rel == "alt-size")
    .filter(_.aspectRatio == image.aspectRatio)

  lazy val hasMainPicture: Boolean = {
    val bodyPictureCount = images.filter(_.rel == "body").size
    bodyPictureCount > inBodyPictureCount
  }

  lazy val inBodyPictureCount = 0

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
