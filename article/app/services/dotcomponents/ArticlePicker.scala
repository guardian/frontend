package services.dotcomponents

import controllers.ArticlePage
import experiments.{ActiveExperiments, Control, DCRBubble, DotcomRendering1, DotcomRendering2, Excluded, Experiment, Participant}
import model.PageWithStoryPackage
import implicits.Requests._
import model.liveblog.{BlockElement, ContentAtomBlockElement, ImageBlockElement, InstagramBlockElement, PullquoteBlockElement, RichLinkBlockElement, TextBlockElement, TweetBlockElement}
import model.dotcomrendering.pageElements.SoundcloudBlockElement
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
      case _: InstagramBlockElement => false
      case _: SoundcloudBlockElement => false
      case ContentAtomBlockElement(_, atomtype) => {
        // ContentAtomBlockElement was expanded to include atomtype.
        // To whitelist an atom type, just add it to supportedAtomTypes
        val supportedAtomTypes = List("explainer")
        !supportedAtomTypes.contains(atomtype)
      }
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

  // Custom Tag that can be added to articles + special reports tags while we don't support them
  private[this] val tagsBlacklist: Set[String] = Set(
    "tracking/platformfunctional/dcrblacklist",
    "business/series/undercover-in-the-chicken-industry",
    "business/series/britains-debt-timebomb",
    "world/series/this-is-europe",
    "environment/series/the-polluters",
    "news/series/hsbc-files",
    "news/series/panama-papers",
    "us-news/homan-square",
    "uk-news/series/the-new-world-of-work",
    "world/series/the-new-arrivals",
    "news/series/nauru-files",
    "us-news/series/counted-us-police-killings",
    "australia-news/series/healthcare-in-detention",
    "society/series/this-is-the-nhs",
    "artanddesign/series/guardian-print-shop"
  )

  def isNotPhotoEssay(page: PageWithStoryPackage): Boolean = ! page.item.isPhotoEssay

  def isNotLiveBlog(page:PageWithStoryPackage): Boolean = ! page.item.isLiveBlog

  def isNotAGallery(page:PageWithStoryPackage): Boolean = ! page.item.tags.isGallery

  def isNotAMP(request: RequestHeader): Boolean = ! request.isAmp

  def isNotOpinion(page:PageWithStoryPackage): Boolean = ! page.item.tags.isComment

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = ! page.article.tags.isPaidContent

  def mainMediaIsNotShowcase(page: PageWithStoryPackage): Boolean = ! page.article.elements.mainPicture.flatMap(_.images.masterImage.flatMap(_.role)).contains("showcase")

  def isSupportedTone(page: PageWithStoryPackage): Boolean = {
    Set(
      "tone/albumreview",
      "tone/analysis",
      "tone/blog",
      "tone/comment",
      "tone/competitions",
      "tone/documentaries",
      "tone/editorials",
      "tone/explainers",
      "tone/extract",
      "tone/features",
      "tone/help",
      "tone/interview",
      "tone/letters",
      "tone/livereview",
      "tone/news",
      "tone/obituaries",
      "tone/performances",
      "tone/polls",
      "tone/profiles",
      "tone/recipes",
      "tone/reviews",
      "tone/timelines"
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
      ("isNotPhotoEssay", ArticlePageChecks.isNotPhotoEssay(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isSupportedTone", ArticlePageChecks.isSupportedTone(page)),
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
    val hasPrimaryFeatures = forall(primaryChecks)

    val userInDCRTest1 = ActiveExperiments.isParticipating(DotcomRendering1)
    val userInDCRTest2 = ActiveExperiments.isParticipating(DotcomRendering2)
    val userInDCRBubble = ActiveExperiments.isParticipating(DCRBubble)

    val tier =
      if (dcrDisabled(request)) LocalRenderArticle
      else if (dcrForced(request)) RemoteRender
      else if (userInDCRBubble) RemoteRender
      else if ((userInDCRTest1 || userInDCRTest2) && hasPrimaryFeatures) RemoteRender
      else LocalRenderArticle

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val isAddFree = ArticlePageChecks.isAdFree(page, request);
    val pageTones = page.article.tags.tones.map(_.id).mkString(", ")

    def testGroup(experiment: Experiment): String = ActiveExperiments.groupFor(experiment) match {
      case Participant => "participant"
      case Control => "control"
      case Excluded => "excluded"
    }

    // include features that we wish to log but not whitelist against
    val features = primaryChecks.mapValues(_.toString) +
      ("dcrTestGroup" -> TestGroups.combinator(testGroup(DotcomRendering1), testGroup(DotcomRendering2))) +
      ("userIsInCohort" -> (userInDCRTest1 || userInDCRTest2).toString) +
      ("isAdFree" -> isAddFree.toString) +
      ("isArticle100PercentPage" -> isArticle100PercentPage.toString) +
      ("dcrCouldRender" -> hasPrimaryFeatures.toString) +
      ("pageTones" -> pageTones)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }

    tier
  }
}

object TestGroups {
  /*
    This was introduced when DotcomRendering became DotcomRendering1 and DotcomRendering2
    so that we could have 30% of the audience eligible for DCR rendering, a percentage between
    20% and 50% that could not be achieved with a single test. The problem to solve was to make both
    tests behave like one.
   */
  def combinator(group1: String, group2: String): String = {
    // User is participant of the combined experiment if they are participant in either of the two base experiments,
    // else are control if control in either of the two base experiments,
    // else are not in the test.

    // This function assumes that the two buckets are distinct, and in particular that the same user cannot be
    // participant of one and control of the other at the same time.
    // If buckets are not distinct do not use it!
    
    (group1, group2) match {
      case ("participant", _) => "participant"
      case (_, "participant") => "participant"
      case ("control", _) => "control"
      case (_, "control") => "control"
      case _ => "excluded"
    }
  }
}
