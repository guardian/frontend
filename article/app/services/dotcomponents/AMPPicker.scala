package services.dotcomponents

import common.Logging
import controllers.ArticlePage
import implicits.Requests._
import model.PageWithStoryPackage
import model.liveblog._
import play.api.mvc.RequestHeader

object AMPPageChecks extends Logging {

  def isBasicArticle(page: PageWithStoryPackage): Boolean = {
    page.isInstanceOf[ArticlePage] &&
      !page.item.isLiveBlog &&
      !page.item.isPhotoEssay
  }

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = {
    !page.article.tags.isPaidContent
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
      case _: PullquoteBlockElement => true
      case _ => false
    }

    page.article.blocks match {
      case Some(blocks) =>
        blocks.body.exists(bodyBlock => bodyBlock.elements.forall(supported))
      case None => true
    }
  }
}

object AMPPicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, Boolean], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  private[this] def ampFeatureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isBasicArticle", AMPPageChecks.isBasicArticle(page)),
      ("hasOnlySupportedElements", AMPPageChecks.hasOnlySupportedElements(page)),
      ("isNotPaidContent", AMPPageChecks.isNotPaidContent(page)),
    )
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {

    val features = ampFeatureWhitelist(page, request)
    val isSupported = features.forall({ case (test, isMet) => isMet})
    val isEnabled = conf.switches.Switches.DotcomRenderingAMP.isSwitchedOn

    val tier = if ((isSupported && isEnabled && !request.guuiOptOut) || request.isGuui) RemoteRenderAMP else LocalRender

    tier match {
      case RemoteRenderAMP => logRequest(s"path executing in dotcomponents AMP", features, page)
      case _ => logRequest(s"path executing in web AMP", features, page)
    }

    tier
  }
}
