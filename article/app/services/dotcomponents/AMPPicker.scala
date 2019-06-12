package services.dotcomponents

import com.gu.contentapi.client.model.v1.{Blocks => APIBlocks}
import controllers.ArticlePage
import implicits.Requests._
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader

object AMPPicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, Boolean], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  private[this] def ampFeatureWhitelist(page: PageWithStoryPackage): Map[String, Boolean] = {
    def isBasicArticle(page: PageWithStoryPackage): Boolean = {
      page.isInstanceOf[ArticlePage] && !page.item.isPhotoEssay
    }

    Map(
      ("isBasicArticle", isBasicArticle(page))
    )
  }

  def getTier(page: PageWithStoryPackage, blocks: APIBlocks)(implicit request: RequestHeader): RenderType = {

    val features = ampFeatureWhitelist(page)
    val isSupported = features.forall({ case (test, isMet) => isMet})
    val isEnabled = conf.switches.Switches.DotcomRenderingAMP.isSwitchedOn

    val tier = if ((isSupported && isEnabled && !request.guuiOptOut) || request.isGuui) {
      RemoteRenderAMP
    } else {
      LocalRender
    }

    tier match {
      case RemoteRenderAMP => logRequest(s"path executing in dotcomponents AMP", features, page)
      case _ => logRequest(s"path executing in web AMP", features, page)
    }

    tier
  }
}
