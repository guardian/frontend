package test

import com.gu.contentapi.client.model.v1.{ContentType => ApiContentType}
import contentapi.ContentApiClient
import controllers.ArticleController
import model.{ArticleBlocks, ArticlePage, Content, InteractivePage}
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

class ArticleAbVariantTest extends ArticleVariantControllerTest {
  override protected def originalContentType: ApiContentType = ApiContentType.Article
  override protected def originalPath: String = "lifeandstyle/2026/nov/23/original"
  override protected def renderedOriginalContent(fixture: Fixture): Content =
    fixture.renderedArticle.page.article.content

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

  "Original article failures" should "leave the future failed if the original article's modifier throws" in withEditorialTests {
    val fixture = new Fixture(originalResponse())
    val error = new RuntimeException("Original article modifier failed")

    val result = fixture.run(
      req = originalRequest,
      articleModifier = _ => throw error,
    )

    await(result.failed) shouldBe error
    fixture.verifyLookups(originalLookup)
    verifyNoInteractions(fixture.renderer)
  }
}
