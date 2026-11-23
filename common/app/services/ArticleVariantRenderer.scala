package services

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse}
import common.GuLogging
import conf.Configuration
import implicits._
import implicits.Requests._
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.meta.BlocksOn
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import renderers.DotcomRenderingService

import scala.concurrent.{ExecutionContext, Future}

object ArticleVariantRenderer {
  def supportsRequest(implicit request: RequestHeader): Boolean =
    !request.isApps && !request.forceDCROff && (request.getRequestFormat match {
      case HtmlFormat | AmpFormat | JsonFormat => true
      case _                                   => false
    })
}

/** Renders an already-selected variant using its own content type but the original page's identity. No lookups,
  * bucketing or pressed-page redirects take place here. None asks the caller to render A instead.
  */
class ArticleVariantRenderer(
    ws: WSClient,
    remoteRenderer: DotcomRenderingService,
    subnavAgent: SubnavAgent,
    newsletterService: NewsletterService,
)(implicit context: ApplicationContext, ec: ExecutionContext)
    extends GuLogging {

  def render(response: ItemResponse, originalPath: String)(
      articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage] = identity,
      interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
  )(implicit request: RequestHeader): Future[Option[Result]] = {
    if (!ArticleVariantRenderer.supportsRequest) Future.successful(None)
    else {
      val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())
      response.content match {
        case Some(apiContent) if apiContent.isInteractive =>
          val interactive = Interactive.make(apiContent)
          val page = InteractivePage(
            interactive.copy(content = maskContent(interactive.content, originalPath)),
            StoryPackages(apiContent.id, response),
          )
          renderInteractive(interactiveModifier(BlocksOn(page, blocks))).map(Some(_))
        case Some(apiContent)
            if apiContent.isArticle && !apiContent.isLiveBlog && !apiContent.isHosted && !apiContent.isSudoku =>
          val article = Article.make(Content.make(apiContent))
          val variantPage = ArticlePage(article, StoryPackages(apiContent.id, response))
          // Legacy signup-page matching needs B's ID, not the public identity of A.
          val newsletter = newsletterService.getNewsletterForArticle(variantPage)
          val page = variantPage.copy(article = article.copy(content = maskContent(article.content, originalPath)))
          renderArticle(articleModifier(BlocksOn(page, blocks)), newsletter).map(Some(_))
        case _ =>
          log.warn(s"Unsupported or missing article A/B variant for $originalPath; rendering the original content")
          Future.successful(None)
      }
    }
  }

  private def maskContent(content: Content, originalPath: String): Content = {
    val url = s"/$originalPath"
    content.copy(metadata =
      content.metadata.copy(
        id = originalPath,
        url = url,
        webUrl = s"${Configuration.site.host}$url",
        canonicalUrl = Some(s"${Configuration.site.host}$url"),
      ),
    )
  }

  private def renderArticle(pageBlocks: BlocksOn[ArticlePage], newsletter: Option[NewsletterData])(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val page = pageBlocks.page
    val pageType = PageType(page, request, context)
    val subnav = subnavAgent.getSubnavForContent(page.article.content)
    request.getRequestFormat match {
      case JsonFormat =>
        val data = DotcomRenderingDataModel.forArticle(pageBlocks, request, pageType, newsletter, subnav)
        Future.successful(common.renderJson(DotcomRenderingDataModel.toJson(data), page).as("application/json"))
      case AmpFormat if page.article.content.shouldAmplify =>
        remoteRenderer.getAMPArticle(ws, pageBlocks, pageType, newsletter)
      case _ =>
        remoteRenderer.getArticle(ws, pageBlocks, pageType, newsletter, customSubnav = subnav)
    }
  }

  private def renderInteractive(
      pageBlocks: BlocksOn[InteractivePage],
  )(implicit request: RequestHeader): Future[Result] = {
    val page = pageBlocks.page
    val pageType = PageType(page, request, context)
    val subnav = subnavAgent.getSubnavForContent(page.interactive.content)
    request.getRequestFormat match {
      case JsonFormat =>
        val data = DotcomRenderingDataModel.forInteractive(pageBlocks, request, pageType, subnav)
        Future.successful(common.renderJson(DotcomRenderingDataModel.toJson(data), page).as("application/json"))
      case AmpFormat if page.interactive.content.shouldAmplify =>
        remoteRenderer.getAMPInteractive(ws, pageBlocks, pageType)
      case _ =>
        remoteRenderer.getInteractive(ws, pageBlocks, pageType, subnav)
    }
  }
}
