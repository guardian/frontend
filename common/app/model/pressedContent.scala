package model.pressed

import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.v1.{Content, ElementType}
import com.gu.contentapi.client.utils.DesignType
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichContent
import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi, utils => fapiutils}
import com.gu.facia.client.models.{Backfill, CollectionConfigJson, Metadata, CollectionPlatform}
import common.{Edition, HTML}
import common.commercial.EditionBranding
import model.content.{Atoms, MediaAtom}
import model.{CardStylePicker, Commercial, DotcomContentType, Elements, Fields, ImageMedia, MetaData, Pillar, SectionId, SupportedUrl, Tags, Trail, VideoElement}
import org.joda.time.DateTime

sealed trait PressedContent {
  def properties: PressedProperties
  def header: PressedCardHeader
  def card: PressedCard
  def discussion: PressedDiscussionSettings
  def display: PressedDisplaySettings
  def maybePillar: Option[Pillar] = Pillar(properties.maybeContent)
  lazy val participatesInDeduplication: Boolean = properties.embedType.isEmpty

  def withoutTrailText: PressedContent

  def isPaidFor: Boolean = properties.isPaidFor

  def branding(edition: Edition): Option[Branding] =
    for {
      brandings <- properties.editionBrandings
      editionBranding <- brandings find (_.edition == edition)
      branding <- editionBranding.branding
    } yield branding
}

object PressedContent {
  def make(content: fapi.FaciaContent): PressedContent = content match {
    case curatedContent: fapi.CuratedContent => CuratedContent.make(curatedContent)
    case supportingCuratedContent: fapi.SupportingCuratedContent => SupportingCuratedContent.make(supportingCuratedContent)
    case linkSnap: fapi.LinkSnap => LinkSnap.make(linkSnap)
    case latestSnap: fapi.LatestSnap => LatestSnap.make(latestSnap)
  }
}

final case class CuratedContent(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings,
  enriched: Option[EnrichedContent], // This is currently an option, as we introduce the new field. It can then become a value type.
  supportingContent: List[PressedContent],
  cardStyle: CardStyle ) extends PressedContent {

  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object CuratedContent {
  def make(content: fapi.CuratedContent): CuratedContent = {
    CuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content),
      supportingContent = content.supportingContent.map(PressedContent.make),
      cardStyle = CardStyle.make(content.cardStyle),
      enriched = Some(EnrichedContent.empty)
    )
  }
}

final case class SupportingCuratedContent(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings,
  cardStyle: CardStyle) extends PressedContent {
  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object SupportingCuratedContent {
  def make(content: fapi.SupportingCuratedContent): SupportingCuratedContent = {
    SupportingCuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content),
      cardStyle = CardStyle.make(content.cardStyle)
    )
  }
}

final case class LinkSnap(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings,
  enriched: Option[EnrichedContent] // This is currently an option, as we introduce the new field. It can then become a value type.
) extends PressedContent {
  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object LinkSnap {
  def make(content: fapi.LinkSnap): LinkSnap = {
    LinkSnap(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content),
      enriched = Some(EnrichedContent.empty)
    )
  }
}

final case class LatestSnap(
  override val properties: PressedProperties,
  override val header: PressedCardHeader,
  override val card: PressedCard,
  override val discussion: PressedDiscussionSettings,
  override val display: PressedDisplaySettings) extends PressedContent {

  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object LatestSnap {
  def make(content: fapi.LatestSnap): LatestSnap = {
    LatestSnap(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content)
    )
  }
}
