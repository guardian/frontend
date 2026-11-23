package test

import contentapi.ContentApiClient
import controllers.ArticleController
import model.{ArticleBlocks, ArticlePage, InteractivePage}
import model.meta.BlocksOn
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.Helpers.stubControllerComponents
import renderers.DotcomRenderingService
import services.{ArticleAbTestAgent, ArticleVariantControllerTest, MockSubnavAgent, NewsletterService}

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
    val controller = new ArticleController(
      contentApiClient = capi,
      controllerComponents = stubControllerComponents(),
      ws = mock[WSClient],
      remoteRenderer = renderer,
      newsletterService = newsletters,
      subnavAgent = new MockSubnavAgent(),
      articleAbTestAgent = agent,
    )
    controller.mapAndRender(path, ArticleBlocks)(articleModifier, interactiveModifier)
  }
}
