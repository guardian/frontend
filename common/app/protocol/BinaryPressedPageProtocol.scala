package protocol

import boopickle.Default._
import boopickle.{CompositePickler, Pickler}
import common.Edition
import common.commercial._
import common.editions.{Au, International, Uk, Us}
import model._
import model.content.{MediaAsset, MediaAtom}
import model.facia.PressedCollection
import model.pressed._
import org.joda.time.DateTime

trait BinaryPressedPageProtocol {

  implicit lazy val EditionBrandingPickler: Pickler[EditionBranding] = generatePickler[EditionBranding]

  implicit lazy val PressedContentPickler: CompositePickler[PressedContent] = compositePickler[PressedContent]
  PressedContentPickler
    .addConcreteType[CuratedContent]
    .addConcreteType[LatestSnap]
    .addConcreteType[LinkSnap]
    .addConcreteType[SupportingCuratedContent]

  implicit lazy val editionPickler: Pickler[Edition] = transformPickler[Edition, String] {
    case Au.id => Au
    case Uk.id => Uk
    case Us.id => Us
    case _ => International
  } (_.id)

  implicit lazy val DateTimePickler: Pickler[DateTime] = transformPickler[DateTime, String](DateTime.parse)(_.toString)

  implicit lazy val DotcomContentTypePickler: Pickler[DotcomContentType] = transformPickler[DotcomContentType, String]{
    case DotcomContentType.Article.name => DotcomContentType.Article
    case DotcomContentType.NetworkFront.name => DotcomContentType.NetworkFront
    case DotcomContentType.Section.name => DotcomContentType.Section
    case DotcomContentType.ImageContent.name => DotcomContentType.ImageContent
    case DotcomContentType.Interactive.name => DotcomContentType.Interactive
    case DotcomContentType.Gallery.name => DotcomContentType.Gallery
    case DotcomContentType.Video.name => DotcomContentType.Video
    case DotcomContentType.Audio.name => DotcomContentType.Audio
    case DotcomContentType.LiveBlog.name => DotcomContentType.LiveBlog
    case DotcomContentType.Tag.name => DotcomContentType.Tag
    case DotcomContentType.TagIndex.name => DotcomContentType.TagIndex
    case DotcomContentType.Crossword.name => DotcomContentType.Crossword
    case DotcomContentType.Survey.name => DotcomContentType.Survey
    case DotcomContentType.Signup.name => DotcomContentType.Signup
    case DotcomContentType.Identity.name => DotcomContentType.Identity
    case DotcomContentType.Unknown.name => DotcomContentType.Unknown
    case s => throw new RuntimeException(s"Unexpected content type $s")
  }(_.name)

  implicit lazy val ImageMediaPickler: Pickler[ImageMedia] = generatePickler[ImageMedia]
  implicit lazy val ImageAssetPickler: Pickler[ImageAsset] = generatePickler[ImageAsset]
  implicit lazy val PressedCollectionPickler: Pickler[PressedCollection] = generatePickler[PressedCollection]
  implicit lazy val EditionAdTargetingPicker: Pickler[EditionAdTargeting] = generatePickler[EditionAdTargeting]

  implicit lazy val PillarPickler: Pickler[Pillar] = transformPickler[Pillar, String]{
    case Pillar.News.name => Pillar.News
    case Pillar.Opinion.name => Pillar.Opinion
    case Pillar.Sport.name => Pillar.Sport
    case Pillar.Arts.name => Pillar.Arts
    case Pillar.Lifestyle.name => Pillar.Lifestyle
    case s => throw new RuntimeException(s"unexpected pillar $s")
  }(_.name)

  implicit lazy val VideoAssetPickler: Pickler[VideoAsset] = generatePickler[VideoAsset]
  implicit lazy val SectionIdPickler: Pickler[SectionId] = transformPickler[SectionId, String](SectionId(_))(_.value)
  implicit lazy val MediaAtomPickler: Pickler[MediaAtom] = generatePickler[MediaAtom]
  implicit lazy val MediaAssetPickler: Pickler[MediaAsset] = generatePickler[MediaAsset]
}
