package services

import com.gu.contentapi.client.model.v1.Content
import com.gu.facia.api.models.ContentFormat
import com.gu.facia.api.utils.{ContentProperties, ItemKicker, ResolvedMetaData}
import com.gu.facia.api.{models => fapi}
import com.gu.facia.client.models.TrailMetaData
import common.commercial.EditionBranding
import model.CardStylePicker
import model.pressed.PressedContent

object FaciaContentConvert {
  def contentToFaciaContent(content: Content): PressedContent = {
    val frontendContent = model.Content(content)
    val trailMetaData = TrailMetaData.empty
    val cardStyle = CardStylePicker(content)
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(content, trailMetaData, cardStyle)

    val curated = fapi.CuratedContent(
      content = content,
      maybeFrontPublicationDate = None,
      supportingContent = Nil,
      cardStyle = cardStyle,
      format = ContentFormat(content),
      headline = frontendContent.trail.headline,
      href = Option(content.id),
      trailText = frontendContent.fields.trailText,
      group = "0",
      image = fapi.FaciaImage.getFaciaImage(Some(content), trailMetaData, resolvedMetaData),
      ContentProperties.fromResolvedMetaData(resolvedMetaData),
      frontendContent.trail.byline,
      kicker = ItemKicker.fromContentAndTrail(Some(content), trailMetaData, resolvedMetaData, None),
      embedType = None,
      embedUri = None,
      embedCss = None,
      brandingByEdition = EditionBranding
        .fromContent(content)
        .map { editionBranding =>
          editionBranding.edition.id -> editionBranding.branding
        }
        .toMap,
      atomId = None,
    )

    PressedContent.make(curated, false)
  }
}
