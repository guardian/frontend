package services.dotcomponents

import controllers.ArticlePage
import experiments.{ActiveExperiments, DotcomRenderingAdvertisements}
import model.PageWithStoryPackage
import implicits.Requests._
import model.liveblog._
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

  def hasNoScriptTags(page: PageWithStoryPackage): Boolean = {

    // introduced this check because of a bug where the dotcomponents data model is put as a json string
    // onto the page html, and if that happens to contain a closing script tag, it will cause the page
    // to render incorrectly because of a lack of proper escaping.
    //
    // this method is super ugly so I'd ideally like to find a way to do this differently. We will eventually
    // have to support script tags anyway.

    def hasScriptTag = (s: Option[String]) => s.exists(_.contains("<script"))

    def elementHasScriptTagInHTML(blockElement: BlockElement) = blockElement match {
      case TextBlockElement(html) => hasScriptTag(html)
      case TweetBlockElement(html) => hasScriptTag(html)
      case PullquoteBlockElement(html) => hasScriptTag(html)
      case EmbedBlockElement(html, safe, alt) => hasScriptTag(html)
      case InteractiveBlockElement(html) => hasScriptTag(html)
      case CommentBlockElement(html) => hasScriptTag(html)
      case TableBlockElement(html) => hasScriptTag(html)
      case WitnessBlockElement(html) => hasScriptTag(html)
      case DocumentBlockElement(html) => hasScriptTag(html)
      case InstagramBlockElement(html) => hasScriptTag(html)
      case VineBlockElement(html) => hasScriptTag(html)
      case MapBlockElement(html) => hasScriptTag(html)
      case UnknownBlockElement(html) => hasScriptTag(html)
      case CodeBlockElement(html) => hasScriptTag(html)
      case FormBlockElement(html) => hasScriptTag(html)
      case _ => false
    }

    !page.article.blocks.exists(_.main.exists(_.elements.exists(elementHasScriptTagInHTML)))

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

  def isNewsTone(page: PageWithStoryPackage): Boolean = {
    page.article.tags.tones.headOption.exists(_.id == "tone/news") || page.article.tags.tones.isEmpty
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
      ("isDiscussionDisabled", ArticlePageChecks.isDiscussionDisabled(page)),
      ("isNotImmersive", ArticlePageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAReview", ArticlePageChecks.isNotAReview(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotOpinionP", ArticlePageChecks.isNotOpinion(page)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isNewsTone", ArticlePageChecks.isNewsTone(page)),
      ("isNotBlackListed", ArticlePageChecks.isNotBlackListed(page)),
      ("hasNoScriptTags", ArticlePageChecks.hasNoScriptTags(page)),
    )
  }

  def dcrCouldRender(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val whitelistFeatures = featureWhitelist(page, request)
    val isSupported = whitelistFeatures.forall({ case (test, isMet) => isMet})

    isSupported
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {

    val whitelistFeatures = featureWhitelist(page, request)
    val isEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn
    val isAdFree = ArticlePageChecks.isAdFree(page, request)
    val isCommercialBetaUser = ActiveExperiments.isParticipating(DotcomRenderingAdvertisements)

    // add free pages always go through DCR provided it's turned on and we support its article features.
    // pages with commercial aspects require the request to go through the DotcomRenderingAdvertisements abtest

    val tier = if ((dcrCouldRender(page, request) && isEnabled && (isAdFree || isCommercialBetaUser) && !request.forceDCROff) || request.forceDCR) RemoteRender else LocalRenderArticle

    // include features that we wish to log but not whitelist against
    val features = whitelistFeatures + ("isCommercialBetaUser" -> isCommercialBetaUser)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }

    tier
  }
}
