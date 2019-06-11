package services.dotcomponents

import com.gu.contentapi.client.model.v1.{ElementType, Blocks => APIBlocks}
import common.Logging
import controllers.ArticlePage
import implicits.Requests._
import model.PageWithStoryPackage
import com.gu.contentapi.client.model.v1.ElementType.{Map => MapElement, _} // prevent overriding normal Map type
import play.api.mvc.RequestHeader


object AMPPageChecks extends Logging {

  def isBasicArticle(page: PageWithStoryPackage): Boolean = {
    page.isInstanceOf[ArticlePage] &&
      !page.item.isLiveBlog &&
      !page.item.isPhotoEssay
  }

  def hasOnlySupportedElements(blocks: APIBlocks): Boolean = {
    // See: https://github.com/guardian/dotcom-rendering/blob/master/packages/frontend/amp/components/lib/Elements.tsx
    // And also PageElement.scala here.
    // It is necessary to look at both to check that we handle the relevant element type here and also handle the
    // resulting PageElement model in DCR.
    def supported(element: ElementType): Boolean = element match {
      case Text => true
      case Image => true
      case Instagram => true
      case Tweet => true
      case RichLink => true
      case Comment => true
      case Pullquote => true
      case Video => true
      case Contentatom => true
      case Audio => true
      case Interactive => true
      case MapElement => true
      case Embed => true
      case _: ElementType => false
    }

    blocks.body
      .getOrElse(Nil)
      .flatMap(_.elements)
      .forall(element => supported(element.`type`))
  }
}

object AMPPicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, Boolean], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  private[this] def ampFeatureWhitelist(page: PageWithStoryPackage, request: RequestHeader, blocks: APIBlocks): Map[String, Boolean] = {
    Map(
      ("isBasicArticle", AMPPageChecks.isBasicArticle(page)),
      ("hasOnlySupportedElements", AMPPageChecks.hasOnlySupportedElements(blocks)),
    )
  }

  def getTier(page: PageWithStoryPackage, blocks: APIBlocks)(implicit request: RequestHeader): RenderType = {

    val features = ampFeatureWhitelist(page, request, blocks)
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
