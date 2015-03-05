package services

import com.gu.facia.api.models.{ImageReplace, CuratedContent, FaciaContent}
import com.gu.facia.api.utils.{ResolvedMetaData, ItemKicker}
import com.gu.facia.client.models.TrailMetaData

object FaciaContentConvert {
  def frontentContentToFaciaContent(frontendContent: model.Content): FaciaContent = {
    val resolvedMetaData = ResolvedMetaData.fromContentAndTrailMetaData(frontendContent.apiContent.delegate, frontendContent.apiContent.metaData.getOrElse(TrailMetaData.empty))
    CuratedContent(
      content = frontendContent.apiContent.delegate,
      supportingContent = frontendContent.apiContent.supporting.map(FaciaContentConvert.frontentContentToFaciaContent),
      headline = frontendContent.headline,
      href = frontendContent.delegate.safeFields.get("href"),
      trailText = frontendContent.trailText,
      group = frontendContent.group.getOrElse("0"),
      imageReplace = imageFromContent(frontendContent),
      isBreaking = resolvedMetaData.isBreaking,
      isBoosted = resolvedMetaData.isBoosted,
      imageHide = resolvedMetaData.imageHide,
      showMainVideo = resolvedMetaData.showMainVideo,
      showKickerTag = resolvedMetaData.showKickerTag,
      frontendContent.byline,
      showByLine = resolvedMetaData.showByline,
      kicker = ItemKicker.fromContentAndTrail(frontendContent.apiContent.delegate, frontendContent.apiContent.metaData.getOrElse(TrailMetaData.empty), resolvedMetaData, None),
      imageCutout = None,
      showBoostedHeadline = resolvedMetaData.showBoostedHeadline,
      showQuotedHeadline = resolvedMetaData.showQuotedHeadline)
  }

  private def imageFromContent(frontendContent: model.Content): Option[ImageReplace] =
    for {
      imageSrc <- frontendContent.imageSrc
      imageSrcWidth <- frontendContent.imageSrcWidth
      imageSrcHeight <- frontendContent.imageSrcHeight
    } yield ImageReplace(imageSrc, imageSrcWidth, imageSrcHeight)
}
