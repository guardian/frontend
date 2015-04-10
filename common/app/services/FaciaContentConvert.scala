package services

import com.gu.facia.api.models._
import com.gu.facia.api.utils.{ResolvedMetaData, ItemKicker}
import com.gu.facia.client.models.TrailMetaData

object FaciaContentConvert {
  def frontentContentToFaciaContent(frontendContent: model.Content, maybeCollectionConfig: Option[CollectionConfig] = None): FaciaContent = {
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(frontendContent.apiContent.delegate, frontendContent.apiContent.metaData.getOrElse(TrailMetaData.empty))
    val trailMetaData = frontendContent.apiContent.metaData.getOrElse(TrailMetaData.empty)
    val contentApiContent = frontendContent.apiContent.delegate
    CuratedContent(
      content = frontendContent.apiContent.delegate,
      supportingContent = frontendContent.apiContent.supporting.map(FaciaContentConvert.frontentContentToFaciaContent(_, maybeCollectionConfig)),
      headline = frontendContent.headline,
      href = frontendContent.delegate.safeFields.get("href"),
      trailText = frontendContent.trailText,
      group = frontendContent.group.getOrElse("0"),
      imageReplace = ImageReplace.fromTrailMeta(trailMetaData),
      isBreaking = resolvedMetaData.isBreaking,
      isBoosted = resolvedMetaData.isBoosted,
      imageHide = resolvedMetaData.imageHide,
      showMainVideo = resolvedMetaData.showMainVideo,
      showKickerTag = resolvedMetaData.showKickerTag,
      frontendContent.byline,
      showByLine = resolvedMetaData.showByline,
      kicker = ItemKicker.fromContentAndTrail(contentApiContent, trailMetaData, resolvedMetaData, maybeCollectionConfig),
      imageCutout = ImageCutout.fromContentAndTrailMeta(contentApiContent, trailMetaData),
      showBoostedHeadline = resolvedMetaData.showBoostedHeadline,
      showQuotedHeadline = resolvedMetaData.showQuotedHeadline,
      embedType = frontendContent.snapType,
      embedUri = frontendContent.snapUri,
      embedCss = frontendContent.snapCss)
  }

  def frontentContentToFaciaContent(frontendContent: model.Content): FaciaContent = frontentContentToFaciaContent(frontendContent, None)
}
