package services

import com.gu.contentapi.client.model.Content
import com.gu.facia.api.{models => fapi}
import com.gu.facia.api.utils.{ContentProperties, ResolvedMetaData, ItemKicker}
import com.gu.facia.client.models.TrailMetaData
import model.pressed.PressedContent

object FaciaContentConvert {
  def contentToFaciaContent(content: Content): PressedContent = {
    val frontendContent = model.Content(content)
    val trailMetaData = TrailMetaData.empty
    val cardStyle = com.gu.facia.api.utils.CardStyle(content, trailMetaData)
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(content, trailMetaData, cardStyle)

    val curated = fapi.CuratedContent(
      content = content,
      maybeFrontPublicationDate = None,
      supportingContent = Nil,
      cardStyle = com.gu.facia.api.utils.CardStyle(content, trailMetaData),
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
      embedCss = None)

    PressedContent.make(curated)
  }
}
