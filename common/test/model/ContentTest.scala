package model

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{Content => ApiContent, Element => ApiElement, Tag => ApiTag, _}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import model.content.MediaAtom
import org.joda.time.DateTime
import org.mockito.Mockito._
import org.scalatest.BeforeAndAfter
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import views.support.JavaScriptPage
import common.Edition
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.JsBoolean
import play.api.test.FakeRequest
import play.api.test.Helpers.GET

class ContentTest
    extends AnyFlatSpec
    with Matchers
    with GuiceOneAppPerSuite
    with implicits.Dates
    with MockitoSugar
    with BeforeAndAfter {
  "Trail" should "be populated properly" in {
    val imageElement = ApiElement(
      "test-picture",
      "main",
      ElementType.Image,
      Some(0),
      List(
        Asset(
          AssetType.Image,
          Some("image/jpeg"),
          Some("http://www.foo.com/bar"),
          Some(AssetFields(caption = Some("caption"), width = Some(55))),
        ),
      ),
    )

    val elements = List(
      imageElement,
      ApiElement("test-audio", "main", ElementType.Audio, Some(0), Nil),
    )

    val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)

    val content = ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(offsetDate.toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      //mediaAssets = media,
      tags = List(tag("type/article")),
      elements = Some(elements),
    )

    val trail: model.ContentType = Content(content)

    trail.fields.linkText should be("Some article")
    trail.metadata.url should be("/foo/2012/jan/07/bar")
    trail.elements.mainPicture.flatMap(_.images.largestImage.flatMap(_.url)) should be(Some("http://www.foo.com/bar"))
  }

  val requestWithNoAdTestParam = FakeRequest(GET, "/uk")
  val requestWithAdTestParam = FakeRequest(GET, "/uk?adtest=6")
  val noAdTestParam: Option[String] = None

  "Tags" should "understand tag types" in {

    val theKeywords = List(Tag.make(tag("/keyword1", TagType.Keyword)), Tag.make(tag("/keyword2", TagType.Keyword)))
    val theSeries = List(Tag.make(tag("/series", TagType.Series)))
    val theContributors = List(Tag.make(tag("/contributor", TagType.Contributor)))
    val theTones = List(Tag.make(tag("/tone", TagType.Tone)))
    val theBlogs = List(Tag.make(tag("/blog", TagType.Blog)))
    val theTypes = List(Tag.make(tag("/type", TagType.Type)))

    val tags = Tags(tags = theBlogs ++ theTones ++ theContributors ++ theSeries ++ theKeywords ++ theTypes)

    tags.keywords should be(theKeywords)

    tags.contributors should be(theContributors)

    tags.blogs should be(theBlogs)

    tags.tones should be(theTones)

    tags.series should be(theSeries)

    tags.types should be(theTypes)
  }

  "Content" should "understand that in body pictures are not main pictures" in {

    val testContent = content(
      "article",
      List(
        image("test-image-0", "body", "body picture 1", 50, 0),
        image("test-image-1", "body", "body picture 2", 50, 0),
        image("test-image-2", "main", "main picture 1", 50, 0),
      ),
    )

    testContent.elements.mainPicture.flatMap(_.images.largestImage.flatMap(_.caption)) should be(Some("main picture 1"))
  }

  it should "detect if content is commentable" in {
    val noFields = article.copy(fields = None)
    Content(noFields).trail.isCommentable should be(false)

    val notCommentable = article.copy(fields = Some(ContentFields(commentable = Some(false))))
    Content(notCommentable).trail.isCommentable should be(false)

    val commentable = article.copy(fields = Some(ContentFields(commentable = Some(true))))
    commentable.fields.flatMap(_.commentable) should be(Some(true))
    Content(commentable).trail.isCommentable should be(true)

  }

  it should "detect if content is closed for comments" in {
    val noFields = article.copy(fields = None)
    Content(noFields).trail.isClosedForComments should be(true)

    val future = new DateTime().plusDays(3)
    val futureOffset = jodaToJavaInstant(future).atOffset(ZoneOffset.UTC)
    val openComments = article.copy(fields = Some(ContentFields(commentCloseDate = Some(futureOffset.toCapiDateTime))))
    Content(openComments).trail.isClosedForComments should be(false)

    val past = new DateTime().minus(3)
    val pastOffset = jodaToJavaInstant(past).atOffset(ZoneOffset.UTC)
    val closedComments = article.copy(fields = Some(ContentFields(commentCloseDate = Some(pastOffset.toCapiDateTime))))
    Content(closedComments).trail.isClosedForComments should be(true)
  }

  it should "realise that it should not show ads" in {
    val sensitive = article.copy(fields = Some(ContentFields(shouldHideAdverts = Some(true))))

    Content(article).content.shouldHideAdverts should be(false)
    Content(sensitive).content.shouldHideAdverts should be(true)
  }

  it should "detect if article requires membershipAccess" in {

    val noAccess = article.copy(fields = None)
    Content(noAccess).metadata.requiresMembershipAccess should be(false)

    val membershipArticle =
      article.copy(fields = Some(ContentFields(membershipAccess = Some(MembershipTier.MembersOnly))))
    Content(membershipArticle).metadata.requiresMembershipAccess should be(true)
  }

  /*
    Date: 02nd Dec 2020
    Some tests (those with hardcoded short urls), come in two versions "gu.com" and "www.theguardian.com", this is due to a CAPI migration.
    See (id: 288767d7-ba82-4d67-8fb3-9139e67b0f2e) , for details.
   */

  it should "returns the correct shortUrlId (gu.com)" in {

    def contentWithShortUrl(shortUrl: String): model.ContentType =
      Content(article.copy(fields = Some(ContentFields(shortUrl = Some(shortUrl)))))

    contentWithShortUrl("http://gu.com/p/3r1b5").fields.shortUrlId should be("/p/3r1b5")
    contentWithShortUrl("https://gu.com/p/4t2c6").fields.shortUrlId should be("/p/4t2c6")
  }

  it should "returns the correct shortUrlId (www.theguardian.com)" in {

    def contentWithShortUrl(shortUrl: String): model.ContentType =
      Content(article.copy(fields = Some(ContentFields(shortUrl = Some(shortUrl)))))

    contentWithShortUrl("http://www.theguardian.com/p/3r1b5").fields.shortUrlId should be("/p/3r1b5")
    contentWithShortUrl("https://www.theguardian.com/p/4t2c6").fields.shortUrlId should be("/p/4t2c6")
  }

  val dateBeforeCutoff = Some(
    jodaToJavaInstant(new DateTime("2017-07-02T12:00:00.000Z")).atOffset(ZoneOffset.UTC).toCapiDateTime,
  )
  val dateAfterCutoff = Some(
    jodaToJavaInstant(new DateTime("2017-07-04T12:00:00.000Z")).atOffset(ZoneOffset.UTC).toCapiDateTime,
  )
  val edition: Edition = mock[Edition]
  val sensitiveContentFields = Some(ContentFields(sensitive = Some(true)))
  val nonSensitiveContentFields = Some(ContentFields(sensitive = Some(true)))

  when(edition.id) thenReturn "GB"

  "ContentJavascriptConfig" should "set shouldHideReaderRevenue to true for a sensitive article, published before the cutoff date, no RR flag" in {

    val content =
      Content(article.copy(webPublicationDate = dateBeforeCutoff, fields = Some(ContentFields(sensitive = Some(true)))))
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, isPreview = false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should equal(Some(JsBoolean(true)))
  }

  it should "set shouldHideReaderRevenue to false for a non-sensitive article, published before the cutoff date, no RR flag" in {

    val content = Content(
      article.copy(webPublicationDate = dateBeforeCutoff, fields = Some(ContentFields(sensitive = Some(false)))),
    )
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, isPreview = false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should be(Some(JsBoolean(false)))
  }

  it should "set shouldHideReaderRevenue to false for a sensitive article, published after the cutoff date, sHHR flag set to false" in {

    val content = Content(
      article.copy(
        webPublicationDate = dateAfterCutoff,
        fields = Some(ContentFields(sensitive = Some(true), shouldHideReaderRevenue = Some(false))),
      ),
    )
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, isPreview = false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should be(Some(JsBoolean(false)))
  }

  it should "set shouldHideReaderRevenue to true for a sensitive article, published after the cutoff date, sHHR flag set to true" in {

    val content = Content(
      article.copy(
        webPublicationDate = dateAfterCutoff,
        fields = Some(ContentFields(sensitive = Some(true), shouldHideReaderRevenue = Some(true))),
      ),
    )
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, isPreview = false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should be(Some(JsBoolean(true)))
  }

  it should "set shouldHideReaderRevenue to true for a non sensitive article, published after the cutoff date, sHHR flag set to true" in {

    val content = Content(
      article.copy(
        webPublicationDate = dateAfterCutoff,
        fields = Some(ContentFields(sensitive = Some(false), shouldHideReaderRevenue = Some(true))),
      ),
    )
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, isPreview = false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should be(Some(JsBoolean(true)))
  }

  it should "set shouldHideReaderRevenue to true for any article that is Paid Content, regardless of the state of the shouldHideReaderRevenue flag in the CAPI response" in {

    val content =
      Content(
        article.copy(
          webPublicationDate = dateAfterCutoff,
          fields = Some(ContentFields(sensitive = Some(false), shouldHideReaderRevenue = Some(false))),
          tags = List(tag(s"tone/advertisement-features")),
        ),
      )
    JavaScriptPage
      .getMap(SimpleContentPage(content), edition, false, requestWithNoAdTestParam)
      .get("shouldHideReaderRevenue") should be(
      Some(JsBoolean(true)),
    )
  }

  private def tag(id: String = "/id", tagType: TagType = TagType.Keyword, name: String = "", url: String = "") = {
    ApiTag(
      id = id,
      `type` = tagType,
      webTitle = name,
      sectionId = None,
      sectionName = None,
      webUrl = url,
      apiUrl = "apiurl",
      references = Nil,
    )
  }

  private def content(
      contentType: String,
      elements: List[ApiElement],
      maybeByline: Option[String] = None,
  ): model.ContentType = {
    Content(contentApi(contentType, elements, maybeByline))
  }

  private val article = contentApi("article", Nil)

  private def contentApi(
      contentType: String,
      elements: List[ApiElement],
      maybeByline: Option[String] = None,
  ): ApiContent = {

    val offsetDate = jodaToJavaInstant(DateTime.now).atOffset(ZoneOffset.UTC)

    ApiContent(
      id = "/content",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(offsetDate.toCapiDateTime),
      webTitle = "webTitle",
      webUrl = "webUrl",
      apiUrl = "apiUrl",
      tags = List(tag(s"type/$contentType")),
      elements = Some(elements),
      fields = Some(ContentFields(byline = maybeByline)),
    )
  }

  private def image(id: String, relation: String, caption: String, width: Int, index: Int): ApiElement = {
    ApiElement(id, relation, ElementType.Image, Some(index), List(asset(caption, width)))
  }

  private def asset(caption: String, width: Int): Asset = {
    Asset(
      AssetType.Image,
      Some("image/jpeg"),
      Some("http://www.foo.com/bar"),
      Some(AssetFields(caption = Some(caption), width = Some(width))),
    )
  }

  "Video" should "return the correct byline" in {
    val videoSource = Some("test-video-source")
    val atomSource = Some("test-atom-source")
    val emptySource = Some("")
    val byline = Some("test-byline")

    val contentNoByline = content("video", Nil).content
    val contentWithByline = content("video", Nil, byline).content

    val mediaAtomWithSource = Some(MediaAtom("", "", Nil, "", None, atomSource, None, None, None, None))
    val mediaAtomWithNoSource = Some(MediaAtom("", "", Nil, "", None, None, None, None, None, None))
    val mediaAtomWithEmptySource = Some(MediaAtom("", "", Nil, "", None, emptySource, None, None, None, None))

    Video(contentNoByline, None, None).bylineWithSource should be(None)
    Video(contentNoByline, videoSource, None).bylineWithSource should be(videoSource.map(s => s"Source: $s"))
    Video(contentNoByline, None, mediaAtomWithSource).bylineWithSource should be(atomSource.map(s => s"Source: $s"))
    Video(contentNoByline, None, mediaAtomWithNoSource).bylineWithSource should be(None)
    Video(contentNoByline, None, mediaAtomWithEmptySource).bylineWithSource should be(None)
    Video(contentNoByline, Some("guardian.co.uk"), None).bylineWithSource should be(Some("theguardian.com"))

    Video(contentWithByline, None, None).bylineWithSource should be(byline)
    Video(contentWithByline, videoSource, None).bylineWithSource should be(
      videoSource.map(s => s"${byline.get}, Source: $s"),
    )
    Video(contentWithByline, None, mediaAtomWithSource).bylineWithSource should be(
      atomSource.map(s => s"${byline.get}, Source: $s"),
    )
    Video(contentWithByline, None, mediaAtomWithNoSource).bylineWithSource should be(byline)
    Video(contentWithByline, None, mediaAtomWithEmptySource).bylineWithSource should be(byline)
    Video(contentWithByline, Some("guardian.co.uk"), None).bylineWithSource should be(
      Some(s"${byline.get}, theguardian.com"),
    )
  }
}
