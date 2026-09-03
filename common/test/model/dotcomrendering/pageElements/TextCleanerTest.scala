package model

import com.gu.contentapi.client.model.v1.TagType.Keyword
import com.gu.contentapi.client.model.v1.{Tag => ApiTag}
import common.editions
import common.editions.Uk
import conf.Configuration
import model.dotcomrendering.pageElements.{TagLinker, TextBlockElement, TextCleaner}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import services.SkimLinksCache
import views.support.AffiliateLinksCleaner

class TextCleanerTest extends AnyFlatSpec with Matchers {

  val host = Configuration.site.host

  "TagLinker" should "match tags in a para" in {
    val examples = List(
      "the Champions League is great!" -> Some("Champions League"),
      "What do you think about the Champions League?" -> Some("Champions League"),
      "What do you think about the Champions?" -> None,
    )

    val re = TagLinker.keywordRegex("Champions League")

    examples.foreach({ case (example, want) =>
      val got = re.findFirstMatchIn(example).map(_.group("tag"))
      got shouldBe want
    })
  }

  "Add link" should "link tags in a text block element and return linked terms" in {
    val examples = List(
      TextBlockElement("the Champions League is great!") ->
        (
          TextBlockElement(
            s"""the <a href="${host}/championsleague" data-component="auto-linked-tag">Champions League</a> is great!""",
          ),
          Set("Champions League"),
        ),
      TextBlockElement("What do you think about the Champions?") ->
        (TextBlockElement("What do you think about the Champions?"), Set.empty),
    )

    val tag = Tag(
      TagProperties.make(
        ApiTag(
          id = "championsleague",
          `type` = Keyword,
          sectionId = Some("football"),
          webTitle = "Champions League",
          webUrl = "/football/championsleague",
          apiUrl = "example",
        ),
      ),
      None,
      None,
    )

    examples.foreach({ case (example, want) =>
      val got = TagLinker.addLink(
        tags = Tags(List(tag)),
        showInRelated = true,
        el = example,
        terms = Set.empty,
        edition = editions.Uk,
      )

      got shouldBe want
    })
  }

  "tagLinks" should "link only first occurrence of a tag within paragraph" in {
    val elements = List(
      TextBlockElement("Champions League first. Champions League second."),
    )

    val want = List(
      TextBlockElement(
        s"""<a href="${host}/championsleague" data-component="auto-linked-tag">Champions League</a> first. Champions League second.""",
      ),
    )

    val tag = Tag(
      TagProperties.make(
        ApiTag(
          id = "championsleague",
          `type` = Keyword,
          sectionId = Some("football"),
          webTitle = "Champions League",
          webUrl = "/football/championsleague",
          apiUrl = "example",
        ),
      ),
      None,
      None,
    )

    val got = TextCleaner.tagLinks(
      els = elements,
      tags = Tags(List(tag)),
      showInRelated = true,
      edition = editions.Uk,
    )

    got shouldBe want
  }

  "tagLinks" should "link only first occurrence of a tag across multiple paragraphs" in {
    val elements = List(
      TextBlockElement("Champions League first"),
      TextBlockElement("Champions League repeat"),
    )

    val want = List(
      TextBlockElement(
        s"""<a href="${host}/championsleague" data-component="auto-linked-tag">Champions League</a> first""",
      ),
      TextBlockElement("Champions League repeat"),
    )

    val tag = Tag(
      TagProperties.make(
        ApiTag(
          id = "championsleague",
          `type` = Keyword,
          sectionId = Some("football"),
          webTitle = "Champions League",
          webUrl = "/football/championsleague",
          apiUrl = "example",
        ),
      ),
      None,
      None,
    )

    val got = TextCleaner.tagLinks(
      els = elements,
      tags = Tags(List(tag)),
      showInRelated = true,
      edition = editions.Uk,
    )

    got shouldBe want
  }

