package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class AmpEmbedCleanerTest extends FlatSpec with Matchers {

  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

 "AmpEmbedCleaner" should "replace an iframe in an audio-element with an amp-soundcloud element" in {
   val soundcloudUrl = "http://www.soundcloud.com/%2Ftracks%2F1234"
   val doc = s"""<html><body><figure class="element-audio"><iframe src="$soundcloudUrl"></iframe></figure></body></html>"""
   val document: Document = Jsoup.parse(doc)
   val result: Document = clean(document)

   result.getElementsByTag("amp-soundcloud").size should be(1)
 }

  "AmpEmbedCleaner" should "not add a amp-soundcloud element if an audio element does not contain an iframe" in {
    val doc = s"""<html><body><figure class="element-audio"></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-soundcloud").size should be(0)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from the iframe src" in {
    val trackId = "1234"
    val soundcloudUrl = s"http://www.soundcloud.com/%2Ftracks%2F$trackId"
    val doc = s"""<html><body><figure class="element-audio"><iframe src="$soundcloudUrl"></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(trackId)
  }

  private def article() = {
    val contentApiItem = contentApi()
    val content = Content.make(contentApiItem)

    Article.make(content)
  }

  private def contentApi() = ApiContent(
    id = "foo/2012/jan/07/bar",
    webTitle = "Some article",
    webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar"
  )
}
