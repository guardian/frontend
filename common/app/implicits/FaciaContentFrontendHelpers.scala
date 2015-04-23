package implicits

import com.gu.facia.api.models.FaciaContent
import implicits.FaciaContentImplicits._
import com.gu.facia.api.utils.FaciaContentUtils.fold
import dfp.DfpAgent
import model._
import implicits.Dates._
import org.scala_tools.time.Imports._

object FaciaContentFrontendHelpers {

  implicit class FaciaContentFrontendHelper(faciaContent: FaciaContent) {

    def imageReplaceElement = for (imageReplace <- faciaContent.imageReplace)
      yield ImageOverride.createElementWithOneAsset(imageReplace.imageSrc, imageReplace.imageSrcWidth, imageReplace.imageSrcHeight)

    def frontendElements: List[model.Element] = faciaContent.elements.zipWithIndex.map { case (e, i) => model.Element(e, i) }

    def frontendTags: List[model.Tag] = faciaContent.tags.map(Tag.apply(_))

    protected lazy val images: Seq[ImageElement] = frontendElements.flatMap { case image: ImageElement => Some(image)
    case _ => None
    }
    lazy val thumbnail: Option[ImageElement] = images.find(_.isThumbnail)
    lazy val bodyImages: Seq[ImageElement] = images.filter(_.isBody)

    private val trailPicMinDesiredSize = 460
    val AspectRatioThreshold = 0.01

    def mainPicture: Option[ImageContainer] = images.find(_.isMain)

    // Find a main picture crop which matches this aspect ratio.
    def trailPictureAll(aspectWidth: Int, aspectHeight: Int): List[ImageContainer] = {
      val desiredAspectRatio = aspectWidth.toDouble / aspectHeight

      (thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize)) ++ mainPicture ++ thumbnail).map { image =>
        image.imageCrops.filter { crop =>
          aspectHeight.toDouble * crop.width != 0 &&
            Math.abs((aspectWidth.toDouble * crop.height) / (aspectHeight.toDouble * crop.width) - 1) <= AspectRatioThreshold
        } match {
          case Nil => None
          case crops => Option(ImageContainer(crops, image.delegate, image.index))
        }
      }.flatten.toList
    }

    def trailPicture(aspectWidth: Int, aspectHeight: Int): Option[ImageContainer] = trailPictureAll(aspectWidth, aspectHeight).headOption

    def trailPicture: Option[ImageContainer] = thumbnail.find(_.imageCrops.exists(_.width >= trailPicMinDesiredSize)).orElse(mainPicture).orElse(thumbnail)

    protected lazy val videos: Seq[VideoElement] = frontendElements.flatMap { case video: VideoElement => Some(video)
    case _ => None
    }

    def mainVideo: Option[VideoElement] = videos.find(_.isMain).headOption

    def isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(frontendTags, faciaContent.maybeSection)

    lazy val shouldHidePublicationDate: Boolean = {
      isAdvertisementFeature && faciaContent.webPublicationDateOption.exists(_.isOlderThan(2.weeks))
    }

    def url: String = fold(faciaContent)(
      curatedContent => SupportedUrl(curatedContent.content),
      supportingCuratedContent => SupportedUrl(supportingCuratedContent.content),
      linkSnap => linkSnap.id,
      latestSnap => latestSnap.latestContent.map(SupportedUrl(_)).getOrElse(latestSnap.id))
  }
}
