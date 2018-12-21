package services.dotcomponents

import common.Logging
import controllers.ArticlePage
import implicits.Requests._
import model.PageWithStoryPackage
import model.liveblog._
import play.api.mvc.RequestHeader
import views.support.Commercial


class RenderingTierPicker {

  val logger =  DotcomponentsLogger()

  private[this] val whitelist = Set(
    "world/2018/oct/14/british-man-shot-dead-by-hunter-in-france",
    "politics/2018/oct/14/brexit-dominic-raab-rushes-to-brussels-before-eu-crunch-talks",
    "politics/2018/oct/14/eu-leaders-line-up-no-deal-emergency-brexit-summit-for-november",
    "world/2018/oct/01/palu-earthquake-and-tsunami-what-we-know-so-far",
    "info/2018/may/09/why-sign-in-to-the-guardian",
    "society/2018/oct/14/folic-acid-to-be-added-to-flour-in-effort-to-reduce-serious-birth-defects",
    "film/2017/dec/08/bryan-singer-denies-sexually-assaulting-17-year-old-boy-at-yacht-party-in-2003",
    "business/2018/oct/14/china-ambassador-cui-tiankai-stumped-on-who-aides-trump-on-trade",
    "world/2018/oct/14/bavaria-poll-humiliation-for-angela-merkel-conservative-allies",
    "world/2017/dec/31/at-least-10-tourists-and-two-pilots-killed-as-plane-crashes-in-costa-rica",
    "us-news/2017/nov/28/new-york-truck-attack-suspect-sayfullo-saipov",
    "australia-news/2018/oct/15/us-embassy-apologises-after-mistakenly-sending-cookie-monster-cat-invitation",
    "politics/2018/oct/15/foreign-office-left-disoriented-and-demoralised-by-brexit-say-diplomats",
    "film/2018/aug/03/harvey-weinstein-lawyers-new-york-court-sexual-assault-charges",
    "politics/2018/oct/14/local-welfare-schemes-in-england-on-brink-of-collapse-survey-finds",
    "society/2018/sep/01/children-social-care-services-councils-austerity",
    "uk-news/2018/oct/15/mi5-believed-black-people-posed-security-risk-papers-reveal",
    "info/2018/sep/07/removed-video",
    "world/2018/aug/24/more-than-25-children-and-four-women-killed-in-air-strikes-in-yemen",
    "help/2018/may/29/why-do-i-need-to-upgrade-my-browser",
    "world/2017/oct/23/syria-shocking-images-of-starving-baby-reveal-impact-of-food-crisis",
    "business/2018/oct/14/saudi-shares-drop-on-fallout-journalists-disappearance-trump",
    "commentisfree/2018/may/27/royal-wedding-celebration-black-excellence-letters",
    "uk-news/2018/sep/05/child-sexual-exploitation-18-people-appear-in-huddersfield-court",
    "us-news/2018/aug/18/colorado-bodies-crude-oil-murder-case",
    "business/2018/oct/14/uk-scientists-turn-coffee-waste-electricity-fuel-cell-colombia",
    "info/2018/sep/20/article-removed",
    "money/2018/oct/15/three-quarters-of-uk-workers-do-not-receive-same-pay-each-month",
    "info/2018/aug/10/article-removed",
    "help/2018/apr/18/subscriptions",
    "uk-news/2018/oct/14/met-police-damian-collins-no-investigation-leave-campaigners-data-misuse",
    "world/2018/oct/14/nine-climbers-killed-in-storm-in-himalayas-mount-gurja-nepal-south-korea",
    "help/2017/mar/15/computer-security-tips-for-whistleblowers-and-sources",
    "uk-news/2018/oct/15/cornwall-murder-lyn-bryant-police-new-dna-evidence",
    "uk-news/2018/oct/18/man-beaten-to-death-in-south-west-london",
    "science/2018/oct/17/chinese-city-plans-to-launch-artificial-moon-to-replace-streetlights",
    "uk-news/2018/oct/17/no-retrial-for-teacher-accused-of-having-sex-with-student-on-plane-eleanor-wilson",
    "australia-news/2018/oct/18/queensland-man-charged-with-raping-young-english-woman-on-working-holiday",
    "business/2018/oct/17/man-falls-from-top-floor-of-westfield-stratford-on-to-another-shopper",
    "uk-news/2018/oct/17/elizabeth-isherwood-wales-death-locked-cupboard-macdonald-resorts-sued",
    "us-news/2018/oct/17/high-school-cookies-teen-grandfather-ashes"
  )

