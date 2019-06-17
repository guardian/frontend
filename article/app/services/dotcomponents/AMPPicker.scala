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

  def getTier(page: PageWithStoryPackage, blocks: APIBlocks)(implicit request: RequestHeader): RenderType = {
    val isSupported = page.article.content.shouldAmplify

    val tier = if (isSupported || request.isGuui) {
      RemoteRenderAMP
    } else {
      LocalRenderArticle
    }

    tier match {
      case RemoteRenderAMP => logRequest(s"path executing in dotcomponents AMP", Map.empty, page)
      case _ => logRequest(s"path executing in web AMP", Map.empty, page)
    }

    tier
  }
}
