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

    def imageReplaceElement = faciaContent.properties.image match {
      case Some(Replace(src, width, height)) => Option(ImageOverride.createElementWithOneAsset(src, width, height))
      case _ => None
    }

    def elements: Seq[Element] = faciaContent.properties.maybeContent.map(_.elements.elements).getOrElse(Nil)

    def elementsWithImageOverride: Seq[Element] = imageReplaceElement ++: faciaContent.elements

    def frontendElements: Seq[Element] = faciaContent.elementsWithImageOverride.zipWithIndex.map { case (el, i) =>
      val properties = el.properties.copy(index = i)
      el match {
        case element: ImageElement => element.copy(properties = properties)
        case element: VideoElement => element.copy(properties = properties)
        case element: AudioElement => element.copy(properties = properties)
        case element: EmbedElement => element.copy(properties = properties)
        case element: DefaultElement => element.copy(properties = properties)
      }
    }

    def frontendTags: Seq[model.Tag] = faciaContent.properties.maybeContent.map(_.tags.tags).getOrElse(Nil)

    protected lazy val images: Seq[ImageElement] = frontendElements.flatMap { case image: ImageElement => Some(image)
    case _ => None
    }
    lazy val thumbnail: Option[ImageElement] = images.find(_.properties.isThumbnail)
    lazy val bodyImages: Seq[ImageElement] = images.filter(_.properties.isBody)

    private val trailPicMinDesiredSize = 460
    val AspectRatioThreshold = 0.01

    def mainPicture: Option[ImageElement] = images.find(_.properties.isMain)

    // Find a main picture crop which matches this aspect ratio.
    def trailPictureAll(aspectWidth: Int, aspectHeight: Int): List[Element] = {
      val desiredAspectRatio = aspectWidth.toDouble / aspectHeight

      (thumbnail.find(_.images.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail).flatMap { image =>
        image.images.imageCrops.filter { crop =>
          aspectHeight.toDouble * crop.width != 0 &&
            Math.abs((aspectWidth.toDouble * crop.height) / (aspectHeight.toDouble * crop.width) - 1) <= AspectRatioThreshold
        } match {
          case Nil => None
          case crops => Some(image)
        }
      }.toList
    }

    def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[Element] = trailPictureAll(aspectWidth, aspectHeight).headOption

    def trailPicture: Option[ImageElement] = thumbnail.find(_.images.imageCrops.exists(_.width >= trailPicMinDesiredSize)).orElse(mainPicture).orElse(thumbnail)

    protected lazy val videos: Seq[VideoElement] = frontendElements.flatMap { case video: VideoElement => Some(video)
    case _ => None
    }

    def mainVideo: Option[VideoElement] = videos.find(_.properties.isMain).headOption

    def isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(frontendTags, faciaContent.properties.maybeSection)

    lazy val shouldHidePublicationDate: Boolean = {
      isAdvertisementFeature && faciaContent.properties.webPublicationDateOption.exists(_.isOlderThan(2.weeks))
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
      case content: CuratedContent => content.supporting
      case _ => Nil
    }

  }

  implicit class FaciaPropertiesFrontendHelper(properties: PressedProperties) {
      def webPublicationDate: DateTime = properties.webPublicationDateOption.getOrElse(DateTime.now)
  }
}
