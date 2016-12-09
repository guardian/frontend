package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class AmpEmbedCleanerTest extends FlatSpec with Matchers {

  val audioBoomTrackid = 2990345
  val audioBoomUrl = s"https://audioboom.com/boos/${audioBoomTrackid.toString}-counter-terrorism-radio-advert-encourages-mothers-to-talk-to-their-daughters-about-travelling-to-syria/embed/v3?eid=AQAAAOmxBlUJoS0A"
  val audioBoomUrlSansTrackid = s"https://audioboom.com/boos/foo-counter-terrorism-radio-advert-encourages-mothers-to-talk-to-their-daughters-about-travelling-to-syria/embed/v3?eid=AQAAAOmxBlUJoS0A"
  val dataInteractiveIframeWrapper = "http://foo.bar/iframe-wrapper/foo/bar"
  val dataInteractiveNoIframeWrapper = "http://foo.bar/foo/bar"
  val googleMapsUrl = "https://www.google.com/maps/embed/v1/place?center=-3.9834936%2C12.7024497&key=AIzaSyBctFF2JCjitURssT91Am-_ZWMzRaYBm4Q&zoom=5&q=Democratic+Republic+of+the+Congo"
  val soundcloudTrackid = 1234
  val soundcloudUrlV1 = "http://api.soundcloud.com%2Ftracks%2F1234"
  val soundcloudUrlV2 = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234"


  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

  private def documentWithVideos(videoUrls: String*): Document = {
    val doc = <html>
                  <body>
                     {
                        videoUrls.map
                        { url: String =>  <figure class="element-video" data-canonical-url={url}>
                                                  <iframe></iframe>
                                          </figure>
                        }
                     }
                  </body>
              </html>.toString()
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
    val interactiveValidUrlPlusiFrameWrapper = <html>
                                                  <body>
                                                    <figure class="element element-interactive interactive"
                                                            data-interactive={dataInteractiveIframeWrapper}
                                                            data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                                                            data-alt="Site of plane crash in Colombia">
                                                      <a href="https://myinteractive.url/some/stuff" data-link-name="in body link" class="u-underline"> Interactive name</a>
                                                    </figure>
                                                  </body>
                                               </html>.toString()
    val result = clean(Jsoup.parse(interactiveValidUrlPlusiFrameWrapper))
    result.getElementsByTag("amp-iframe").size should be(1)
  }

  "AmpEmbedCleaner" should "not create an amp-iframe element if interactive only has an iframe wrapper" in {
    val interactiveSansUrl = <html>
                                  <body>
                                        <figure class="element element-interactive interactive"
                                                data-interactive={dataInteractiveIframeWrapper}
                                                data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                                                data-alt="Site of plane crash in Colombia">
                                        </figure>
                                  </body>
                                  </html>.toString()
    val result = clean(Jsoup.parse(interactiveSansUrl))
    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-iframe element if interactive does not have an iframe wrapper" in {
    val interactiveSansiFrameWrapper = <html>
                                          <body>
                                            <figure class="element element-interactive interactive"
                                                    data-interactive={dataInteractiveNoIframeWrapper}
                                                    data-canonical-url="https://interactive.guim.co.uk/maps/embed/nov/2016-11-29T06:47:36.html"
                                                    data-alt="Site of plane crash in Colombia">
                                              <a href="https://myinteractive.url/some/stuff" data-link-name="in body link" class="u-underline">Interactive name</a>
                                            </figure>
                                          </body>
                                        </html>.toString()
    val result = clean(Jsoup.parse(interactiveSansiFrameWrapper))
    result.getElementsByTag("amp-iframe").size should be(0)
  }




  /////////////////////////////
  // Soundcloud cleaner
  // Note: There are two formats of src url that have been encountered, testing has been adapted to check both of these
  //        formats
  /////////////////////////////

 "AmpEmbedCleaner" should "replace an iframe in an audio-element that has a src url from soundcloud.com which matches the first pattern, with an amp-soundcloud element" in {
   val doc = <html>
                <body>
                  <figure class="element-audio">
                    <iframe src={soundcloudUrlV1}></iframe>
                  </figure>
                </body>
             </html>.toString()
   val document: Document = Jsoup.parse(doc)
   val result: Document = clean(document)
   result.getElementsByTag("amp-soundcloud").size should be(1)
 }

  "AmpEmbedCleaner" should "replace an iframe in an audio-element that has a src url from soundcloud.com which matches the second pattern, with an amp-soundcloud element" in {
    val doc = <html>
      <body>
        <figure class="element-audio">
          <iframe src={soundcloudUrlV2}></iframe>
        </figure>
      </body>
    </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").size should be(1)
  }

  "AmpEmbedCleaner" should "not add a amp-soundcloud element if an audio element does not contain an iframe with src url from soundcloud.com" in {
    val doc = <html>
                <body>
                  <figure class="element-audio">
                    <iframe src={audioBoomUrl}></iframe>
                  </figure>
                </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").size should be(0)
  }

  "AmpEmbedCleaner" should "not add a amp-soundcloud element if an audio element does not contain an iframe" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio"></figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").size should be(0)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from an iframe src that matches the first pattern" in {
    val doc = <html>
                <body>
                  <figure class="element-audio">
                    <iframe src={soundcloudUrlV1}></iframe>
                  </figure>
                </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from the iframe src that matches the second pattern" in {
    val doc = <html>
      <body>
        <figure class="element-embed">
          <iframe src={soundcloudUrlV2}></iframe>
        </figure>
      </body>
    </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should "not create an amp-soundcloud element if trackid missing from iframe src" in {
    val soundcloudUrl = s"http://www.soundcloud.com/"
    val doc = <html>
                  <body>
                    <figure class="element-audio">
                      <iframe src="$soundcloudUrl"></iframe>
                    </figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").size should be(0)
  }



  /////////////////////////////
  // Audio Embed cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in an audio-element that is not a soundcloud embed with an amp-iframe element" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio">
                      <iframe frameborder="0" width="460" height="300" src={audioBoomUrl}></iframe>
                    </figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(1)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if an audio embed contains an iframe with src url from soundcloud" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio">
                      <iframe src={soundcloudUrlV1}></iframe>
                    </figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if an audio element does not contain an iframe" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio"></figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "create an amp-iframe element with a data-main-player-id from the iframe src from an audioboom embed" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio">
                      <iframe frameborder="0" width="460" height="300" src={audioBoomUrl}></iframe>
                    </figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").first.attr("src") should be(audioBoomUrl)
  }



  /////////////////////////////
  // Maps cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in an map element with an amp-iframe element" in {
    val doc = <html>
                  <body>
                    <figure class="element-map">
                      <iframe src={googleMapsUrl}></iframe>
                    </figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(1)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if an map element does not contain an iframe" in {
    val doc = <html>
                  <body>
                    <figure class="element-map"></figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(0)
  }

  "AmpEmbedCleaner" should "create an amp-iframe element with an iframe from the iframe src" in {
    val doc = <html>
                  <body>
                    <figure class="element-map">
                      <iframe src={googleMapsUrl}></iframe>
                    </figure>
                  </body>
              </html>.toString()
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
