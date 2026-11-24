package test

import contentapi.ContentApiClient
import controllers.ArticleController
import model.{ArticleBlocks, ArticlePage, InteractivePage}
import model.meta.BlocksOn
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.Helpers.stubControllerComponents
import renderers.DotcomRenderingService
import services.{ArticleAbTestAgent, ArticleABTestService, ArticleVariantControllerTest, MockSubnavAgent, NewsletterService}

import scala.concurrent.Future

class ArticleAbVariantTest extends ArticleVariantControllerTest {
  override protected def originalType: String = "article"

  override protected def render(
      capi: ContentApiClient,
      renderer: DotcomRenderingService,
      agent: ArticleAbTestAgent,
      newsletters: NewsletterService,
      path: String,
      articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage],
      interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage],
  )(implicit request: RequestHeader): Future[Result] = {
    val ws = mock[WSClient]
    val subnav = new MockSubnavAgent()
    val articleAbTestService = new ArticleABTestService(capi, agent, ws, renderer, subnav, newsletters)
    val controller = new ArticleController(
      contentApiClient = capi,
      controllerComponents = stubControllerComponents(),
      ws = ws,
      remoteRenderer = renderer,
      newsletterService = newsletters,
      subnavAgent = subnav,
      articleAbTestService = articleAbTestService,
    )
    controller.mapAndRender(path, ArticleBlocks)(articleModifier, interactiveModifier)
  }
}
