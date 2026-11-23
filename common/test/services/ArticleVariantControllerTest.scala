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
import model.{ArticlePage, InteractivePage, PageWithStoryPackage}
import model.dotcomrendering.PageType
import model.meta.BlocksOn
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.{times, verify, verifyNoInteractions, when}
import org.mockito.invocation.InvocationOnMock
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.http.HttpEntity
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.test.Helpers._
import renderers.DotcomRenderingService
import test.{TestRequest, WithTestApplicationContext}

import java.time.OffsetDateTime
import scala.concurrent.Future
import scala.jdk.CollectionConverters._

/** Runs the same contract against both production controller entry points without network calls. */
abstract class ArticleVariantControllerTest
    extends AnyFlatSpec
    with Matchers
    with MockitoSugar
    with WithTestApplicationContext {
  protected def originalType: String
  protected def render(
      capi: ContentApiClient,
      renderer: DotcomRenderingService,
      agent: ArticleAbTestAgent,
      newsletters: NewsletterService,
      path: String,
      articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage],
      interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage],
  )(implicit request: RequestHeader): Future[Result]

  private def originalPath =
    s"lifeandstyle/${if (originalType == "interactive") "ng-interactive/" else ""}2026/nov/23/original"
  private val variantPath = "p/variant"
  private val variantCanonicalPath = "lifeandstyle/2026/nov/23/variant"
  private val defaults = new ApiQueryDefaults {}
  private val promotedNewsletter = NewsletterData(
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

  private def response(id: String, title: String, contentType: String): ItemResponse = ItemResponse(
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
        `type` = if (contentType == "interactive") ApiContentType.Interactive else ApiContentType.Article,
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
            id = s"type/$contentType",
            `type` = TagType.Type,
            webTitle = contentType,
            webUrl = s"https://www.theguardian.com/$contentType",
            apiUrl = s"https://content.guardianapis.com/type/$contentType",
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

  private def withEditorialTests(test: => Unit): Unit = {
    val saved = Seq(EditorialABTests, EditorialArticleABTests).map(s => s -> s.isSwitchedOn)
    try {
      saved.foreach { case (s, _) => s.switchOn() }
      test
    } finally {
      saved.foreach { case (s, wasOn) => if (wasOn) s.switchOn() else s.switchOff() }
    }
  }

  private def request(participation: String = "fronts-and-curation-editorial-test:b", suffix: String = "") = {
    val raw = TestRequest(s"/$originalPath$suffix").withHeaders(
      "X-Gu-Edition" -> "UK",
      "X-GU-Server-AB-Tests" -> participation,
    )
    raw.withAttrs(ABTests.decorateRequest("X-GU-Server-AB-Tests")(raw).attrs)
  }

  private class Fixture(itemResponse: ItemResponse) {
    val capi = mock[ContentApiClient]
    val renderer = mock[DotcomRenderingService]
    val newsletters = mock[NewsletterService]
    val agent = new MockArticleAbTestAgent()
    agent.upsert(originalPath, variantPath)

    when(capi.item(any[String], any[Edition])).thenAnswer((i: InvocationOnMock) =>
      defaults.item(i.getArgument[String](0), i.getArgument[Edition](1)),
    )
    when(capi.getResponse(any[ItemQuery])).thenReturn(Future.successful(itemResponse))
    when(newsletters.getNewsletterForArticle(any[ArticlePage])).thenReturn(None)
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
      renderer.getAppsInteractive(
        any[WSClient],
        any[BlocksOn[InteractivePage]],
        any[PageType],
      )(any[RequestHeader]),
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
        req: RequestHeader = request(),
        articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage] = identity,
        interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
    ): Future[Result] =
      render(capi, renderer, agent, newsletters, originalPath, articleModifier, interactiveModifier)(req)

    def verifyLookups(expected: (String, Boolean)*): Unit = {
      val captured = ArgumentCaptor.forClass(classOf[ItemQuery])
      verify(capi, times(expected.size)).getResponse(captured.capture())
      val queries = expected.map { case (path, variant) =>
        val query = defaults
          .item(path, Edition.defaultEdition)
          .showTags("all")
          .showFields("all")
          .showReferences("all")
          .showAtoms("all")
          .showSchemaOrg(true)
          .showBlocks("all")
        (if (variant) query.withChannelId("variant") else query).toString
      }
      // ItemQuery does not implement structural equality.
      captured.getAllValues.asScala.map(_.toString).toSeq shouldBe queries
    }

    def verifyNewsletterLookup(expectedId: String): Unit = {
      val captured = ArgumentCaptor.forClass(classOf[ArticlePage])
      verify(newsletters).getNewsletterForArticle(captured.capture())
      captured.getValue.metadata.id shouldBe expectedId
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

  "Editorial variants" should "preserve normal canonical redirects outside the B bucket" in withEditorialTests {
    val f = new Fixture(response(variantCanonicalPath, "Moved", originalType))
    val result = f.run(request("fronts-and-curation-editorial-test:a"))
    status(result) shouldBe FOUND
    header(LOCATION, result) shouldBe Some(s"/$variantCanonicalPath")
    verifyNoInteractions(f.renderer)
  }

  Seq("article", "interactive").foreach { variantType =>
    it should s"render a $variantType B using its own renderer and A's identity" in withEditorialTests {
      val f = new Fixture(response(variantCanonicalPath, "Variant B", variantType))
      val result = f.run()
      status(result) shouldBe OK
      header(LOCATION, result) shouldBe None
      header("X-Accel-Redirect", result) shouldBe None
      f.verifyLookups(variantPath -> true)
      val content =
        if (variantType == "article") f.renderedArticle.page.article.content
        else f.renderedInteractive.page.interactive.content
      content.fields.body shouldBe "<p>Variant B</p>"
      content.metadata.id shouldBe originalPath
      content.metadata.url shouldBe s"/$originalPath"
      content.metadata.webUrl shouldBe s"${Configuration.site.host}/$originalPath"
      content.metadata.canonicalUrl shouldBe Some(s"${Configuration.site.host}/$originalPath")
      content.metadata.contentType shouldBe Some(
        if (variantType == "article") model.DotcomContentType.Article else model.DotcomContentType.Interactive,
      )
      if (variantType == "article") f.verifyNewsletterLookup(variantCanonicalPath)
      else verifyNoInteractions(f.newsletters)
    }

    it should s"apply only the $variantType preview modifier after identity masking" in withEditorialTests {
      val f = new Fixture(response(variantCanonicalPath, "Variant B", variantType))
      val result = f.run(
        articleModifier = page => {
          variantType shouldBe "article"
          page.page.metadata.id shouldBe originalPath
          page.copy(blocks = page.blocks.copy(body = Some(Nil)))
        },
        interactiveModifier = page => {
          variantType shouldBe "interactive"
          page.page.metadata.id shouldBe originalPath
          page.copy(blocks = page.blocks.copy(body = Some(Nil)))
        },
      )
      status(result) shouldBe OK
      val blocks = if (variantType == "article") f.renderedArticle.blocks else f.renderedInteractive.blocks
      blocks.body shouldBe Some(Nil)
    }

    it should s"serialize a $variantType variant with the original page identity" in withEditorialTests {
      val f = new Fixture(response(variantCanonicalPath, "Variant B", variantType))
      val result = f.run(request(suffix = ".json?dcr"))
      status(result) shouldBe OK
      val json = await(result).body match {
        case HttpEntity.Strict(data, _) => Json.parse(data.utf8String)
        case _                          => fail("Expected a strict JSON response")
      }
      (json \ "pageId").as[String] shouldBe originalPath
      (json \ "headline").as[String] shouldBe "Variant B"
      (json \ "contentType").as[String].toLowerCase shouldBe variantType
      (json \ "promotedNewsletter").toOption shouldBe None
      f.verifyLookups(variantPath -> true)
      verifyNoInteractions(f.renderer)
      if (variantType == "article") f.verifyNewsletterLookup(variantCanonicalPath)
      else verifyNoInteractions(f.newsletters)
    }
  }

  Seq("fronts-and-curation-editorial-test:a", "", "other-test:b").foreach { participation =>
    it should s"use the original content for participation '$participation'" in withEditorialTests {
      val f = new Fixture(response(originalPath, "Original A", originalType))
      status(f.run(request(participation))) shouldBe OK
      f.verifyLookups(originalPath -> false)
    }
  }

  Seq(EditorialABTests, EditorialArticleABTests).foreach { switch =>
    it should s"use the original content when ${switch.name} is disabled" in withEditorialTests {
      switch.switchOff()
      val f = new Fixture(response(originalPath, "Original A", originalType))
      status(f.run()) shouldBe OK
      f.verifyLookups(originalPath -> false)
    }
  }

  it should "use the original content when no test is configured" in withEditorialTests {
    val f = new Fixture(response(originalPath, "Original A", originalType))
    f.agent.remove(originalPath)
    status(f.run()) shouldBe OK
    f.verifyLookups(originalPath -> false)
  }

  it should "exclude apps from variant selection" in withEditorialTests {
    val f = new Fixture(response(originalPath, "Original A", originalType))
    status(f.run(request(suffix = "?dcr=apps"))) shouldBe OK
    f.verifyLookups(originalPath -> false)
  }

  Seq(false, true).foreach { missing =>
    it should s"fall back once to A without the variant channel when B is ${if (missing) "missing" else "unsupported"}" in withEditorialTests {
      val unsupported = response(variantCanonicalPath, "Unsupported", "video")
      val f = new Fixture(if (missing) unsupported.copy(content = None) else unsupported)
      when(f.capi.getResponse(any[ItemQuery])).thenReturn(
        Future.successful(if (missing) unsupported.copy(content = None) else unsupported),
        Future.successful(response(originalPath, "Original A", originalType)),
      )
      status(f.run()) shouldBe OK
      f.verifyLookups(variantPath -> true, originalPath -> false)
      val content =
        if (originalType == "article") f.renderedArticle.page.article.content
        else f.renderedInteractive.page.interactive.content
      content.fields.body shouldBe "<p>Original A</p>"
    }
  }

  Seq("?dcr=false", "?dcr=apps", ".json?dcr=apps", "?format=email").foreach { suffix =>
    it should s"exclude unsupported variant request format '$suffix'" in {
      ArticleVariantRenderer.supportsRequest(request(suffix = suffix)) shouldBe false
    }
  }

  Seq(None, Some(promotedNewsletter)).foreach { newsletter =>
    it should s"pass the variant's promoted newsletter to HTML rendering: ${newsletter.isDefined}" in withEditorialTests {
      val f = new Fixture(response(variantCanonicalPath, "Variant B", "article"))
      when(f.newsletters.getNewsletterForArticle(any[ArticlePage])).thenReturn(newsletter)
      status(f.run()) shouldBe OK
      f.verifyNewsletterLookup(variantCanonicalPath)
      f.renderedNewsletter shouldBe newsletter
      f.renderedArticle.page.metadata.id shouldBe originalPath
    }

    it should s"serialize the variant's promoted newsletter in JSON: ${newsletter.isDefined}" in withEditorialTests {
      val f = new Fixture(response(variantCanonicalPath, "Variant B", "article"))
      when(f.newsletters.getNewsletterForArticle(any[ArticlePage])).thenReturn(newsletter)
      val result = f.run(request(suffix = ".json?dcr"))
      status(result) shouldBe OK
      val json = await(result).body match {
        case HttpEntity.Strict(data, _) => Json.parse(data.utf8String)
        case _                          => fail("Expected a strict JSON response")
      }
      (json \ "promotedNewsletter").asOpt[NewsletterData] shouldBe newsletter
      (json \ "pageId").as[String] shouldBe originalPath
      f.verifyNewsletterLookup(variantCanonicalPath)
    }
  }
}