  private[this] def featureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", PageChecks.isSupportedType(page)),
      ("hasBlocks", PageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", PageChecks.hasOnlySupportedElements(page)),
      ("isDiscussionDisabled", PageChecks.isDiscussionDisabled(page)),
      ("isAdFree", PageChecks.isAdFree(page, request)),
      ("isNotImmersive", PageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", PageChecks.isNotLiveBlog(page)),
      ("isNotAReview", PageChecks.isNotAReview(page)),
      ("isNotAGallery", PageChecks.isNotAGallery(page)),
      ("isNotAMP", PageChecks.isNotAMP(request)),
      ("isNotOpinionP", PageChecks.isNotOpinion(page))
    )
  }

  private[this] def ampFeatureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isBasicArticle", AMPPageChecks.isBasicArticle(page)),
      ("hasOnlySupportedElements", AMPPageChecks.hasOnlySupportedElements(page)),
      ("isDiscussionDisabled", AMPPageChecks.isNotCommentable(page)),
    )
  }

  private[this] def logRequest(msg:String, results: Map[String, Boolean])(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results)
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val features = featureWhitelist(page, request)
    val isSupported = features.forall({ case (test, isMet) => isMet})
    val isWhitelisted = whitelist(page.metadata.id)
    val isEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn

    if (!isSupported) {
      logRequest("Article was remotely renderable", features)
    } else {
      logRequest("Article was only locally renderable", features)
    }

    val AMPFeatures = ampFeatureWhitelist(page, request)
    val isAMPSupported = AMPFeatures.forall({ case (test, isMet) => isMet})
    if (request.isAmp && isAMPSupported) {
      logRequest(s"AMP - path supported by dotcomponents", Map.empty)
    } else {
      logRequest(s"AMP - path unsupported by dotcomponents", Map.empty)
    }

    if (request.isAmp && (request.isGuui)) RemoteRenderAMP
    else if (request.isGuui || (isEnabled && isSupported && isWhitelisted)) RemoteRender
    else LocalRender
  }
}

object AMPPageChecks extends Logging {

  def isBasicArticle(page: PageWithStoryPackage): Boolean = {
    page.isInstanceOf[ArticlePage] &&
    !page.item.isLiveBlog &&
    !page.item.isPhotoEssay
  }

  def isNotCommentable(page: PageWithStoryPackage): Boolean = {
    !page.article.content.trail.isCommentable
  }

  def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    // See: https://github.com/guardian/dotcom-rendering/blob/master/packages/frontend/amp/components/lib/Elements.tsx
    def supported(block: BlockElement): Boolean = block match {
      case _: TextBlockElement => true
      case _: ImageBlockElement => true
      case _: InstagramBlockElement => true
      case _: TweetBlockElement => true
      case _: RichLinkBlockElement => true
      case _: CommentBlockElement => true
      case _ => false
    }

    page.article.blocks match {
      case Some(blocks) => {
        blocks.body.exists(bodyBlock => bodyBlock.elements.forall(supported))
      }
      case None => true
    }
  }
}


object PageChecks {

  // each function should ideally only check a single value

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
    def unsupportedElement(blockElement: BlockElement) = blockElement match {
      case _: TextBlockElement => false
      case _ => true
    }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  def isNotImmersive(page: PageWithStoryPackage): Boolean = ! page.item.isImmersive

  def isNotLiveBlog(page:PageWithStoryPackage): Boolean = ! page.item.isLiveBlog

  def isNotAReview(page:PageWithStoryPackage): Boolean = ! page.item.tags.isReview

  def isNotAGallery(page:PageWithStoryPackage): Boolean = ! page.item.tags.isGallery

  def isNotAMP(request: RequestHeader): Boolean = ! request.isAmp

  def isNotOpinion(page:PageWithStoryPackage): Boolean = ! page.item.tags.isComment
}

object RenderingTierPicker {
  def apply(): RenderingTierPicker = new RenderingTierPicker()
}
