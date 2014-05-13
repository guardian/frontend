package common

import org.jsoup.Jsoup
import org.scalatest.{Matchers, FlatSpec}
import com.gu.openplatform.contentapi.model.{Tag => ApiTag, Content => ApiContent}
import model.{ApiContentWithMeta, Article}
import views.support.TagLinker
import org.joda.time.DateTime
import common.editions.Uk
import scala.collection.JavaConversions._
import org.jsoup.nodes.Document

class TagLinkerTest extends FlatSpec with Matchers {

  implicit val edition = Uk

  private implicit class Document2FirstPara(d: Document) {
    val firstPara = d.select("p").head.html
  }

  "TagLinker" should "link tag at the start of the paragraph" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""<a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag in the middle of the paragraph" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>After the change in law, Cycling is an awesome sport.</p>"""))
    cleaned.firstPara should be ("""After the change in law, <a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling</a> is an awesome sport.""")
  }

  it should "link tag at the end of the paragraph" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>After all that Cycling.</p>"""))
    cleaned.firstPara should be ("""After all that <a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling</a>.""")
  }

  it should "link if followed by a comma" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Show up to Cycling, it won't hurt.</p>"""))
    cleaned.firstPara should be ("""Show up to <a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling</a>, it won't hurt.""")
  }

  it should "link if followed by a question mark" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows about Cycling?</p>"""))
    cleaned.firstPara should be ("""Who knows about <a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling</a>?""")
  }

  it should "not link as part of another word" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Anti-Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling-Patterns are?.""")
  }

  it should "not link as start of another word" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Cycling-Patterns are?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Cycling-Patterns are?.""")
  }

  it should "not link as end of another word" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling"))).clean(souped("""<p>Who knows what Anti-Cycling is?.</p>"""))
    cleaned.firstPara should be ("""Who knows what Anti-Cycling is?.""")
  }

  it should "escape the tag name" in {
    val cleaned = new TagLinker(article(tag("sport/cycling", "Cycling?."))).clean(souped(
      """<p>Help with the Cycling?.</p>"""))
    cleaned.firstPara should be ("""Help with the <a href="/sport/cycling" data-link-name="auto-linked-tag" class=" u-underline">Cycling?.</a>""")
  }

  private def tag(id: String, name: String) = new ApiTag(id, "keyword", webTitle = name, webUrl = "does not matter",
    apiUrl = "does not matter", sectionId = Some("does not matter"))

  private def article(tags: ApiTag*) = new Article(ApiContentWithMeta(ApiContent("foo/2012/jan/07/bar", None, None,
    new DateTime, "Some article",
    "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    "http://content.guardianapis.com/foo/2012/jan/07/bar",
    elements = None,
    tags = tags.toList
  )))

  private def souped(s: String) = Jsoup.parseBodyFragment(s)
}