  "tagLinks" should "ignore paragraphs that already contain links" in {
    val elements = List(
      TextBlockElement("""Champions League tables <a href="example.com/checkitoutfoo">here</a>"""),
      TextBlockElement("Champions League repeat"),
    )

    val want = List(
      TextBlockElement("""Champions League tables <a href="example.com/checkitoutfoo">here</a>"""),
      TextBlockElement(
        s"""<a href="${host}/championsleague" data-component="auto-linked-tag">Champions League</a> repeat""",
      ),
    )

    val tag = Tag(
      TagProperties.make(
        ApiTag(
          id = "championsleague",
          `type` = Keyword,
          sectionId = Some("football"),
          webTitle = "Champions League",
          webUrl = "/football/championsleague",
          apiUrl = "example",
        ),
      ),
      None,
      None,
    )

    val got = TextCleaner.tagLinks(
      els = elements,
      tags = Tags(List(tag)),
      showInRelated = true,
      edition = editions.Uk,
    )

    got shouldBe want
  }

  "sanitiseLinks" should "update internal links" in {

    val got = TextCleaner.sanitiseLinks(Uk)(
      """<p>This is a paragraph with <a href="https://www.theguardian.com/help">a link</a></p>""",
    )

    val want = s"""<p>This is a paragraph with <a href="${host}/help">a link</a></p>"""

    got shouldBe want
  }

  "sanitiseLinks" should "editionalise some internal links" in {
    val got = TextCleaner.sanitiseLinks(Uk)(
      """<p>This is a paragraph with <a href="https://www.theguardian.com">a link to the UK network front</a></p>""",
    )

    val want = s"""<p>This is a paragraph with <a href="${host}/uk">a link to the UK network front</a></p>"""

    got shouldBe want
  }

  "sanitiseLinks" should "not update external links" in {
    val original = """<p>This is a paragraph with <a href="example.com">a link</a></p>"""

    val got = TextCleaner.sanitiseLinks(Uk)(original)

    got shouldBe original
  }

  "rewriteAffiliateLinks" should "rewrite affiliateable links in an image caption to skimlinks" in {
    SkimLinksCache.setDomains(Set("amazon.co.uk"))
    try {
      val pageUrl = "/money/2025/nov/19/test-article"
      val productUrl = "https://www.amazon.co.uk/product/123"
      val caption = s"""Photo of <a href="$productUrl">the thing</a>. Photograph: Someone"""

      val got = TextCleaner.rewriteAffiliateLinks(caption, pageUrl, "123", Map.empty)

      // Jsoup serialises '&' in attribute values as '&amp;'
      val expectedHref =
        AffiliateLinksCleaner.linkToSkimLink(productUrl, pageUrl, "123", Map.empty).replace("&", "&amp;")
      got should include("https://go.skimresources.com/")
      got should include(s"""href="$expectedHref"""")
      got should include("""rel="sponsored noreferrer noopener"""")
      got should include("Photograph: Someone")
    } finally {
      SkimLinksCache.setDomains(Set.empty)
    }
  }

  it should "return the caption unchanged when it has no affiliateable links" in {
    SkimLinksCache.setDomains(Set("amazon.co.uk"))
    try {
      val caption = """Photo of <a href="https://www.theguardian.com/help">something</a>. Photograph: Someone"""

      val got = TextCleaner.rewriteAffiliateLinks(caption, "/money/2025/nov/19/test-article", "123", Map.empty)

      got should be theSameInstanceAs caption
    } finally {
      SkimLinksCache.setDomains(Set.empty)
    }
  }

  "affiliateLinks" should "return the html unchanged when affiliate links are not to be added" in {
    val caption = """Photo of <a href="https://www.amazon.co.uk/product/123">the thing</a>"""

    val got = TextCleaner.affiliateLinks("/money/2025/nov/19/test-article", false, false, Map.empty)(caption)

    got should be theSameInstanceAs caption
  }
}
