package test

import com.gu.contentapi.client.model.v1.{ContentType => ApiContentType}
import contentapi.ContentApiClient
import controllers.InteractiveController
import model.{ArticlePage, Content, InteractivePage}
import model.meta.BlocksOn
import org.mockito.Mockito.verifyNoInteractions
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.Helpers._
import renderers.DotcomRenderingService
import services.{
  ArticleAbTestAgent,
  ArticleABTestService,
  ArticleVariantControllerTest,
  MockSubnavAgent,
  NewsletterService,
}

import scala.concurrent.Future

class InteractiveArticleAbTest extends ArticleVariantControllerTest {
  override protected def originalContentType: ApiContentType = ApiContentType.Interactive
  override protected def originalPath: String = "lifeandstyle/ng-interactive/2026/nov/23/original"
  override protected def renderedOriginalContent(fixture: Fixture): Content =
    fixture.renderedInteractive.page.interactive.content

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

  "Original article interactive failures" should "return an uncached 500 for a modifier failure when no variant is selected" in withEditorialTests {
    val fixture = new Fixture(originalResponse())
    val error = new RuntimeException("Original interactive modifier failed")

    val result = fixture.run(
      req = originalRequest,
      interactiveModifier = _ => throw error,
    )

    status(result) shouldBe INTERNAL_SERVER_ERROR
    header(CACHE_CONTROL, result) shouldBe Some("private, no-store, no-cache")
    fixture.verifyLookups(originalLookup)
    verifyNoInteractions(fixture.renderer)
  }
}
