package services.dotcomponents

import controllers.ArticlePage
import experiments.{ActiveExperiments, Control, DCRBubble, DiscussionRendering, DotcomRendering, Excluded, Experiment, Participant}
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
      "tone/letters",
      "tone/reviews"
    ).contains(page.article.tags.tones.headOption.map(_.id).getOrElse("")) || page.article.tags.tones.isEmpty
  }

  def isSupportedToneExperimentDiscussionRendering(page: PageWithStoryPackage): Boolean = {
    Set(
      "tone/news",
      "tone/blogposts",
      "tone/interviews",
      "tone/obituaries",
      "tone/analysis",
      "tone/letters",
      "tone/comment"
    ).contains(page.article.tags.tones.headOption.map(_.id).getOrElse("")) || page.article.tags.tones.isEmpty
  }

  def isNotBlackListed(page: PageWithStoryPackage): Boolean = {
    !page.item.tags.tags.exists(s=>tagsBlacklist(s.id))
  }

}

object ArticlePicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, String], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  def primaryFeatures(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasBlocks", ArticlePageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("hasOnlySupportedMainElements", ArticlePageChecks.hasOnlySupportedMainElements(page)),
      ("isNotImmersive", ArticlePageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isSupportedTone", ArticlePageChecks.isSupportedTone(page)),
      ("isNotBlackListed", ArticlePageChecks.isNotBlackListed(page)),
      ("mainMediaIsNotShowcase", ArticlePageChecks.mainMediaIsNotShowcase(page)),
    )
  }

  def primaryFeaturesExperimentDiscussionRendering(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasBlocks", ArticlePageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("hasOnlySupportedMainElements", ArticlePageChecks.hasOnlySupportedMainElements(page)),
      ("isNotImmersive", ArticlePageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isSupportedTone", ArticlePageChecks.isSupportedToneExperimentDiscussionRendering(page)),
      ("isNotBlackListed", ArticlePageChecks.isNotBlackListed(page)),
      ("mainMediaIsNotShowcase", ArticlePageChecks.mainMediaIsNotShowcase(page)),
    )
  }

  def isInWhitelist(path: String): Boolean = {
    // our whitelist is only one article at the moment
    path == "/info/2019/dec/08/migrating-the-guardian-website-to-react";
  }

  def forall(features:  Map[String, Boolean]): Boolean = {
    features.forall({ case (_, isMet) => isMet})
  }

  def notCommentOrOpinion(page: PageWithStoryPackage): Boolean = {
    ArticlePageChecks.isDiscussionDisabled(page) || ArticlePageChecks.isNotOpinion(page)
  }

  def dcrArticle100PercentPage(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val whitelistFeatures = primaryFeatures(page, request)
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

  def dcrForced(request: RequestHeader): Boolean = {
    request.forceDCR || isInWhitelist(request.path)
  }

  def dcrDisabled(request: RequestHeader): Boolean = {
    val forceDCROff = request.forceDCROff
    val dcrEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn
    forceDCROff || !dcrEnabled
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val primaryChecks = primaryFeatures(page, request)

    val userInMainTest = ActiveExperiments.isParticipating(DotcomRendering)
    val userInDiscussionTest = ActiveExperiments.isParticipating(DiscussionRendering)
    val userInDCRBubble = ActiveExperiments.isParticipating(DCRBubble)
    val hasPrimaryFeatures = forall(primaryChecks)

    val canRender = hasPrimaryFeatures && notCommentOrOpinion(page)

    val primaryChecksExperimentDiscussionRendering = primaryFeaturesExperimentDiscussionRendering(page, request)
    val hasPrimaryFeaturesExperimentDiscussionRendering = forall(primaryChecksExperimentDiscussionRendering)

    val tier =
      if (dcrDisabled(request)) LocalRenderArticle
      else if (dcrForced(request)) RemoteRender
      else if (userInDCRBubble) RemoteRender
      else if (userInMainTest && canRender) RemoteRender
      else if (userInDiscussionTest && hasPrimaryFeaturesExperimentDiscussionRendering) RemoteRender
      else LocalRenderArticle

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val isAddFree = ArticlePageChecks.isAdFree(page, request)

    def testGroup(experiment: Experiment): String = ActiveExperiments.groupFor(experiment) match {
      case Participant => "participant"
      case Control => "control"
      case Excluded => "excluded"
    }

    // include features that we wish to log but not whitelist against
    val features = primaryChecks.mapValues(_.toString) +
      ("dcrTestGroup" -> testGroup(DotcomRendering)) +
      ("dcrDiscussionTestGroup" -> testGroup(DiscussionRendering)) +
      ("userIsInCohort" -> userInMainTest.toString) +
      ("userIsInCohortDiscussion" -> userInDiscussionTest.toString) +
      ("isAdFree" -> isAddFree.toString) +
      ("isArticle100PercentPage" -> isArticle100PercentPage.toString) +
      ("dcrCouldRender" -> canRender.toString)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }

    tier
  }
}
