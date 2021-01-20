package model.pressed

import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi, utils => fapiutils}
import common.{Edition}
import common.commercial.EditionBranding

final case class PressedProperties(
    isBreaking: Boolean,
    showMainVideo: Boolean,
    showKickerTag: Boolean,
    showByline: Boolean,
    imageSlideshowReplace: Boolean,
    maybeContent: Option[PressedStory],
    maybeContentId: Option[String],
    isLiveBlog: Boolean,
    isCrossword: Boolean,
    byline: Option[String],
    image: Option[Image],
    webTitle: String,
    linkText: Option[String],
    embedType: Option[String],
    embedCss: Option[String],
    embedUri: Option[String],
    maybeFrontPublicationDate: Option[Long],
    href: Option[String],
    webUrl: Option[String],
    editionBrandings: Option[Seq[EditionBranding]],
    atomId: Option[String],
) {
  lazy val isPaidFor: Boolean = editionBrandings.exists(
    _.exists(branding => branding.branding.exists(_.isPaid) && branding.edition == Edition.defaultEdition),
  )
}

object PressedProperties {
  def make(content: fapi.FaciaContent): PressedProperties = {
    val contentProperties = getProperties(content)
    val capiContent = FaciaContentUtils.maybeContent(content)

    PressedProperties(
      isBreaking = contentProperties.isBreaking,
      showMainVideo = contentProperties.showMainVideo,
      showKickerTag = contentProperties.showKickerTag,
      showByline = contentProperties.showByline,
      imageSlideshowReplace = contentProperties.imageSlideshowReplace,
      maybeContent = capiContent.map(PressedStory(_)),
      maybeContentId = FaciaContentUtils.maybeContentId(content),
      isLiveBlog = FaciaContentUtils.isLiveBlog(content),
      isCrossword = FaciaContentUtils.isCrossword(content),
      byline = FaciaContentUtils.byline(content),
      image = FaciaContentUtils.image(content).map(Image.make),
      webTitle = FaciaContentUtils.webTitle(content),
      linkText = FaciaContentUtils.linkText(content),
      embedType = FaciaContentUtils.embedType(content),
      embedCss = FaciaContentUtils.embedCss(content),
      embedUri = FaciaContentUtils.embedUri(content),
      maybeFrontPublicationDate = FaciaContentUtils.maybeFrontPublicationDate(content),
      href = FaciaContentUtils.href(content),
      webUrl = FaciaContentUtils.webUrl(content),
      editionBrandings = Some(content.brandingByEdition.flatMap {
        case (editionId, branding) => Edition.byId(editionId) map (EditionBranding(_, branding))
      }.toSeq),
      atomId = FaciaContentUtils.atomId(content),
    )
  }

  def getProperties(content: fapi.FaciaContent): fapiutils.ContentProperties = {
    content match {
      case curatedContent: fapi.CuratedContent                     => curatedContent.properties
      case supportingCuratedContent: fapi.SupportingCuratedContent => supportingCuratedContent.properties
      case linkSnap: fapi.LinkSnap                                 => linkSnap.properties
      case latestSnap: fapi.LatestSnap                             => latestSnap.properties
    }
  }
}
