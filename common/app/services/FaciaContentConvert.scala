package services

import com.gu.contentapi.client.model.Content
import com.gu.facia.api.models._
import com.gu.facia.api.utils.{ContentProperties, ResolvedMetaData, ItemKicker}
import com.gu.facia.client.models.TrailMetaData

object FaciaContentConvert {
  def contentToFaciaContent(content: Content, maybeCollectionConfig: Option[CollectionConfig] = None): FaciaContent = {
    val frontendContent = model.Content(content)
    val trailMetaData = TrailMetaData.empty
    val cardStyle = com.gu.facia.api.utils.CardStyle(content, trailMetaData)
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(content, trailMetaData, cardStyle)

    CuratedContent(
      content = content,
      maybeFrontPublicationDate = None,
      supportingContent = Nil,
      cardStyle = com.gu.facia.api.utils.CardStyle(content, trailMetaData),
      headline = frontendContent.trail.headline,
      href = Option(content.id),
      trailText = frontendContent.fields.trailText,
      group = "0",
      image = FaciaImage.getFaciaImage(Some(content), trailMetaData, resolvedMetaData),
      ContentProperties.fromResolvedMetaData(resolvedMetaData),
      frontendContent.trail.byline,
      kicker = ItemKicker.fromContentAndTrail(Some(content), trailMetaData, resolvedMetaData, maybeCollectionConfig),
      embedType = None,
      embedUri = None,
      embedCss = None)
  }
}
