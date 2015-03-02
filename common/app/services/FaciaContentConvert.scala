package services

import com.gu.facia.api.models.{ImageReplace, CuratedContent, FaciaContent}

object FaciaContentConvert {
  def frontentContentToFaciaContent(frontendContent: model.Content): FaciaContent =
    CuratedContent(
      content = frontendContent.apiContent.delegate,
      supportingContent = Nil,
      headline = frontendContent.headline,
      href = frontendContent.delegate.safeFields.get("href"),
      trailText = frontendContent.trailText,
      group = frontendContent.group.getOrElse("0"),
      imageReplace = imageFromContent(frontendContent),
      isBreaking = false,
      isBoosted = false,
      imageHide = false,
      showMainVideo = false,
      showKickerTag = false,
      frontendContent.byline,
      showByLine = false,
      kicker = None,
      imageCutout = None,
      showBoostedHeadline = false,
      showQuotedHeadline = false)

  private def imageFromContent(frontendContent: model.Content): Option[ImageReplace] =
    for {
      imageSrc <- frontendContent.imageSrc
      imageSrcWidth <- frontendContent.imageSrcWidth
      imageSrcHeight <- frontendContent.imageSrcHeight
    } yield ImageReplace(imageSrc, imageSrcWidth, imageSrcHeight)
}
