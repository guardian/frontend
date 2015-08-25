package services

import com.gu.facia.api.models._
import com.gu.facia.api.utils.{ContentProperties, ResolvedMetaData, ItemKicker}
import com.gu.facia.client.models.TrailMetaData

object FaciaContentConvert {
  def frontendContentToFaciaContent(frontendContent: model.Content, maybeCollectionConfig: Option[CollectionConfig] = None): FaciaContent = {
    val trailMetaData = TrailMetaData.empty
    val cardStyle = com.gu.facia.api.utils.CardStyle(frontendContent.delegate, trailMetaData)
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(frontendContent.delegate, trailMetaData, cardStyle)

    CuratedContent(
      content = frontendContent.delegate,
      maybeFrontPublicationDate = None,
      supportingContent = Nil,
      cardStyle = com.gu.facia.api.utils.CardStyle(frontendContent.delegate, trailMetaData),
      headline = frontendContent.headline,
      href = Option(frontendContent.id),
      trailText = frontendContent.trailText,
      group = "0",
      image = FaciaImage.getFaciaImage(Option(frontendContent.delegate), trailMetaData, resolvedMetaData),
      ContentProperties.fromResolvedMetaData(resolvedMetaData),
      frontendContent.byline,
      kicker = ItemKicker.fromContentAndTrail(Option(frontendContent.delegate), trailMetaData, resolvedMetaData, maybeCollectionConfig),
      embedType = None,
      embedUri = None,
      embedCss = None)
  }

  def frontendContentToFaciaContent(frontendContent: model.Content): FaciaContent = frontendContentToFaciaContent(frontendContent, None)
}
