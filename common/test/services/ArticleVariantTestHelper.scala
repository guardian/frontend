package services

import ab.ABTests
import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.{
  Content => ApiContent,
  ContentFields,
  ContentType => ApiContentType,
  ItemResponse,
  Tag,
  TagType,
}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.client.models.CustomSubnav
import common.Edition
import conf.Configuration
import conf.switches.Switches.{EditorialABTests, EditorialArticleABTests}
import contentapi.{ApiQueryDefaults, ContentApiClient}
import model.{ArticlePage, Content, InteractivePage, PageWithStoryPackage}
import model.dotcomrendering.PageType
import model.meta.BlocksOn
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{times, verify, when}
import org.mockito.invocation.InvocationOnMock
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.http.HttpEntity
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService
import test.{TestRequest, WithTestApplicationContext}

import java.time.OffsetDateTime
import scala.concurrent.Future
import scala.jdk.CollectionConverters._

/** Test data and mock plumbing shared by the article and interactive controller contract tests. */
abstract class ArticleVariantTestHelper
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with WithTestApplicationContext {
  protected def originalContentType: ApiContentType
  protected def originalPath: String
  protected def renderedOriginalContent(fixture: Fixture): Content
  protected def render(
      capi: ContentApiClient,
      renderer: DotcomRenderingService,
      agent: ArticleAbTestAgent,
      newsletters: NewsletterService,
      path: String,
      articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage],
      interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage],
  )(implicit request: RequestHeader): Future[Result]

  protected val variantPath = "p/variant"
  protected val variantCanonicalPath = "lifeandstyle/2026/nov/23/variant"
  private val defaults = new ApiQueryDefaults {}

  protected def originalResponse(canonicalPath: String = originalPath): ItemResponse =
    response(canonicalPath, "Original A", originalContentType)
  protected def articleVariant: ItemResponse = response(variantCanonicalPath, "Variant B", ApiContentType.Article)
  protected def interactiveVariant: ItemResponse =
    response(variantCanonicalPath, "Variant B", ApiContentType.Interactive)
  protected def unsupportedVariant: ItemResponse =
    response(variantCanonicalPath, "Unsupported", ApiContentType.Liveblog)
  protected def missingVariant: ItemResponse = articleVariant.copy(content = None)

  protected def originalRequest: RequestHeader = request(participation = "fronts-and-curation-editorial-test:a")

  protected def variantRequest(suffix: String = ""): RequestHeader = request(suffix = suffix)

  // Both buckets request the original URL. Only participation determines which content is fetched.
  protected def request(
      participation: String = "fronts-and-curation-editorial-test:b",
      suffix: String = "",
  ): RequestHeader = {
    val raw = TestRequest(s"/$originalPath$suffix").withHeaders(
      "X-Gu-Edition" -> "UK",
      "X-GU-Server-AB-Tests" -> participation,
    )
    raw.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(raw).attrs)
  }

  protected def withEditorialTests(test: => Unit): Unit = {
    val saved = Seq(EditorialABTests, EditorialArticleABTests).map(s => s -> s.isSwitchedOn)
    try {
      saved.foreach { case (s, _) => s.switchOn() }
      test
    } finally {
      saved.foreach { case (s, wasOn) => if (wasOn) s.switchOn() else s.switchOff() }
    }
  }

  protected def originalLookup: ItemQuery = expectedLookup(originalPath)
  protected def variantLookup: ItemQuery = expectedLookup(variantPath).withChannelId("variant")

  private def expectedLookup(path: String): ItemQuery =
    defaults
      .item(path, Edition.defaultEdition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")
      .showSchemaOrg(true)
      .showBlocks("all")

  protected def assertVariantIdentity(content: Content): Unit = {
    content.fields.body shouldBe "<p>Variant B</p>"
    content.metadata.id shouldBe originalPath
    content.metadata.url shouldBe s"/$originalPath"
    content.metadata.webUrl shouldBe s"${Configuration.site.host}/$originalPath"
    content.metadata.canonicalUrl shouldBe Some(s"${Configuration.site.host}/$originalPath")
  }

  protected def strictJson(result: Future[Result]): JsValue = await(result).body match {
    case HttpEntity.Strict(data, _) => Json.parse(data.utf8String)
    case _                          => fail("Expected a strict JSON response")
  }

  protected val promotedNewsletter = NewsletterData(
    identityName = "variant-newsletter",
    name = "Variant newsletter",
    theme = "features",
    description = "Variant description",
    frequency = "Weekly",
    listId = 1234,
    group = "Features",
    successDescription = "You're subscribed!",
    regionFocus = None,
    illustrationCard = None,
    illustrationSquare = None,
    exampleUrl = None,
    category = "article-based",
  )

  /** By default the reader is in bucket B and CAPI returns an article variant. */
  protected class Fixture(itemResponse: ItemResponse = articleVariant) {
    val capi = mock[ContentApiClient]
    val renderer = mock[DotcomRenderingService]
    val newsletters = mock[NewsletterService]
    val agent = new MockArticleAbTestAgent()
    agent.upsert(originalPath, variantPath)

    when(capi.item(any[String], any[Edition])).thenAnswer((i: InvocationOnMock) =>
      defaults.item(i.getArgument[String](0), i.getArgument[Edition](1)),
    )
    respondWith(itemResponse)
    promoteNewsletter(None)
    when(
      renderer.getInteractive(
        any[WSClient],
        any[BlocksOn[InteractivePage]],
        any[PageType],
        any[Option[CustomSubnav]],
      )(any[RequestHeader]),
    ).thenReturn(Future.successful(Results.Ok("interactive")))
    when(
      renderer.getArticle(
        any[WSClient],
        any[BlocksOn[PageWithStoryPackage]],
        any[PageType],
        any[Option[NewsletterData]],
        any[Boolean],
        any[Option[CustomSubnav]],
      )(any[RequestHeader]),
    ).thenReturn(Future.successful(Results.Ok("article")))
    when(
      renderer.getAppsInteractive(any[WSClient], any[BlocksOn[InteractivePage]], any[PageType])(any[RequestHeader]),
    ).thenReturn(Future.successful(Results.Ok("apps")))
    when(
      renderer.getAppsArticle(
        any[WSClient],
        any[BlocksOn[PageWithStoryPackage]],
        any[PageType],
        any[Option[NewsletterData]],
        any[Boolean],
        any[Option[CustomSubnav]],
      )(any[RequestHeader]),
    ).thenReturn(Future.successful(Results.Ok("apps")))

    def run(
        req: RequestHeader = variantRequest(),
        articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage] = identity,
        interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
    ): Future[Result] =
      render(capi, renderer, agent, newsletters, originalPath, articleModifier, interactiveModifier)(req)

    // CAPI returns these successful responses in order, e.g. an unsupported variant followed by the original.
    def respondWith(first: ItemResponse, following: ItemResponse*): Unit = {
      when(capi.getResponse(any[ItemQuery])).thenReturn(
        Future.successful(first),
        following.map(response => Future.successful(response)): _*,
      )
    }

    def failLookup(error: Throwable): Unit =
      when(capi.getResponse(any[ItemQuery])).thenReturn(Future.failed(error))

    def promoteNewsletter(newsletter: Option[NewsletterData]): Unit =
      when(newsletters.getNewsletterForArticle(any[ArticlePage])).thenReturn(newsletter)

    def failArticleRendering(error: Throwable): Unit = {
      when(
        renderer.getArticle(
          any[WSClient],
          any[BlocksOn[PageWithStoryPackage]],
          any[PageType],
          any[Option[NewsletterData]],
          any[Boolean],
          any[Option[CustomSubnav]],
        )(any[RequestHeader]),
      ).thenReturn(Future.failed(error))
    }

    def verifyLookups(expected: ItemQuery*): Unit = {
      val captured = ArgumentCaptor.forClass(classOf[ItemQuery])
      verify(capi, times(expected.size)).getResponse(captured.capture())
      // ItemQuery has no structural equality. Compare the complete queries, in order.
      captured.getAllValues.asScala.map(_.toString).toSeq shouldBe expected.map(_.toString)
    }

    def verifyVariantNewsletterLookup(): Unit = {
      val captured = ArgumentCaptor.forClass(classOf[ArticlePage])
      verify(newsletters).getNewsletterForArticle(captured.capture())
      captured.getValue.metadata.id shouldBe variantCanonicalPath
      captured.getValue.article.content.fields.body shouldBe "<p>Variant B</p>"
    }

    def renderedNewsletter: Option[NewsletterData] = {
      val captured = ArgumentCaptor.forClass(classOf[Option[NewsletterData]])
      verify(renderer).getArticle(
        any[WSClient],
        any[BlocksOn[PageWithStoryPackage]],
        any[PageType],
        captured.capture(),
        any[Boolean],
        any[Option[CustomSubnav]],
      )(any[RequestHeader])
      captured.getValue
    }

    def renderedArticle: BlocksOn[PageWithStoryPackage] = {
      val captured = ArgumentCaptor.forClass(classOf[BlocksOn[PageWithStoryPackage]])
      verify(renderer).getArticle(
        any[WSClient],
        captured.capture(),
        any[PageType],
        any[Option[NewsletterData]],
        any[Boolean],
        any[Option[CustomSubnav]],
      )(any[RequestHeader])
      captured.getValue
    }

    def renderedInteractive: BlocksOn[InteractivePage] = {
      val captured = ArgumentCaptor.forClass(classOf[BlocksOn[InteractivePage]])
      verify(renderer).getInteractive(
        any[WSClient],
        captured.capture(),
        any[PageType],
        any[Option[CustomSubnav]],
      )(any[RequestHeader])
      captured.getValue
    }
  }

  private def response(id: String, title: String, contentType: ApiContentType): ItemResponse = {
    val typeName = contentType.toString.toLowerCase
    ItemResponse(
      status = "ok",
      userTier = "top_tier",
      total = None,
      startIndex = None,
      pageSize = None,
      currentPage = None,
      pages = None,
      orderBy = None,
      content = Some(
        ApiContent(
          id = id,
          `type` = contentType,
          sectionId = Some("lifeandstyle"),
          sectionName = Some("Life and style"),
          webPublicationDate = Some(OffsetDateTime.parse("2026-11-23T00:00:00Z").toCapiDateTime),
          webTitle = title,
          webUrl = s"https://www.theguardian.com/$id",
          apiUrl = s"https://content.guardianapis.com/$id",
          elements = None,
          fields = Some(ContentFields(headline = Some(title), body = Some(s"<p>$title</p>"))),
          tags = List(
            Tag(
              id = s"type/$typeName",
              `type` = TagType.Type,
              webTitle = typeName,
              webUrl = s"https://www.theguardian.com/$typeName",
              apiUrl = s"https://content.guardianapis.com/type/$typeName",
            ),
          ),
        ),
      ),
      tag = None,
      edition = None,
      section = None,
      results = Some(Nil),
      quiz = None,
      relatedContent = Some(Nil),
      storyPackage = Some(Nil),
      editorsPicks = Some(Nil),
      mostViewed = Some(Nil),
      leadContent = Some(Nil),
      packages = Some(Nil),
      viewpoints = Some(Nil),
    )
  }
}
