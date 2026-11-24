package services

import com.gu.contentapi.client.model.ContentApiError
import conf.switches.Switches.{EditorialABTests, EditorialArticleABTests}
import model.DotcomContentType
import org.mockito.Mockito.verifyNoInteractions
import play.api.test.Helpers._

import java.util.concurrent.TimeoutException

/** Each scenario runs against both real controller entry points, using the same test data and mocks. */
abstract class ArticleVariantControllerTest extends ArticleVariantTestHelper {

  // Choosing the original article

  "The A article" should "keep its normal canonical redirect for readers in bucket A" in withEditorialTests {
    val fixture = new Fixture(originalResponse(canonicalPath = variantCanonicalPath))

    val result = fixture.run(originalRequest)

    status(result) shouldBe FOUND
    header(LOCATION, result) shouldBe Some(s"/$variantCanonicalPath")
    verifyNoInteractions(fixture.renderer)
  }

  Seq("fronts-and-curation-editorial-test:a", "", "other-test:b").foreach { participation =>
    it should s"be fetched normally for participation '$participation'" in withEditorialTests {
      val fixture = new Fixture(originalResponse())

      val result = fixture.run(request(participation = participation))

      status(result) shouldBe OK
      fixture.verifyLookups(originalLookup)
    }
  }

  Seq(EditorialABTests, EditorialArticleABTests).foreach { switch =>
    it should s"be fetched normally when ${switch.name} is disabled" in withEditorialTests {
      switch.switchOff()
      val fixture = new Fixture(originalResponse())

      val result = fixture.run()

      status(result) shouldBe OK
      fixture.verifyLookups(originalLookup)
    }
  }

  it should "be fetched normally when no variant is configured" in withEditorialTests {
    val fixture = new Fixture(originalResponse())
    fixture.agent.remove(originalPath)

    val result = fixture.run()

    status(result) shouldBe OK
    fixture.verifyLookups(originalLookup)
  }

  it should "be fetched normally for apps" in withEditorialTests {
    val fixture = new Fixture(originalResponse())

    val result = fixture.run(variantRequest(suffix = "?dcr=apps"))

    status(result) shouldBe OK
    fixture.verifyLookups(originalLookup)
  }

  it should "be fetched normally when its configured variant points back to itself" in withEditorialTests {
    val fixture = new Fixture(originalResponse())
    fixture.agent.upsert(originalPath, originalPath)

    val result = fixture.run()

    status(result) shouldBe OK
    fixture.verifyLookups(originalLookup)
  }

  // Article variants

  "An article variant" should "use the article renderer with the original page's identity" in withEditorialTests {
    val fixture = new Fixture(articleVariant)

    val result = fixture.run()

    status(result) shouldBe OK
    header(LOCATION, result) shouldBe None
    header("X-Accel-Redirect", result) shouldBe None
    fixture.verifyLookups(variantLookup)
    assertVariantIdentity(fixture.renderedArticle.page.article.content)
    fixture.renderedArticle.page.article.content.metadata.contentType shouldBe Some(DotcomContentType.Article)
    fixture.verifyVariantNewsletterLookup()
  }

  it should "apply only the article modifier, after masking the page identity" in withEditorialTests {
    val fixture = new Fixture(articleVariant)

    val result = fixture.run(
      articleModifier = page => {
        page.page.metadata.id shouldBe originalPath
        page.copy(blocks = page.blocks.copy(body = Some(Nil)))
      },
      interactiveModifier = _ => fail("An article variant must not use the interactive modifier"),
    )

    status(result) shouldBe OK
    fixture.renderedArticle.blocks.body shouldBe Some(Nil)
  }

  it should "produce article JSON with the original page's identity" in withEditorialTests {
    val fixture = new Fixture(articleVariant)

    val result = fixture.run(variantRequest(suffix = ".json?dcr"))

    status(result) shouldBe OK
    val json = strictJson(result)
    (json \ "pageId").as[String] shouldBe originalPath
    (json \ "headline").as[String] shouldBe "Variant B"
    (json \ "contentType").as[String].toLowerCase shouldBe "article"
    (json \ "promotedNewsletter").toOption shouldBe None
    fixture.verifyLookups(variantLookup)
    fixture.verifyVariantNewsletterLookup()
    verifyNoInteractions(fixture.renderer)
  }

  Seq("without a newsletter" -> None, "with a newsletter" -> Some(promotedNewsletter)).foreach {
    case (description, newsletter) =>
      it should s"pass the variant's newsletter to HTML rendering: $description" in withEditorialTests {
        val fixture = new Fixture(articleVariant)
        fixture.promoteNewsletter(newsletter)

        val result = fixture.run()

        status(result) shouldBe OK
        fixture.verifyVariantNewsletterLookup()
        fixture.renderedNewsletter shouldBe newsletter
        fixture.renderedArticle.page.metadata.id shouldBe originalPath
      }

      it should s"include the variant's newsletter in JSON: $description" in withEditorialTests {
        val fixture = new Fixture(articleVariant)
        fixture.promoteNewsletter(newsletter)

        val result = fixture.run(variantRequest(suffix = ".json?dcr"))

        status(result) shouldBe OK
        val json = strictJson(result)
        (json \ "promotedNewsletter").asOpt[NewsletterData] shouldBe newsletter
        (json \ "pageId").as[String] shouldBe originalPath
        fixture.verifyVariantNewsletterLookup()
      }
  }

