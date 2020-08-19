package common

import com.gu.contentapi.client.model.v1.{TagType, Tag => ApiTag }
import common.editions.Uk
import conf.Configuration
import model.{Tag, TagProperties, Tags}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.test.FakeRequest
import views.support.TagLinker

import scala.collection.JavaConverters._

class TagLinkerTest extends FlatSpec with Matchers with GuiceOneAppPerSuite {

  implicit val edition = Uk
  implicit val request = FakeRequest("GET", "/")

  private implicit class Document2FirstPara(d: Document) {
    val firstPara = d.select("p").asScala.head.html
  }

  val tagLinker = TagLinker(Tags(List(tag("sport/cycling", "Cycling"))), true)

  "TagLinker" should "link tag at the start of the paragraph" in {
    val cleaned = tagLinker.clean(souped("""<p>Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be (s"""<a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag in the middle of the paragraph" in {
    val cleaned = tagLinker.clean(souped("""<p>After the change in law, Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be (s"""After the change in law, <a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag at the end of the paragraph" in {
    val cleaned = tagLinker.clean(souped("""<p>After all that Cycling.</p>"""))
    cleaned.firstPara should be (s"""After all that <a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>.""")
  }

  it should "link if followed by a comma" in {
    val cleaned = tagLinker.clean(souped("""<p>Show up to Cycling, it won't hurt.</p>"""))
    cleaned.firstPara should be (s"""Show up to <a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>, it won't hurt.""")
  }

  it should "link if followed by a question mark" in {
    val cleaned = tagLinker.clean(souped("""<p>Who knows about Cycling?</p>"""))
    cleaned.firstPara should be (s"""Who knows about <a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling</a>?""")
  }

  it should "not link as part of another word" in {
    val cleaned = tagLinker.clean(souped("""<p>Who knows what Anti-Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling-Patterns are?.""")
  }

  it should "not link as start of another word" in {
    val cleaned = tagLinker.clean(souped("""<p>Who knows what Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Cycling-Patterns are?.""")
  }

  it should "not link as end of another word" in {
    val cleaned = tagLinker.clean(souped("""<p>Who knows what Anti-Cycling is?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling is?.""")
  }

  it should "escape the tag name" in {
    val cleaned = TagLinker(Tags(List(tag("sport/cycling", "Cycling?."))), true).clean(souped(
      """<p>Help with the Cycling?.</p>"""))
    cleaned.firstPara should be (s"""Help with the <a href="${Configuration.site.host}/sport/cycling" data-link-name="auto-linked-tag" data-component="auto-linked-tag" class="u-underline">Cycling?.</a>""")
  }

  it should "not link tags in an article pullquote" in {
    val cleaned = tagLinker.clean(souped("""<aside class="element-pullquote"><p>Cycling is an awesome sport.</p></aside>"""))
    cleaned.firstPara should be ("""Cycling is an awesome sport.""")
  }

  it should "not link tags in articles that should be excluded from related content" in {
    val cleaned = TagLinker(Tags(List(tag("sport/cycling", "Cycling"))), false).clean(souped("""<p>Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""Cycling is an awesome sport.""")
  }

  it should "not blow up if there are 'regex' characters in the tag names" in {
    val cleaned = TagLinker(Tags(List(tag("music/asap-rocky", "A$AP Rocky"))), true).clean(souped("""<p>such as Harlem rapper A$AP Rocky</p>"""))
    cleaned.firstPara should be ("such as Harlem rapper A$AP Rocky")
  }

  private[this] def tag(id: String, name: String): Tag = {
    val apiTag = ApiTag(id, TagType.Keyword, webTitle = name, webUrl = "does not matter",
      apiUrl = "does not matter", sectionId = Some("does not matter"))

    Tag(
      properties = TagProperties.make(apiTag),
      pagination = None,
      richLinkId = None
    )
  }

  private def souped(s: String) = Jsoup.parseBodyFragment(s)
}
