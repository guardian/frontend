package model

import conf.Configuration
import conf.switches.Switches
import implicits.FaciaContentFrontendHelpers._
import layout.ItemClasses
import model.pressed.PressedContent
import com.gu.contentapi.client.model.{v1 => contentapi}

object FaciaDisplayElement {
  def fromFaciaContentAndCardType(faciaContent: PressedContent, itemClasses: ItemClasses): Option[FaciaDisplayElement] = {
    faciaContent.mainVideo match {
      case Some(videoElement) if faciaContent.properties.showMainVideo =>
        Some(InlineVideo(
          videoElement,
          faciaContent.properties.webTitle,
          EndSlateComponents.fromFaciaContent(faciaContent).toUriPath,
          InlineImage.fromFaciaContent(faciaContent)
        ))
      case _ if faciaContent.properties.isCrossword && Switches.CrosswordSvgThumbnailsSwitch.isSwitchedOn =>
        faciaContent.properties.maybeContentId map CrosswordSvg
      case _ if faciaContent.properties.imageSlideshowReplace && itemClasses.canShowSlideshow =>
        InlineSlideshow.fromFaciaContent(faciaContent)
      case _ => InlineImage.fromFaciaContent(faciaContent)
    }
  }

  def fromContent(apiContent: contentapi.Content): Option[FaciaDisplayElement] = {
    val maybeEndSlateComponents = for {
      sectionId <- apiContent.sectionId
      fields <- apiContent.fields
      shortUrl <- fields.shortUrl
    } yield EndSlateComponents(None, sectionId, shortUrl)

    val elements = Elements.make(apiContent)

    maybeEndSlateComponents flatMap { endSlateComponents =>
      elements.mainVideo match {
        case Some(videoElement) => Option(InlineVideo(videoElement, apiContent.webTitle, endSlateComponents.toUriPath, Option(InlineImage(videoElement.images))))
        case None => elements.mainPicture map {picture => InlineImage(picture.images)}
      }
    }
  }
}

sealed trait FaciaDisplayElement

case class InlineVideo(
  videoElement: VideoElement,
  title: String,
  endSlatePath: String,
  fallBack: Option[InlineImage]
) extends FaciaDisplayElement

object InlineImage {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineImage] =
    if (!faciaContent.display.imageHide) {
      faciaContent.trailPicture map { picture =>
        InlineImage(picture)
      }
    } else {
      None
    }
}

case class InlineImage(imageMedia: ImageMedia) extends FaciaDisplayElement

case class CrosswordSvg(id: String) extends FaciaDisplayElement {
  def persistenceId = id.stripPrefix("crosswords/")

  def imageUrl = s"${Configuration.ajax.url}/$id.svg"
}

object InlineSlideshow {
  def fromFaciaContent(faciaContent: PressedContent): Option[InlineSlideshow] =
    for (s <- faciaContent.slideshow) yield InlineSlideshow(s)
}

case class InlineSlideshow(images: Iterable[FaciaImageElement]) extends FaciaDisplayElement
