package dotcomrendering

import experiments.{ActiveExperiments, DotcomRenderingAdvertisements}
import model.{Article, PageWithStoryPackage, RelatedContent}
import play.api.mvc.RequestHeader
import views.support.{Commercial}
import model.liveblog.{BlockElement, ImageBlockElement, PullquoteBlockElement, RichLinkBlockElement, TextBlockElement, TweetBlockElement}
import implicits.Requests._

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

object ArticlePageDCRChecks {

  def isAdFree(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    page.item.content.shouldHideAdverts || Commercial.isAdFree(request)
  }

  def isDiscussionDisabled(page: PageWithStoryPackage): Boolean = {
    (! page.article.content.trail.isCommentable) && page.article.content.trail.isClosedForComments
  }

  def hasBlocks(page: PageWithStoryPackage): Boolean = {
    page.article.blocks match {
      case Some(b) => b.body.nonEmpty
      case None => false
    }
  }

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: ArticlePage => true
      case _ => false
    }
  }

  def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    // See: https://github.com/guardian/dotcom-rendering/blob/master/packages/frontend/web/components/lib/ArticleRenderer.tsx
    def unsupportedElement(blockElement: BlockElement) = blockElement match {
      case _: TextBlockElement => false
      case _: ImageBlockElement => false
      case _: TweetBlockElement => false
      case _: PullquoteBlockElement => false
      case _: RichLinkBlockElement => false
      case _ => true
    }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  def hasOnlySupportedMainElements(page: PageWithStoryPackage): Boolean = {
    // See: https://github.com/guardian/dotcom-rendering/blob/master/packages/frontend/web/components/lib/ArticleRenderer.tsx
    def unsupportedElement(blockElement: BlockElement) = blockElement match {
      case _: TextBlockElement => false
      case _: ImageBlockElement => false
      case _ => true
    }

    !page.article.blocks.exists(_.main.exists(_.elements.exists(unsupportedElement)))
  }

  private[this] val tagsBlacklist: Set[String] = Set(
    "tracking/platformfunctional/dcrblacklist"
  )

  def isNotImmersive(page: PageWithStoryPackage): Boolean = ! page.item.isImmersive

  def isNotLiveBlog(page:PageWithStoryPackage): Boolean = ! page.item.isLiveBlog

  def isNotAReview(page:PageWithStoryPackage): Boolean = ! page.item.tags.isReview

  def isNotAGallery(page:PageWithStoryPackage): Boolean = ! page.item.tags.isGallery

  def isNotAMP(request: RequestHeader): Boolean = !request.isAmp

  def isNotOpinion(page:PageWithStoryPackage): Boolean = ! page.item.tags.isComment

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = ! page.article.tags.isPaidContent

  def mainMediaIsNotShowcase(page: PageWithStoryPackage): Boolean = ! page.article.elements.mainPicture.flatMap(_.images.masterImage.flatMap(_.role)).contains("showcase")

  def isNewsTone(page: PageWithStoryPackage): Boolean = {
    page.article.tags.tones.headOption.exists(_.id == "tone/news") || page.article.tags.tones.isEmpty
  }

  def isNotBlackListed(page: PageWithStoryPackage): Boolean = {
    !page.item.tags.tags.exists(s=>tagsBlacklist(s.id))
  }

}

object DotcomRendering {

  def featureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageDCRChecks.isSupportedType(page)),
      ("hasBlocks", ArticlePageDCRChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", ArticlePageDCRChecks.hasOnlySupportedElements(page)),
      ("hasOnlySupportedMainElements", ArticlePageDCRChecks.hasOnlySupportedMainElements(page)),
      ("isDiscussionDisabled", ArticlePageDCRChecks.isDiscussionDisabled(page)),
      ("isNotImmersive", ArticlePageDCRChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageDCRChecks.isNotLiveBlog(page)),
      ("isNotAReview", ArticlePageDCRChecks.isNotAReview(page)),
      ("isNotAGallery", ArticlePageDCRChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageDCRChecks.isNotAMP(request)),
      ("isNotOpinionP", ArticlePageDCRChecks.isNotOpinion(page)),
      ("isNotPaidContent", ArticlePageDCRChecks.isNotPaidContent(page)),
      ("isNewsTone", ArticlePageDCRChecks.isNewsTone(page)),
      ("isNotBlackListed", ArticlePageDCRChecks.isNotBlackListed(page)),
      ("mainMediaIsNotShowcase", ArticlePageDCRChecks.mainMediaIsNotShowcase(page))
    )
  }

  def pageIsDCRSupported(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    // Indicates whether the page is technically supported by DCR
    val whitelistFeatures = DotcomRendering.featureWhitelist(page, request)
    whitelistFeatures.forall({ case (_, isMet) => isMet})
  }

  def pageWithStoryPackageIsDotcomRenderingEligible(page: PageWithStoryPackage)(implicit request: RequestHeader): Boolean = {
    // Indicates whether the page is technically supported by DCR and isEligible for the current request
    val isEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn
    val isAdFree = ArticlePageDCRChecks.isAdFree(page, request)
    val isCommercialBetaUser = ActiveExperiments.isParticipating(DotcomRenderingAdvertisements)

    (pageIsDCRSupported(page, request) && isEnabled && (isAdFree || isCommercialBetaUser) && !request.forceDCROff) || request.forceDCR
  }

}
