package views.support.cleaner

import java.io.UnsupportedEncodingException
import java.net.URLDecoder

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import model.{Article, Content}
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import org.scalatest.{FlatSpec, Matchers}
import org.apache.commons.lang.StringEscapeUtils

import scala.collection.JavaConversions._


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
  val commentAvatarClass = "d2-avatar"
  val commentAvatarSrc = "https://avatar.guim.co.uk/user/15301515"
  val commentAvatarHeight = "40"
  val commentAvatarWidth = "40"
  val commentAvatarAlt = "User avatar for fooBar"


  val contentApi = ApiContent(
    id = "foo/2012/jan/07/bar",
    webTitle = "Some article",
    webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar"
  )


  private def clean(document: Document): Document = {
    val cleaner = AmpEmbedCleaner(article())
    cleaner.clean(document)
    document
  }

  private def article() = {
    val contentApiItem = contentApi
    val content = Content.make(contentApiItem)
    Article.make(content)
  }

  private def cleanDocumentWithVideos(elementType: String, videoUrls: String*): Document = {
    val doc = <html>
      <body>
        {
        videoUrls.map { url: String => <figure class={elementType} data-canonical-url={url}>
          <iframe></iframe>
        </figure>
        }
        }
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    clean(document)
  }

  private def cleanDocumentWithAudioEmbed(elementType: String, frameborder: String, width: String, height: String, src: String): Document = {
    val srcString = if(src.nonEmpty) s"src='$src' " else ""
    val widthString = if(width.nonEmpty) s"width='$width' " else ""
    val heightString = if(height.nonEmpty) s"height='$height' " else ""
    val frameBorderString = if(frameborder.nonEmpty) s"frameborder='$frameborder' " else ""
    val iframe = s"""<iframe ${srcString + widthString + heightString + frameBorderString}></iframe>"""

    val doc = <html>
      <body>
        <figure class={elementType}>
          {iframe}
        </figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    clean(document)
  }

  private def cleanDocumentWithMapsEmbed(elementType: String, src: String): Document = {

    val iframe = if(src.nonEmpty) s"<iframe src='$src'></iframe>" else ""

    val doc = <html>
      <body>
        <figure class={elementType}>
          {iframe}
        </figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    clean(document)
  }

  private def cleanDocumentWithCommentEmbed(className: String, src: String, width: String, height: String, alt: String): Document = {
    val classString = if(className.nonEmpty) s"class='$className' " else ""
    val srcString = if(src.nonEmpty) s"src='$src' " else ""
    val widthString = if(width.nonEmpty) s"width='$width' " else ""
    val heightString = if(height.nonEmpty) s"height='$height' " else ""
    val altString = if(alt.nonEmpty) s"alt='$alt' " else ""
    val avatarImage = "<img " + classString + srcString + heightString + widthString + altString + ">"

    val doc = <html>
      <body>
        <figure class="element element-comment" data-canonical-url="https://discussion.theguardian.com/comment-permalink/88222201">
          <div class="d2-comment-embedded" itemtype="http://schema.org/Comment">
            <div class="d2-left-col">
              <a href="https://profile.theguardian.com/user/id/12345678">
                {avatarImage}
              </a>
            </div>
          </div>
        </figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    clean(document)
  }

  /*
 * The format we are using for the test data - while eminently readable - is treated as XML when toString() is run on it.
 * To parse it into a JSoup element, it is necessary to remove all the XML character encodings that have been introduced.
 */
  private def parseTestData(doc: String):Document = {
    Jsoup.parse(StringEscapeUtils.unescapeXml(doc))
  }


  /*
   * External video cleaner:
   */

  "AmpEmbedCleaner" should "replace an iframe in a http YouTube video-element with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("element-video", "http://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https YouTube video-element with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("element-video", "https://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-youtube").attr("data-videoid") should be("foo_12-34")
    result.getElementsByTag("amp-youtube").attr("width") should be("5")
    result.getElementsByTag("amp-youtube").attr("height") should be("3")
    result.getElementsByTag("amp-youtube").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake YouTube video-element with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("element-video",
      "http://www.youtube.com.de/watch?v=foo_12-34",
      "http://myyoutube.com/watch?v=foo_12-34",
      "https://www.youtuber.com/watch?v=foo_12-34"
    )
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-youtube element if videoid missing" in {
    val result = cleanDocumentWithVideos("element-video", "https://www.youtube.com/")
    result.getElementsByTag("amp-youtube").size should be(0)
  }

  "AmpEmbedCleaner" should "replace an iframe in a http Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("element-video", "http://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
  }

  "AmpEmbedCleaner" should "replace an iframe in a https Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("element-video", "https://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be(1)
    result.getElementsByTag("amp-vimeo").attr("data-videoid") should be("1234")
    result.getElementsByTag("amp-vimeo").attr("width") should be("5")
    result.getElementsByTag("amp-vimeo").attr("height") should be("3")
    result.getElementsByTag("amp-vimeo").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake Vimeo video-element with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("element-video",
      "https://vimeo.com.zz/1234",
      "https://vimeofake.com/1234",
      "https://myvimeo.com/1234"
    )
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-vimeo element if videoid missing" in {
    val result = cleanDocumentWithVideos("element-video", "https://vimeo.com/")
    result.getElementsByTag("amp-vimeo").size should be(0)
  }

  "AmpEmbedCleaner" should "replace a facebook video embed with a valid amp-facebook video embed" in {
    val faceookVideoId = "123456"
    val facebookVideoUrl = s"https://www.facebook.com/theguardian/videos/$faceookVideoId/"
    val result = cleanDocumentWithVideos("element-video", facebookVideoUrl)
    result.getElementsByTag("amp-facebook").size should be(1)
    result.getElementsByTag("amp-facebook").attr("data-href") should be(s"https://www.facebook.com/theguardian/videos/$faceookVideoId")
    result.getElementsByTag("amp-facebook").attr("data-embed-as") should be("video")
    result.getElementsByTag("amp-facebook").attr("width") should be("5")
    result.getElementsByTag("amp-facebook").attr("height") should be("3")
    result.getElementsByTag("amp-facebook").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "replace a facebook non-guardian video embed with a valid amp-facebook video embed" in {
    val facebookOrganisationId = "Channel4"
    val faceookVideoId = "10154084521542330"
    val facebookVideoUrl = s"https://www.facebook.com/$facebookOrganisationId/videos/$faceookVideoId/"
    val result = cleanDocumentWithVideos("element-video", facebookVideoUrl)
    result.getElementsByTag("amp-facebook").size should be(1)
    result.getElementsByTag("amp-facebook").attr("data-href") should be(s"https://www.facebook.com/$facebookOrganisationId/videos/$faceookVideoId")
    result.getElementsByTag("amp-facebook").attr("data-embed-as") should be("video")
    result.getElementsByTag("amp-facebook").attr("width") should be("5")
    result.getElementsByTag("amp-facebook").attr("height") should be("3")
    result.getElementsByTag("amp-facebook").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "replace a facebook non-guardian video embed, containing a '.' char in the username, with a valid amp-facebook video embed" in {
    val facebookOrganisationId = "Channel.4"
    val faceookVideoId = "10154084521542330"
    val facebookVideoUrl = s"https://www.facebook.com/$facebookOrganisationId/videos/$faceookVideoId/"
    val result = cleanDocumentWithVideos("element-video", facebookVideoUrl)
    result.getElementsByTag("amp-facebook").size should be(1)
  }

  "AmpEmbedCleaner" should "not replace an iframe in a fake Facebook video-element with an amp-facebook element" in {
    val result = cleanDocumentWithVideos("element-video",
      "https://www.facebook.com.zz/theguardian/123456/"
    )
    result.getElementsByTag("amp-facebook").size should be(0)
  }

  "AmpEmbedCleaner" should "not create an amp-facebook element if videoid missing" in {
    val result = cleanDocumentWithVideos("element-video", "https://www.facebook.com/theguardian/videos/")
    result.getElementsByTag("amp-facebook").size should be(0)
  }

  "AmpEmbedCleaner" should "be able to create an amp-youtube element, an amp-vimeo element and an amp facebook element in the same document" in {
    val result = cleanDocumentWithVideos("element-video",
      "https://www.youtube.com/watch?v=foo_12-34",
      "https://vimeo.com/1234",
      "https://www.facebook.com/theguardian/videos/123456/"
    )
    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-vimeo").size should be(1)
    result.getElementsByTag("amp-facebook").size should be(1)
  }


  /*
   * Interactive cleaner:
   */

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
    </html>.text
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


  /* Element-audio cleaner:
   *  Soundcloud embeds are turned into amp-soundcloud embeds.
   *  Other audio embeds become amp-iframe embeds.
   */

  "AmpEmbedCleaner" should "replace an iframe in an audio-element that has a src url from soundcloud.com, with an amp-soundcloud element" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", "", "", "", soundcloudUrlV2)
    result.getElementsByTag("amp-soundcloud").size should be(1)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from the iframe src that has a src url from soundcloud.com" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", "", "", "", soundcloudUrlV2)
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should " not create an amp-soundcloud element from an iframe src that does not have a track id even if the src uses the soundcloud url" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", "", "", "", soundcloudUrlNoTrackId)
    result.getElementsByTag("amp-soundcloud").size should be (0)
  }

  "AmpEmbedCleaner" should "add an amp-iframe element, not an amp-soundcloud element if an audio element contains an iframe with src url from that is not from soundcloud.com" in {
    val frameborder = "0"
    val width = "460"
    val height = "300"
    val src = audioBoomUrl
    val cleanDoc: Document = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, src)
    val result = (cleanDoc.getElementsByTag("amp-iframe").size, cleanDoc.getElementsByTag("amp-soundcloud").size)
    result should be ((1,0))
  }

  "AmpEmbedCleaner" should "create an amp-iframe element with a data-main-player-id from the iframe src from an audioboom embed" in {
    val frameborder = "0"
    val width = "460"
    val height = "300"
    val src = audioBoomUrl
    val result: Document = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, src)
    result.getElementsByTag("amp-iframe").first.attr("src") should be(audioBoomUrl)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a src attribute" in {
    val frameborder = "0"
    val width = "460"
    val height = "300"
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, height, "")
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a height attribute" in {
    val frameborder = "0"
    val width = "460"
    val src = audioBoomUrl
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, width, "", src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a width attribute" in {
    val frameborder = "0"
    val height = "300"
    val src = audioBoomUrl
    val result = cleanDocumentWithAudioEmbed("element-audio", frameborder, "", height, src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if the iframe does not have a frameborder attribute" in {
    val width = "460"
    val height = "300"
    val src = audioBoomUrl
    val result = cleanDocumentWithAudioEmbed("element-audio", "", width, height, src)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add an amp-soundcloud or amp-iframe element if an audio element does not contain an iframe at all" in {
    val doc = <html>
      <body>
        <figure class="element-audio"></figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    val cleanDoc: Document = clean(document)
    val result = (cleanDoc.getElementsByTag("amp-iframe").size, cleanDoc.getElementsByTag("amp-soundcloud").size)
    result should be ((0,0))
  }


  /*
  *  Maps cleaner
  */

  "AmpEmbedCleaner" should "replace an iframe in an map element with an amp-iframe element" in {
    val doc = <html>
      <body>
        <figure class="element-map">
          <iframe src={googleMapsUrl}></iframe>
        </figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    val result: Document = clean(document)
    result.getElementsByTag("amp-iframe").size should be(1)
    result.getElementsByTag("amp-iframe").first.attr("src") should be(googleMapsUrl)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element if an map element does not contain an iframe" in {
    val doc = <html>
      <body>
        <figure class="element-map"></figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    val result: Document = cleanDocumentWithMapsEmbed("element-map", "")
    result.getElementsByTag("amp-iframe").size should be(0)
  }


  /*
  * Comments cleaner
  */

  "AmpEmbedCleaner" should "change the avatar img in a comment to be an amp-img" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, commentAvatarSrc, commentAvatarHeight, commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("amp-img").size should be(1)
  }

  "AmpEmbedCleaner" should "not leave any img tags in the comment embed" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, commentAvatarSrc, commentAvatarHeight, commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the class attrib is missing" in {
    val result = cleanDocumentWithCommentEmbed("", commentAvatarSrc, commentAvatarHeight, commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the class is present, but not the expected name" in {
    val result = cleanDocumentWithCommentEmbed("foo", commentAvatarSrc, commentAvatarHeight, commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the src attrib is missing" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, "", commentAvatarHeight, commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the height attrib is missing" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, commentAvatarSrc, "", commentAvatarWidth, commentAvatarAlt)
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the width attrib is missing" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, commentAvatarSrc, commentAvatarHeight, "", commentAvatarAlt)
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }

  "AmpEmbedCleaner" should "remove the image if the alt attrib is missing" in {
    val result = cleanDocumentWithCommentEmbed(commentAvatarClass, commentAvatarSrc, commentAvatarHeight, commentAvatarWidth, "")
    result.getElementsByTag("amp-img").size + result.getElementsByTag("img").size should be(0)
  }



  /*
  * Element-embed cleaner:
  * Converts Soundcloud, Audioboom, Instagram, GoogleMaps and Eternal Video embeds.
  * Embeds that don't match any of these types others are removed.
  */

  "AmpEmbedCleaner" should "replace an iframe in an element that has a src url from soundcloud.com with an amp-soundcloud element" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", "", "", "", soundcloudUrlV2)
    result.getElementsByTag("amp-soundcloud").size should be(1)
  }

  "AmpEmbedCleaner" should "create an amp-soundcloud element with a trackid from an iframe src that contains a url from soundcloud.com" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", "", "", "", soundcloudUrlV1)
    result.getElementsByTag("amp-soundcloud").first.attr("data-trackid") should be(soundcloudTrackid.toString)
  }

  "AmpEmbedCleaner" should " not create an amp-soundcloud element from an iframe src that does not have a track id" in {
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", "", "", "", soundcloudUrlNoTrackId)
    result.getElementsByTag("amp-soundcloud").size should be (0)
    result.getElementsByTag("amp-iframe").size should be (0)
  }

  "AmpEmbedCleaner" should "not add any kind of amp element if an element-embed does not contain an iframe" in {
    val doc = <html>
      <body>
        <figure class="element-embed"></figure>
      </body>
    </html>.toString()
    val document: Document = parseTestData(doc)
    val result: Document = clean(document)
    result.getElementsByTag("iframe").size should be(0)
    result.getElementsByTag("amp-iframe").size should be(0)
    result.getElementsByTag("amp-soundcloud").size should be(0)
    result.getElementsByTag("amp-instagram").size should be(0)
    result.getElementsByTag("amp-youtube").size should be(0)
    result.getElementsByTag("amp-vimeo").size should be(0)
    result.getElementsByTag("amp-facebook").size should be(0)
  }

  "AmpEmbedCleaner" should "not add an amp-iframe element, if an element-embed contains an iframe with src url from any unknown src" in {
    val frameborder = "0"
    val width = "460"
    val height = "300"
    val src = "http://www.someotherurl.com/video/123"
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", frameborder, width, height, src)
    result.getElementsByTag("iframe").size should be (0)
    result.getElementsByTag("amp-iframe").size should be (0)
    result.getElementsByTag("amp-soundcloud").size should be (0)
    result.getElementsByTag("amp-instagram").size should be(0)
    result.getElementsByTag("amp-youtube").size should be(0)
    result.getElementsByTag("amp-vimeo").size should be(0)
    result.getElementsByTag("amp-facebook").size should be(0)
  }

  "AmpEmbedCleaner" should "add an amp-iframe element, if an element-embed contains an iframe with src url from audioboom.com" in {
    val frameborder = "0"
    val width = "460"
    val height = "300"
    val src = audioBoomUrl
    val result: Document = cleanDocumentWithAudioEmbed("element-embed", frameborder, width, height, src)
    result.getElementsByTag("amp-iframe").size should be (1)
    result.getElementsByTag("amp-iframe").first.attr("src") should be(audioBoomUrl)
  }

  "AmpEmbedCleaner" should "add an amp-instagram element, if an element-embed contains an iframe with a valid instagram src url " in {
    val document = <figure class="element element-embed">
      <div style="padding:8px;">
        <p style=" margin:8px 0 0 0; padding:0 4px;"> <a href="https://www.instagram.com/p/BB0CN8PMWdz/">Happy Presidents' Day! Mr presidents are on sale. Original $2.25 and littles $1. And Cin-Ful cinnamon rolls are $2!! #hurrybeforeitsgone</a></p>
      </div>
    </figure>.toString()

    val result = clean(parseTestData(document))
    val shortcode = "BB0CN8PMWdz"

    result.getElementsByTag("amp-instagram").size should be(1)
    result.getElementsByTag("amp-instagram").attr("width") should be ("7")
    result.getElementsByTag("amp-instagram").attr("height") should be ("8")
    result.getElementsByTag("amp-instagram").attr("layout") should be ("responsive")
    result.getElementsByTag("amp-instagram").attr("data-shortcode") should be (shortcode)
  }

  "AmpEmbedCleaner" should "add an amp-iframe element, if an element-embed contains an iframe with a valid google maps src url " in {
    val result: Document = cleanDocumentWithMapsEmbed("element-embed", googleMapsUrl)
    result.getElementsByTag("amp-iframe").size should be(1)
    result.getElementsByTag("amp-iframe").first.attr("src") should be (googleMapsUrl)
  }

  "AmpEmbedCleaner" should "replace an iframe an embed-element, that contains a YouTube video with an amp-youtube element" in {
    val result = cleanDocumentWithVideos("element-embed", "https://www.youtube.com/watch?v=foo_12-34")
    result.getElementsByTag("amp-youtube").size should be(1)
    result.getElementsByTag("amp-youtube").attr("data-videoid") should be("foo_12-34")
    result.getElementsByTag("amp-youtube").attr("width") should be("5")
    result.getElementsByTag("amp-youtube").attr("height") should be("3")
    result.getElementsByTag("amp-youtube").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "replace an iframe an embed-element, that contains a Vimeo video with an amp-vimeo element" in {
    val result = cleanDocumentWithVideos("element-embed", "https://vimeo.com/1234")
    result.getElementsByTag("amp-vimeo").size should be (1)
    result.getElementsByTag("amp-vimeo").attr("data-videoid") should be("1234")
    result.getElementsByTag("amp-vimeo").attr("width") should be("5")
    result.getElementsByTag("amp-vimeo").attr("height") should be("3")
    result.getElementsByTag("amp-vimeo").attr("layout") should be("responsive")
  }

  "AmpEmbedCleaner" should "replace an iframe an embed-element, that contains a Facebook video with an amp-facebook element" in {
    val faceookVideoId = "123456"
    val facebookVideoUrl = s"https://www.facebook.com/theguardian/videos/$faceookVideoId/"
    val result = cleanDocumentWithVideos("element-embed", facebookVideoUrl)
    result.getElementsByTag("amp-facebook").size should be(1)
    result.getElementsByTag("amp-facebook").attr("data-href") should be(s"https://www.facebook.com/theguardian/videos/$faceookVideoId")
    result.getElementsByTag("amp-facebook").attr("data-embed-as") should be("video")
    result.getElementsByTag("amp-facebook").attr("width") should be("5")
    result.getElementsByTag("amp-facebook").attr("height") should be("3")
    result.getElementsByTag("amp-facebook").attr("layout") should be("responsive")
  }



}
