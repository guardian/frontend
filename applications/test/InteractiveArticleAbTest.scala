package test

import contentapi.ContentApiClient
import controllers.InteractiveController
import model.{ArticlePage, InteractivePage}
import model.meta.BlocksOn
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.Helpers.stubControllerComponents
import renderers.DotcomRenderingService
import services.{ArticleAbTestAgent, ArticleABTestService, ArticleVariantControllerTest, MockSubnavAgent, NewsletterService}

import scala.concurrent.Future

class InteractiveArticleAbTest extends ArticleVariantControllerTest {
  override protected def originalType: String = "interactive"

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
    val controller = new InteractiveController(
      contentApiClient = capi,
      wsClient = ws,
      controllerComponents = stubControllerComponents(),
      remoteRenderer = renderer,
      subnavAgent = subnav,
      articleAbTestService = articleAbTestService,
    )
    controller.mapAndRender(path)(interactiveModifier, articleModifier)
  }
}
