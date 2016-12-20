package views.support.cleaner

import java.net.URLDecoder

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
  val soundcloudTrackid = "1234"
  val soundcloudUrlV1 = "http://api.soundcloud.com%2Ftracks%2F1234"
  val soundcloudUrlV2 = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234"
  val soundcloudUrlNoTrackId = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/foobar"


  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

  //html format replaces some special characters with XMLp
  private def tidyUrlString(urlString: String): String = {
    urlString.replace("&amp;", "&").replace("&quot;", "\"").replace("&apos;","'").replace("&lt;", "<").replace("&gt;", ">")
  }

  private def cleanDocumentWithVideos(videoUrls: String*): Document = {
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
    val document: Document = Jsoup.parse(tidyUrlString(doc))
    clean(document)
  }


  private def cleanDocumentWithAudioEmbed(elementType: String, frameborder: Option[String], width: Option[String], height: Option[String], src: Option[String]): Document = {
    val srcString = if(src.nonEmpty){s"""src=\"${src.get}\" """}else{""}
    val widthString = if(width.nonEmpty){s"""width=\"${width.get}\" """}else{""}
    val heightString = if(height.nonEmpty){s"""height=\"${height.get}\" """}else{""}
    val frameBorderString = if(frameborder.nonEmpty){s"""frameborder=\"${frameborder.get}\" """}else{""}
    val iframe = s"""<iframe ${srcString + widthString + heightString + frameBorderString}></iframe>"""

    val doc = <html>
      <body>
        <figure class={elementType}>
          {iframe.toString}
        </figure>
      </body>
    </html>.toString()
    val document: Document = Jsoup.parse(tidyUrlString(doc))
    clean(document)
  }

  /////////////////////////////
  // External video cleaner
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in a http YouTube video-element with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("http://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https YouTube video-element with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("https://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake YouTube video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos(
      "http://www.youtube.com.de/watch?v=foo_12-34",
      "http://myyoutube.com/watch?v=foo_12-34",
      "https://www.youtuber.com/watch?v=foo_12-34"
    )
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-youtube element if videoid missing" in {
    val result = cleanDocumentWithVideos("https://www.youtube.com/")
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "replace an iframe in a http Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("http://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("https://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos(
      "https://vimeo.com.zz/1234",
      "https://vimeofake.com/1234",
      "https://myvimeo.com/1234"
    )
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-vimeo element if videoid missing" in {
    val result = cleanDocumentWithVideos("https://vimeo.com/")
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "be able to create an amp-youtube element and an amp-vimeo in the same document" in {
    val result = cleanDocumentWithVideos(
      "https://www.youtube.com/watch?v=foo_12-34",
      "https://vimeo.com/1234"
    )
    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-vimeo").size should be(1)
  }


  /////////////////////////////
  // Interactive cleaner
  /////////////////////////////
  //todo - can you turn interactie html into a method?
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
  // Element-audio cleaner
  // Soundcloud embeds are turned into amp-soundcould embeds. Other audio embeds become amp-iframe embeds
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in an audio-element that has a src url from soundcloud.com, with an amp-soundcloud element" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", None, None, None, Option(soundcloudUrlV2))
    result.getElementsByTag("amp-soundcloud").size should be(1)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from the iframe src that has a src url from soundcloud.com" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", None, None, None, Option(soundcloudUrlV2))
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should " not create an amp-soundcloud element from an iframe src fro soundcloud.com that does not have a track id" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", None, None, None, Option(soundcloudUrlNoTrackId))
    result.getElementsByTag("amp-soundcloud").size should be (0)
  }

  "AmpEmbedCleaner" should "add an amp-iframe element, not an amp-soundcloud element if an audio element contains an iframe with src url from that is not from soundcloud.com" in {
    val frameborder = Option("0")
    val width = Option("460")
    val height = Option("300")
    val src = Option(audioBoomUrl)
    val cleanDoc: Document = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, src)
    val result = (cleanDoc.getElementsByTag("amp-iframe").size, cleanDoc.getElementsByTag("amp-soundcloud").size)
    result should be ((1,0))
  }

  "AmpEmbedCleaner" should "create an amp-iframe element with a data-main-player-id from the iframe src from an audioboom embed" in {
    val frameborder = Option("0")
    val width = Option("460")
    val height = Option("300")
    val src = Option(audioBoomUrl)
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, src)
    result.getElementsByTag("amp-iframe").first.attr("src") should be(audioBoomUrl)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a src attribute" in {
    val frameborder = Option("0")
    val width = Option("460")
    val height = Option("300")
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, None)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a height attribute" in {
    val frameborder = Option("0")
    val width = Option("460")
    val src = Option(audioBoomUrl)
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, None, src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a width attribute" in {
    val frameborder = Option("0")
    val height = Option("300")
    val src = Option(audioBoomUrl)
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, None, height, src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a frameborder attribute" in {
    val width = Option("460")
    val height = Option("300")
    val src = Option(audioBoomUrl)
    val result = cleanDocumentWithAudioEmbed("element-audio", None, width, height, src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-soundcloud or amp-iframe element if an audio element does not contain an iframe at all" in {
    val doc = <html>
      <body>
        <figure class="element-audio"></figure>
      </body>
    </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val cleanDoc: Document = clean(document)
    val result = (cleanDoc.getElementsByTag("amp-iframe").size, cleanDoc.getElementsByTag("amp-soundcloud").size)
    result should be ((0,0))
  }


  /////////////////////////////
  // Element-embed cleaner
  // Only soundcloud elements should be converted. All other element-embed's should be removed
  /////////////////////////////

  "AmpEmbedCleaner" should "replace an iframe in an audio-element that has a src url from soundcloud.com with an amp-soundcloud element" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", None, None, None, Option(soundcloudUrlV2))
    result.getElementsByTag("amp-soundcloud").size should be(1)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from an iframe src tht contains a url from soundcloud.com" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", None, None, None, Option(soundcloudUrlV1))
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should " not create an amp-soundcloud element from an iframe src that does not have a track id" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", None, None, None, Option(soundcloudUrlNoTrackId))
    result.getElementsByTag("amp-soundcloud").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe or amp-soundcloud element, if an audio element contains an iframe with src url from that is not from soundcloud.com" in {
    val frameborder = Option("0")
    val width = Option("460")
    val height = Option("300")
    val src = Option(audioBoomUrl)
    val cleanDoc: Document = cleanDocumentWithAudioEmbed("element-embed", frameborder, width, height, src)
    val result = (cleanDoc.getElementsByTag("amp-iframe").size, cleanDoc.getElementsByTag("amp-soundcloud").size)
    result should be ((0,0))
  }

  "AmpEmbedCleaner" should "not add an amp-soundcloud element if an audio element does not contain an iframe" in {
    val doc = <html>
                  <body>
                    <figure class="element-audio"></figure>
                  </body>
              </html>.toString()
    val document: Document = Jsoup.parse(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-soundcloud").size should be(0)
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
