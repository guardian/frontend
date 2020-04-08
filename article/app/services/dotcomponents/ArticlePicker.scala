package services.dotcomponents

import controllers.ArticlePage
import experiments.{ActiveExperiments, DCRBubble, DiscussionRendering, DotcomRendering}
import model.PageWithStoryPackage
import implicits.Requests._
import model.liveblog.{BlockElement, ImageBlockElement, PullquoteBlockElement, RichLinkBlockElement, TextBlockElement, TweetBlockElement}
import play.api.mvc.RequestHeader
import views.support.Commercial

object ArticlePageChecks {

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

  def isNotAMP(request: RequestHeader): Boolean = ! request.isAmp

  def isNotOpinion(page:PageWithStoryPackage): Boolean = ! page.item.tags.isComment

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = ! page.article.tags.isPaidContent

  def mainMediaIsNotShowcase(page: PageWithStoryPackage): Boolean = ! page.article.elements.mainPicture.flatMap(_.images.masterImage.flatMap(_.role)).contains("showcase")

  def isSupportedTone(page: PageWithStoryPackage): Boolean = {
    Set(
      "tone/news",
      "tone/blogposts",
      "tone/interviews",
      "tone/obituaries",
      "tone/analysis",
      "tone/letters"
    ).contains(page.article.tags.tones.headOption.map(_.id).getOrElse("")) || page.article.tags.tones.isEmpty
  }

  def isNotBlackListed(page: PageWithStoryPackage): Boolean = {
    !page.item.tags.tags.exists(s=>tagsBlacklist(s.id))
  }

}

object ArticlePicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, Boolean], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  private[this] def featureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasBlocks", ArticlePageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("hasOnlySupportedMainElements", ArticlePageChecks.hasOnlySupportedMainElements(page)),
      ("isNotImmersive", ArticlePageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAReview", ArticlePageChecks.isNotAReview(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isSupportedTone", ArticlePageChecks.isSupportedTone(page)),
      ("isNotBlackListed", ArticlePageChecks.isNotBlackListed(page)),
      ("mainMediaIsNotShowcase", ArticlePageChecks.mainMediaIsNotShowcase(page))
    )
  }

  def isInWhitelist(path: String): Boolean = {
    // our whitelist is only one article at the moment
    path == "/info/2019/dec/08/migrating-the-guardian-website-to-react";
  }

  def primaryChecksForDCRRendering(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val whitelistFeatures = featureWhitelist(page, request)
    val isSupported = whitelistFeatures.forall({ case (test, isMet) => isMet})

    isSupported
  }

  def dcrArticle100PercentPage(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val whitelistFeatures = featureWhitelist(page, request)
    val article100PercentPageFeatures = whitelistFeatures.filterKeys(
      Set(
        "isSupportedType",
        "isNotLiveBlog",
        "isNotAGallery",
        "isNotAMP",
        "isNotBlackListed",
        "isNotPaidContent"
      )
    )
    val isArticle100PercentPage = article100PercentPageFeatures.forall({ case (test, isMet) => isMet})
    isArticle100PercentPage
  }

  def dcrShouldRender(request: RequestHeader): Boolean = {
    // dcrShouldRender provides an override to let us force rendering by DCR even
    // when an article is not supportted
    val forceDCR = request.forceDCR
    forceDCR || isInWhitelist(request.path)
  }

  def dcrShouldNotRender(request: RequestHeader): Boolean = {
    val forceDCROff = request.forceDCROff
    val dcrEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn
    forceDCROff || !dcrEnabled
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val whitelistFeatures = featureWhitelist(page, request)
    val userIsInDotcomRenderingCohort = ActiveExperiments.isParticipating(DotcomRendering)
    val userIsInDiscussionRenderingCohort = ActiveExperiments.isParticipating(DiscussionRendering)
    val userIsInDCRBubbleCohort = ActiveExperiments.isParticipating(DCRBubble)
    val additionalChecksForRegularCohort = ArticlePageChecks.isDiscussionDisabled(page) && ArticlePageChecks.isNotOpinion(page)

    // Decide if we should render this request with the DCR platform or not
    val tier = if (dcrShouldNotRender(request)) {
      LocalRenderArticle
    } else if (dcrShouldRender(request) || userIsInDCRBubbleCohort) {
      RemoteRender
    } else if (primaryChecksForDCRRendering(page, request) && additionalChecksForRegularCohort && userIsInDotcomRenderingCohort) {
      RemoteRender
    } else if (primaryChecksForDCRRendering(page, request) && userIsInDiscussionRenderingCohort) {
      RemoteRender
    } else {
      LocalRenderArticle
    }

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val isAddFree = ArticlePageChecks.isAdFree(page, request)

    // include features that we wish to log but not whitelist against
    val features = whitelistFeatures +
      ("userIsInCohort" -> userIsInDotcomRenderingCohort) +
      ("userIsInCohortDiscussion" -> userIsInDiscussionRenderingCohort) +
      ("isAdFree" -> isAddFree) +
      ("isArticle100PercentPage" -> isArticle100PercentPage)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }

    tier
  }
}