  // Interactive variants

  "An interactive variant" should "use the interactive renderer with the original page's identity" in withEditorialTests {
    val fixture = new Fixture(interactiveVariant)

    val result = fixture.run()

    status(result) shouldBe OK
    header(LOCATION, result) shouldBe None
    header("X-Accel-Redirect", result) shouldBe None
    fixture.verifyLookups(variantLookup)
    assertVariantIdentity(fixture.renderedInteractive.page.interactive.content)
    fixture.renderedInteractive.page.interactive.content.metadata.contentType shouldBe Some(
      DotcomContentType.Interactive,
    )
    verifyNoInteractions(fixture.newsletters)
  }

  it should "apply only the interactive modifier, after masking the page identity" in withEditorialTests {
    val fixture = new Fixture(interactiveVariant)

    val result = fixture.run(
      articleModifier = _ => fail("An interactive variant must not use the article modifier"),
      interactiveModifier = page => {
        page.page.metadata.id shouldBe originalPath
        page.copy(blocks = page.blocks.copy(body = Some(Nil)))
      },
    )

    status(result) shouldBe OK
    fixture.renderedInteractive.blocks.body shouldBe Some(Nil)
  }

  it should "produce interactive JSON with the original page's identity" in withEditorialTests {
    val fixture = new Fixture(interactiveVariant)

    val result = fixture.run(variantRequest(suffix = ".json?dcr"))

    status(result) shouldBe OK
    val json = strictJson(result)
    (json \ "pageId").as[String] shouldBe originalPath
    (json \ "headline").as[String] shouldBe "Variant B"
    (json \ "contentType").as[String].toLowerCase shouldBe "interactive"
    (json \ "promotedNewsletter").toOption shouldBe None
    fixture.verifyLookups(variantLookup)
    verifyNoInteractions(fixture.renderer, fixture.newsletters)
  }

  // Falling back means the variant was fetched successfully but cannot be rendered.

  "Variant fallback" should "fetch the original once when the variant is an unsupported content type of liveblog" in withEditorialTests {
    val fixture = new Fixture()
    fixture.respondWith(unsupportedVariant, originalResponse())

    val result = fixture.run()

    status(result) shouldBe OK
    fixture.verifyLookups(variantLookup, originalLookup)
    renderedOriginalContent(fixture).fields.body shouldBe "<p>Original A</p>"
  }

  it should "fetch the original once when the variant response contains no content" in withEditorialTests {
    val fixture = new Fixture()
    fixture.respondWith(missingVariant, originalResponse())

    val result = fixture.run()

    status(result) shouldBe OK
    fixture.verifyLookups(variantLookup, originalLookup)
    renderedOriginalContent(fixture).fields.body shouldBe "<p>Original A</p>"
  }

  it should "return an uncached 500 if the original modifier fails during fallback" in withEditorialTests {
    val fixture = new Fixture()
    fixture.respondWith(unsupportedVariant, originalResponse())
    val error = new RuntimeException("Original modifier failed")

    // The controller runs only the modifier matching its original content type.
    val result = fixture.run(articleModifier = _ => throw error, interactiveModifier = _ => throw error)

    status(result) shouldBe INTERNAL_SERVER_ERROR
    header(CACHE_CONTROL, result) shouldBe Some("private, no-store, no-cache")
    fixture.verifyLookups(variantLookup, originalLookup)
    verifyNoInteractions(fixture.renderer)
  }

  // Failed lookups and renders return errors; they do not trigger fallback.

  Seq(
    ("a CAPI 404", ContentApiError(404, "Variant not found", None), NOT_FOUND),
    ("a CAPI 410", ContentApiError(410, "Variant gone", None), GONE),
    ("a timeout", new TimeoutException("Variant lookup timed out"), GATEWAY_TIMEOUT),
    ("an unexpected error", new RuntimeException("Variant lookup failed"), INTERNAL_SERVER_ERROR),
  ).foreach { case (failure, error, expectedStatus) =>
    "Variant lookup failures" should s"return $expectedStatus for $failure, without fetching the original" in withEditorialTests {
      val fixture = new Fixture()
      fixture.failLookup(error)

      val result = fixture.run()

      status(result) shouldBe expectedStatus
      header(CACHE_CONTROL, result) shouldBe Some("private, no-store, no-cache")
      fixture.verifyLookups(variantLookup)
      verifyNoInteractions(fixture.renderer)
    }
  }

  "Variant rendering failures" should "return an uncached 500 without fetching the original" in withEditorialTests {
    val fixture = new Fixture(articleVariant)
    fixture.failArticleRendering(new RuntimeException("Variant render failed"))

    val result = fixture.run()

    status(result) shouldBe INTERNAL_SERVER_ERROR
    header(CACHE_CONTROL, result) shouldBe Some("private, no-store, no-cache")
    fixture.verifyLookups(variantLookup)
  }

  Seq("?dcr=false", "?dcr=apps", ".json?dcr=apps", "?format=email").foreach { suffix =>
    "Variant request eligibility" should s"exclude '$suffix'" in {
      ArticleVariantRenderer.supportsRequest(variantRequest(suffix)) shouldBe false
    }
  }
}
