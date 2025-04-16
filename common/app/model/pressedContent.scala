package model.pressed

import com.gu.commercial.branding.Branding
import com.gu.facia.api.{models => fapi}
import common.Edition
import model.content.MediaAtom
import model.{ContentFormat, Pillar}
import views.support.ContentOldAgeDescriber

sealed trait PressedContent {
  def properties: PressedProperties

  def header: PressedCardHeader

  def card: PressedCard

  def discussion: PressedDiscussionSettings

  def display: PressedDisplaySettings

  def maybePillar: Option[Pillar] = Pillar(properties.maybeContent)

  lazy val participatesInDeduplication: Boolean = properties.embedType.isEmpty

  def format: ContentFormat

  def withoutTrailText: PressedContent

  def isPaidFor: Boolean = properties.isPaidFor

  def branding(edition: Edition): Option[Branding] =
    for {
      brandings <- properties.editionBrandings
      editionBranding <- brandings find (_.edition == edition)
      branding <- editionBranding.branding
    } yield branding

  def isActionCard: Boolean =
    properties.maybeContent.exists { c =>
      c.tags.tags.exists(_.id == "tone/callout")
    }

  // For DCR
  def ageWarning: Option[String] = {
    properties.maybeContent
      .filter(c => c.tags.tags.exists(_.id == "tone/news"))
      .map(ContentOldAgeDescriber.apply)
      .filterNot(_ == "")
  }

}

object PressedContent {
  def make(content: fapi.FaciaContent, suppressImages: Boolean): PressedContent =
    content match {
      case curatedContent: fapi.CuratedContent => CuratedContent.make(curatedContent, suppressImages)
      case supportingCuratedContent: fapi.SupportingCuratedContent =>
        SupportingCuratedContent.make(supportingCuratedContent)
      case linkSnap: fapi.LinkSnap     => LinkSnap.make(linkSnap)
      case latestSnap: fapi.LatestSnap => LatestSnap.make(latestSnap)
    }
}

final case class CuratedContent(
    override val properties: PressedProperties,
    override val header: PressedCardHeader,
    override val card: PressedCard,
    override val discussion: PressedDiscussionSettings,
    override val display: PressedDisplaySettings,
    override val format: ContentFormat,
    enriched: Option[
      EnrichedContent,
    ], // This is currently an option, as we introduce the new field. It can then become a value type.
    supportingContent: List[PressedContent],
    cardStyle: CardStyle,
    mediaAtom: Option[MediaAtom],
) extends PressedContent {

  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object CuratedContent {
  def make(content: fapi.CuratedContent, suppressImages: Boolean): CuratedContent = {
    CuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content, Some(suppressImages)),
      format = ContentFormat.fromFapiContentFormat(content.format),
      supportingContent = content.supportingContent.map((sc) => PressedContent.make(sc, false)),
      cardStyle = CardStyle.make(content.cardStyle),
      enriched = Some(EnrichedContent.empty),
      mediaAtom = None,
    )
  }
}

final case class SupportingCuratedContent(
    override val properties: PressedProperties,
    override val header: PressedCardHeader,
    override val card: PressedCard,
    override val discussion: PressedDiscussionSettings,
    override val display: PressedDisplaySettings,
    override val format: ContentFormat,
    cardStyle: CardStyle,
) extends PressedContent {
  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object SupportingCuratedContent {
  def make(content: fapi.SupportingCuratedContent): SupportingCuratedContent = {
    SupportingCuratedContent(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content, None),
      format = ContentFormat.fromFapiContentFormat(content.format),
      cardStyle = CardStyle.make(content.cardStyle),
    )
  }
}

final case class LinkSnap(
    override val properties: PressedProperties,
    override val header: PressedCardHeader,
    override val card: PressedCard,
    override val discussion: PressedDiscussionSettings,
    override val display: PressedDisplaySettings,
    override val format: ContentFormat,
    enriched: Option[
      EnrichedContent,
    ], // This is currently an option, as we introduce the new field. It can then become a value type.
    mediaAtom: Option[MediaAtom],
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
      display = PressedDisplaySettings.make(content, None),
      enriched = Some(EnrichedContent.empty),
      format = ContentFormat.defaultContentFormat,
      mediaAtom = None,
    )
  }
}

final case class LatestSnap(
    override val properties: PressedProperties,
    override val header: PressedCardHeader,
    override val card: PressedCard,
    override val discussion: PressedDiscussionSettings,
    override val display: PressedDisplaySettings,
    override val format: ContentFormat,
) extends PressedContent {

  override def withoutTrailText: PressedContent = copy(card = card.withoutTrailText)
}

object LatestSnap {
  def make(content: fapi.LatestSnap): LatestSnap = {
    LatestSnap(
      properties = PressedProperties.make(content),
      header = PressedCardHeader.make(content),
      card = PressedCard.make(content),
      discussion = PressedDiscussionSettings.make(content),
      display = PressedDisplaySettings.make(content, None),
      format = ContentFormat.fromFapiContentFormat(content.format),
    )
  }
}
