package implicits

import common.dfp.DfpAgent
import implicits.Dates._
import model._
import model.pressed._
import org.joda.time.DateTime
import org.scala_tools.time.Imports._

import scala.util.Try

object FaciaContentFrontendHelpers {

  implicit class FaciaContentFrontendHelper(faciaContent: PressedContent) {

    def frontendTags: Seq[model.Tag] = faciaContent.properties.maybeContent.map(_.tags.tags).getOrElse(Nil)

    val trailPicture: Option[ImageMedia] = {
      val imageOverride = faciaContent.properties.image.flatMap(ImageOverride.createImageMedia)
      val defaultTrailPicture = faciaContent.properties.maybeContent.flatMap(_.trail.trailPicture)
      imageOverride.orElse(defaultTrailPicture)
    }

    def mainVideo: Option[VideoElement] = {
      val elements: Seq[Element] = faciaContent.properties.maybeContent.map(_.elements.elements).getOrElse(Nil)
      val videos: Seq[VideoElement] = elements.flatMap {
        case video: VideoElement => Some(video)
        case _ => None
      }
      videos.find(_.properties.isMain).headOption
    }

    lazy val isAdvertisementFeature: Boolean =
      DfpAgent.isAdvertisementFeature(frontendTags, faciaContent.properties.maybeSection)

    lazy val shouldHidePublicationDate: Boolean = {
      isAdvertisementFeature && faciaContent.card.webPublicationDateOption.exists(_.isOlderThan(2.weeks))
    }

    def slideshow: Option[List[FaciaImageElement]] = faciaContent.properties.image match {
      case Some(ImageSlideshow(assets)) =>
        Option {
          assets.flatMap(asset =>
            Try(FaciaImageElement(asset.imageSrc, asset.imageSrcWidth.toInt, asset.imageSrcHeight.toInt)).toOption)
        }
      case _ => None}

    def trailSlideshow(aspectWidth: Int, aspectHeight: Int): Option[List[FaciaImageElement]] =
      slideshow.map(_.filter(image => IsRatio(aspectWidth, aspectHeight, image.width, image.height)))

    def contributors: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.contributors).getOrElse(Nil)
    def series: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.series).getOrElse(Nil)
    def keywords: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.keywords).getOrElse(Nil)

    def supporting: List[PressedContent] = faciaContent match {
      case content: CuratedContent => content.supportingContent
      case _ => Nil
    }

    def webPublicationDate: DateTime = faciaContent.card.webPublicationDateOption.getOrElse(DateTime.now)
  }
}
