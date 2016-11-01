package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class AmpEmbedCleanerTest extends FlatSpec with Matchers {

  val googleMapsUrl = "https://www.google.com/maps/embed/v1/place?center=-3.9834936%2C12.7024497&key=AIzaSyBctFF2JCjitURssT91Am-_ZWMzRaYBm4Q&zoom=5&q=Democratic+Republic+of+the+Congo"

  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

  /////////////////////////////
  // External video cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in a YouTube video-element with an amp-youtube element" in {
    val youtubeUrl = "https://www.youtube.com/watch?v=foo_12-34"
    val doc = s"""<html><body><figure class="element-video" data-canonical-url="$youtubeUrl"><iframe></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "not create an amp-youtube element if videoid missing" in {
    val youtubeUrl = s"http://www.youtube.com/"
    val doc = s"""<html><body><figure class="element-video" data-canonical-url="$youtubeUrl"><iframe></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "replace an iframe in a Vimeo video-element with an amp-vimeo element" in {
    val vimeoUrl = "https://vimeo.com/1234"
    val doc = s"""<html><body><figure class="element-video" data-canonical-url="$vimeoUrl"><iframe></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "not create an amp-vimeo element if videoid missing" in {
    val vimeoUrl = s"http://vimeo.com/"
    val doc = s"""<html><body><figure class="element-video" data-canonical-url="$vimeoUrl"><iframe></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "be able to create an amp-youtube element and an amp-vimeo in the same document" in {
    val youtubeUrl = "https://www.youtube.com/watch?v=foo_12-34"
    val vimeoUrl = "https://vimeo.com/1234"
    val doc = s"""<html><body><figure class="element-video" data-canonical-url="$youtubeUrl"><iframe></iframe></figure><figure class="element-video" data-canonical-url="$vimeoUrl"><iframe></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  /////////////////////////////
  // Soundcloud cleaner
  /////////////////////////////

 "AmpEmbedCleaner" should "replace an iframe in an audio-element with an amp-soundcloud element" in {
   val soundcloudUrl = "http://www.soundcloud.com%2Ftracks%2F1234"
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
    val soundcloudUrl = s"https://www.soundcloud.com%2Ftracks%2F$trackId"
    val doc = s"""<html><body><figure class="element-audio"><iframe src="$soundcloudUrl"></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(trackId)
  }

  "AmpEmbedCleaner" should "not create an amp-soundcloud element if trackid missing from iframe src" in {
    val soundcloudUrl = s"http://www.soundcloud.com/"
    val doc = s"""<html><body><figure class="element-audio"><iframe src="$soundcloudUrl"></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-soundcloud").size should be(0)
  }

  /////////////////////////////
  // Maps cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in an map element with an amp-iframe element" in {
    val doc = s"""<html><body><figure class="element-map"><iframe src="$googleMapsUrl"></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-iframe").size should be(1)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if an map element does not contain an iframe" in {
    val doc = s"""<html><body><figure class="element-map"></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "create an amp-iframe element with an iframe from the iframe src" in {
    val doc = s"""<html><body><figure class="element-map"><iframe src="$googleMapsUrl"></iframe></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)

    result.getElementsByTag("amp-iframe").first.attr("src") should be(googleMapsUrl)
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
