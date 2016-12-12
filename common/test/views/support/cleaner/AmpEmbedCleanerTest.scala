package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class AmpEmbedCleanerTest extends FlatSpec with Matchers {

  val googleMapsUrl = "https://www.google.com/maps/embed/v1/place?center=-3.9834936%2C12.7024497&key=AIzaSyBctFF2JCjitURssT91Am-_ZWMzRaYBm4Q&zoom=5&q=Democratic+Republic+of+the+Congo"

  val dataInteractiveIframeWrapper = "http://foo.bar/iframe-wrapper/foo/bar"
  val dataInteractiveNoIframeWrapper = "http://foo.bar/foo/bar"


  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

  private def documentWithVideos(videoUrls: String*): Document = {
    val doc = "<html><body>" +
      videoUrls.map{ url: String => s"""<figure class="element-video" data-canonical-url="$url"><iframe></iframe></figure>""" }.mkString +
      "</body></html>"
    val document: Document = Jsoup.parse(doc)
    clean(document)
  }

  /////////////////////////////
  // External video cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in a http YouTube video-element with an amp-youtube element" in {
    val result = documentWithVideos("http://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https YouTube video-element with an amp-youtube element" in {
    val result = documentWithVideos("https://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake YouTube video-element with an amp-vimeo element" in {
    val result = documentWithVideos(
      "http://www.youtube.com.de/watch?v=foo_12-34",
      "http://myyoutube.com/watch?v=foo_12-34",
      "https://www.youtuber.com/watch?v=foo_12-34"
    )
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-youtube element if videoid missing" in {
    val result = documentWithVideos("https://www.youtube.com/")
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "replace an iframe in a http Vimeo video-element with an amp-vimeo element" in {
    val result = documentWithVideos("http://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https Vimeo video-element with an amp-vimeo element" in {
    val result = documentWithVideos("https://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake Vimeo video-element with an amp-vimeo element" in {
    val result = documentWithVideos(
      "https://vimeo.com.zz/1234",
      "https://vimeofake.com/1234",
      "https://myvimeo.com/1234"
    )
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-vimeo element if videoid missing" in {
    val result = documentWithVideos("https://vimeo.com/")
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "be able to create an amp-youtube element and an amp-vimeo in the same document" in {
    val result = documentWithVideos(
      "https://www.youtube.com/watch?v=foo_12-34",
      "https://vimeo.com/1234"
    )
    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-vimeo").size should be(1)
  }


  /////////////////////////////
  // Interactive cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "create an amp-iframe element if interactive has a valid url and iframe wrapper" in {
    val interactiveValidUrlPlusiFrameWrapper =
          <html><body>
            <figure class="element element-interactive interactive"
                    data-interactive={dataInteractiveIframeWrapper}
                    data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                    data-alt="Site of plane crash in Colombia">
              <a href="https://myinteractive.url/some/stuff" data-link-name="in body link" class="u-underline"> Interactive name</a>
            </figure>
          </body></html>.toString
    val result = clean(Jsoup.parse(interactiveValidUrlPlusiFrameWrapper))
    result.getElementsByTag("amp-iframe").size should be(1)
  }

  "AmpEmbedCleaner" should "not create an amp-iframe element if interactive only has an iframe wrapper" in {
    val interactiveSansUrl =
          <html><body>
            <figure class="element element-interactive interactive"
                    data-interactive={dataInteractiveIframeWrapper}
                    data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                    data-alt="Site of plane crash in Colombia">
            </figure>
          </body></html>.toString
    val result = clean(Jsoup.parse(interactiveSansUrl))
    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-iframe element if interactive does not have an iframe wrapper" in {
    val interactiveSansiFrameWrapper =
          <html><body>
            <figure class="element element-interactive interactive"
                    data-interactive={dataInteractiveNoIframeWrapper}
                    data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                    data-alt="Site of plane crash in Colombia">
              <a href="https://myinteractive.url/some/stuff" data-link-name="in body link" class="u-underline">Interactive name</a>
            </figure>
          </body></html>.toString
    val result = clean(Jsoup.parse(interactiveSansiFrameWrapper))
    result.getElementsByTag("amp-iframe").size should be(0)
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
