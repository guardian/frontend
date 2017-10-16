package common

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{ContentFields, TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import common.editions.Uk
import implicits.Dates.jodaToJavaInstant
import model.{Article, Content}
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.test.FakeRequest
import views.support.TagLinker

import scala.collection.JavaConversions._

class TagLinkerTest extends FlatSpec with Matchers with GuiceOneAppPerSuite {

  implicit val edition = Uk
  implicit val request = FakeRequest("GET", "/")

  private implicit class Document2FirstPara(d: Document) {
    val firstPara = d.select("p").head.html
  }

  "TagLinker" should "link tag at the start of the paragraph" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""<a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag in the middle of the paragraph" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>After the change in law, Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""After the change in law, <a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag at the end of the paragraph" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>After all that Cycling.</p>"""))
    cleaned.firstPara should be ("""After all that <a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>.""")
  }

  it should "link if followed by a comma" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Show up to Cycling, it won't hurt.</p>"""))
    cleaned.firstPara should be ("""Show up to <a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>, it won't hurt.""")
  }

  it should "link if followed by a question mark" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows about Cycling?</p>"""))
    cleaned.firstPara should be ("""Who knows about <a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>?""")
  }

  it should "not link as part of another word" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Anti-Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling-Patterns are?.""")
  }

  it should "not link as start of another word" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Cycling-Patterns are?.""")
  }

  it should "not link as end of another word" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Anti-Cycling is?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling is?.""")
  }

  it should "escape the tag name" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling?."))).clean(souped(
      """<p>Help with the Cycling?.</p>"""))
    cleaned.firstPara should be ("""Help with the <a href="/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling?.</a>""")
  }

  it should "not link tags in an article pullquote" in {
    val cleaned = TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<aside class="element-pullquote"><p>Cycling is an awesome sport.</p></aside>"""))
    cleaned.firstPara should be ("""Cycling is an awesome sport.""")
  }

  it should "not link tags in articles that should be excluded from related content" in {
    val cleaned = TagLinker(sensitiveArticle(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""Cycling is an awesome sport.""")
  }

  it should "not blow up if there are 'regex' characters in the tag names" in {
    val cleaned = TagLinker(article(tag("music/asap-rocky", "A$AP Rocky"))).clean(souped("""<p>such as Harlem rapper A$AP Rocky</p>"""))
    cleaned.firstPara should be ("such as Harlem rapper A$AP Rocky")
  }

  private def tag(id: String, name: String) = ApiTag(id, TagType.Keyword, webTitle = name, webUrl = "does not matter",
    apiUrl = "does not matter", sectionId = Some("does not matter"))

  private def sensitiveArticle(tags: ApiTag*) = {
    val contentApiItem = contentApi(tags.toList).copy(fields = Some(ContentFields(showInRelatedContent = Some(false))))

    val content = Content.make(contentApiItem)
    Article.make(content)
  }

  private def contentApi(tags: List[ApiTag]) = ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some((jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)).toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      elements = None,
      tags = tags,
      fields = Some(ContentFields(showInRelatedContent = Some(true)))
  )

  private def article(tags: ApiTag*) = {
    val contentApiItem = contentApi(tags.toList)

    val content = Content.make(contentApiItem)
    Article.make(content)
  }

  private def souped(s: String) = Jsoup.parseBodyFragment(s)
}
