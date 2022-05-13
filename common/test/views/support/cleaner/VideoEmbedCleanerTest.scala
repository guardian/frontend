package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class VideoEmbedCleanerTest extends AnyFlatSpec with Matchers {

  val contentApi = ApiContent(
    id = "foo/2012/jan/07/bar",
    webTitle = "Some article",
    webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
  )

  val article = {
    val contentApiItem = contentApi
    val content = Content.make(contentApiItem)
    Article.make(content)
  }

  def clean(doc: String): Document = {
    val document: Document = Jsoup.parse(doc)
    val result: Document = VideoEmbedCleaner(article, 600).clean(document)
    result
  }

  private def getStyle(styleString: String, property: String): String = {
    val style = raw"${property}:\s*([^;]*)".r

    val embeddedStyle = style.unanchored

    styleString match {
      case embeddedStyle(value) => value
      case default              => ""
    }
  }

  "VideoEmbedCleaner" should "correctly sets max width" in {
    val doc =
      s"""<html><body><figure class="element-video"><iframe src="test" height="800" width="400"></iframe></figure></body></html>"""
    val result = clean(doc)

    val alignerStyleString = result.getElementsByClass("u-responsive-aligner").attr("style")
    val maxWidth = getStyle(alignerStyleString, "max-width")

    val wrapperStyleString = result.getElementsByClass("embed-video-wrapper").attr("style")
    val paddingBottom = getStyle(wrapperStyleString, "padding-bottom")

    // values will always be a float
    maxWidth should be("300.0px")
    paddingBottom should be("200.0%")
  }

  "VideoEmbedCleaner" should "handles iframe with missing width and height" in {
    val doc = s"""<html><body><figure class="element-video"><iframe src="test")></iframe></figure></body></html>"""
    val result = clean(doc)
    val responsiveElements = result.getElementsByClass("u-responsive-ratio--hd")
    responsiveElements.size should be(1)
  }

  "VideoEmbedCleaner" should "work without an iframe in the embed" in {
    val doc =
      s"""<html><body><figure class="element-video"><div class="some-other-embed"><script>alert('hi');</script></div></figure></body></html>"""
    val result = clean(doc)
    val responsiveElements = result.getElementsByClass("u-responsive-ratio--hd")
    responsiveElements.size should be(1)
  }

}
