package implicits

import common.Edition.defaultEdition
import implicits.Dates._
import model._
import model.content.{MediaAssetPlatform, MediaAtom}
import model.pressed._
import org.joda.time.DateTime
import org.jsoup.Jsoup
import com.github.nscala_time.time.Implicits._
import scala.util.Try

object FaciaContentFrontendHelpers {

  implicit class FaciaContentFrontendHelper(faciaContent: PressedContent) {

    def frontendTags: Seq[model.Tag] = faciaContent.properties.maybeContent.map(_.tags.tags).getOrElse(Nil)

    val trailPicture: Option[ImageMedia] = {
      val imageOverride = faciaContent.properties.image.flatMap(ImageOverride.createImageMedia)
      val defaultTrailPicture = faciaContent.properties.maybeContent.flatMap(_.trail.trailPicture)
      imageOverride.orElse(defaultTrailPicture)
    }

    //TODO: Use the blocks field of CAPI to derive this in a more structured way
    def mainYouTubeMediaAtom: Option[MediaAtom] =
      for {
        main <- faciaContent.properties.maybeContent.map(_.fields.main)
        mediaAtoms <- faciaContent.properties.maybeContent.map(_.elements.mediaAtoms)
        document <- Some(Jsoup.parse(main))
        atomContainer <- Option(document.getElementsByClass("element-atom").first())
        bodyElement <- Some(atomContainer.getElementsByTag("gu-atom"))
        atomId <- Some(bodyElement.attr("data-atom-id"))
        mainMediaAtom <- mediaAtoms.find(ma =>
          (ma.id == atomId && !ma.expired.getOrElse(false)) && ma.assets.exists(
            _.platform == MediaAssetPlatform.Youtube,
          ),
        )
      } yield mainMediaAtom

    def mainVideo: Option[VideoElement] = faciaContent.properties.maybeContent.flatMap(_.elements.mainVideo)

    lazy val shouldHidePublicationDate: Boolean = {
      faciaContent.branding(defaultEdition).exists(_.isPaid) &&
      faciaContent.card.webPublicationDateOption.exists(_.isOlderThan(2.weeks))
    }

    def slideshow: Option[List[FaciaImageElement]] =
      faciaContent.properties.image match {
        case Some(ImageSlideshow(assets)) =>
          Option {
            assets.flatMap(asset =>
              Try(
                FaciaImageElement(
                  asset.imageSrc,
                  asset.imageSrcWidth.toInt,
                  asset.imageSrcHeight.toInt,
                  asset.imageCaption,
                ),
              ).toOption,
            )
          }
        case _ => None
      }

    def trailSlideshow(aspectWidth: Int, aspectHeight: Int): Option[List[FaciaImageElement]] =
      slideshow.map(_.filter(image => IsRatio(aspectWidth, aspectHeight, image.width, image.height)))

    def contributors: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.contributors).getOrElse(Nil)
    def series: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.series).getOrElse(Nil)
    def keywords: Seq[Tag] = faciaContent.properties.maybeContent.map(_.tags.keywords).getOrElse(Nil)

    def supporting: List[PressedContent] =
      faciaContent match {
        case content: CuratedContent => content.supportingContent
        case _                       => Nil
      }

    def webPublicationDate: DateTime = faciaContent.card.webPublicationDateOption.getOrElse(DateTime.now)
  }
}
