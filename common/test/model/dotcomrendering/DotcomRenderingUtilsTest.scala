package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{
  Block,
  BlockAttributes,
  Blocks,
  CapiDateTime,
  ContentFields,
  Content => ApiContent,
}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.contentapi.client.utils.format.LiveBlogDesign
import conf.switches.Switches
import implicits.Dates.jodaToJavaInstant
import model.dotcomrendering.DotcomRenderingUtils
import model.liveblog.{BlockAttributes => LiveblogBlockAttribute, _}
import model.{
  Article,
  CanonicalLiveBlog,
  Content,
  ContentFormat,
  ContentType,
  DotcomContentType,
  FirstPage,
  LiveBlogCurrentPage,
  LiveBlogPage,
  MetaData,
  RelatedContent,
}
import org.joda.time.DateTime
import org.mockito.Mockito.when
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import java.time.ZoneOffset

class DotcomRenderingUtilsTest extends AnyFlatSpec with Matchers with MockitoSugar {

  val testContent = mock[ContentType]
  val testMetadata = mock[MetaData]
  val testCapiBlocks = mock[Blocks]
  val relatedContent = mock[RelatedContent]
  val formatWithArticleDesign = ContentFormat.defaultContentFormat

  val testArticle = {
    val item = ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = None,
    )
    Article.make(Content.make(item))
  }

  "getModifiedContent" should "ensure a live design takes priority when the forceLive flag is set" in {
    when(testContent.metadata) thenReturn testMetadata
    when(testMetadata.format) thenReturn Some(formatWithArticleDesign)
    when(testMetadata.contentType) thenReturn Some(DotcomContentType.Article)

    val actual = DotcomRenderingUtils.getModifiedContent(testContent, forceLive = true)

    actual.design should be(LiveBlogDesign)
  }

  it should "keep the original design when the content type is not interactive and the forceLive flag is false" in {
    when(testContent.metadata) thenReturn testMetadata
    when(testMetadata.format) thenReturn Some(formatWithArticleDesign)
    when(testMetadata.contentType) thenReturn Some(DotcomContentType.Article)

    val actual = DotcomRenderingUtils.getModifiedContent(testContent, forceLive = false)

    actual should be(formatWithArticleDesign)
  }

  "getMostRecentBlockID" should "return the most recent block when the first page is requested" in {
    val testBlocks = mock[Blocks]
    val testBlock1 = mock[Block]
    val testBlock2 = mock[Block]

    when(testBlock1.id) thenReturn "testBlockId123"
    when(testBlocks.requestedBodyBlocks) thenReturn Some(
      Map(CanonicalLiveBlog.firstPage -> Seq(testBlock1, testBlock2)),
    )

    val actual = DotcomRenderingUtils.getMostRecentBlockId(testBlocks)

    actual should be(Some("block-testBlockId123"))
  }

  it should "return the most recent block when an older page is requested" in {
    val testBlocks = mock[Blocks]
    val testBlock1 = mock[Block]
    val testBlock2 = mock[Block]

    when(testBlock1.id) thenReturn "testBlockId123"
    when(testBlocks.requestedBodyBlocks) thenReturn None
    when(testBlocks.body) thenReturn Some(Seq(testBlock1, testBlock2))

    val actual = DotcomRenderingUtils.getMostRecentBlockId(testBlocks)

    actual should be(Some("block-testBlockId123"))
  }

  it should "return nothing if for whatever reason the blog is empty" in {
    val testBlocks = mock[Blocks]
    val testBlock1 = mock[Block]

    when(testBlock1.id) thenReturn "testBlockId123"
    when(testBlocks.requestedBodyBlocks) thenReturn None
    when(testBlocks.body) thenReturn None

    val actual = DotcomRenderingUtils.getMostRecentBlockId(testBlocks)

    actual should be(None)
  }

  it should "add block- in front of the block id" in {
    val testBlocks = mock[Blocks]
    val testBlock1 = mock[Block]
    val testBlock2 = mock[Block]

    when(testBlock1.id) thenReturn "testBlockId123"
    when(testBlocks.requestedBodyBlocks) thenReturn None
    when(testBlocks.body) thenReturn Some(Seq(testBlock1, testBlock2))

    val actual = DotcomRenderingUtils.getMostRecentBlockId(testBlocks)

    actual should be(Some("block-testBlockId123"))
  }

  "ensureSummaryTitle" should "add a title to summary posts without a title" in {
    val testBlock1 = mock[Block]
    val testBlock2 = mock[Block]
    val summaryBlockAttributes = BlockAttributes(Some(false), Some(true), None, Some(false), None)

    when(testBlock1.title) thenReturn None
    when(testBlock1.attributes) thenReturn summaryBlockAttributes
    when(testBlock1.copy(title = Some("Summary"))) thenReturn testBlock2

    DotcomRenderingUtils.ensureSummaryTitle(testBlock1) should be(testBlock2)
  }

  it should "not a title to a non summary posts without a title" in {
    val testBlock1 = mock[Block]
    val summaryBlockAttributes = BlockAttributes(Some(true), Some(false), None, Some(false), None)

    when(testBlock1.title) thenReturn None
    when(testBlock1.attributes) thenReturn summaryBlockAttributes

    DotcomRenderingUtils.ensureSummaryTitle(testBlock1).title should be(None)
  }

  it should "not change the title of a summary post with a title" in {
    val testBlock1 = mock[Block]
    val summaryBlockAttributes: BlockAttributes =
      BlockAttributes(Some(false), Some(true), Some("I have a title"), Some(false), None)

    when(testBlock1.title) thenReturn Some("I have a title")
    when(testBlock1.attributes) thenReturn summaryBlockAttributes

    DotcomRenderingUtils.ensureSummaryTitle(testBlock1).title should be(Some("I have a title"))
  }

  // --- Affiliate disclaimer tests ---
  // Testing skimlinks detection (hasAffiliateLinksForDisclaimer) requires a SkimLinksCache refactor
  // and will be covered in a follow-up PR.

  /** Helper to build a minimal Article with a specific body HTML and showAffiliateLinks flag. */
  private def articleWithBody(bodyHtml: String, showAffiliateLinks: Option[Boolean] = Some(true)): Article = {
    val item = ApiContent(
      id = "money/2025/nov/19/test-article",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "Test article",
      webUrl = "http://www.guardian.co.uk/money/2025/nov/19/test-article",
      apiUrl = "http://content.guardianapis.com/money/2025/nov/19/test-article",
      tags = List(),
      elements = None,
      fields = Some(ContentFields(body = Some(bodyHtml), showAffiliateLinks = showAffiliateLinks)),
    )
    Article.make(Content.make(item))
  }

  private val sampleArticleBody =
    """<p>Opening paragraph.</p><p>Second paragraph with some content.</p>"""

  "shouldAddAffiliateLinks" should "return false when the affiliate links switch is off" in {
    Switches.AffiliateLinks.switchOff()
    val content = articleWithBody(sampleArticleBody)
    DotcomRenderingUtils.shouldAddAffiliateLinks(content) should be(false)
  }

  it should "return false when showAffiliateLinks is not set on the content" in {
    Switches.AffiliateLinks.switchOn()
    try {
      val content = articleWithBody(sampleArticleBody, showAffiliateLinks = None)
      DotcomRenderingUtils.shouldAddAffiliateLinks(content) should be(false)
    } finally {
      Switches.AffiliateLinks.switchOff()
    }
  }

  it should "return false when showAffiliateLinks is explicitly false" in {
    Switches.AffiliateLinks.switchOn()
    try {
      val content = articleWithBody(sampleArticleBody, showAffiliateLinks = Some(false))
      DotcomRenderingUtils.shouldAddAffiliateLinks(content) should be(false)
    } finally {
      Switches.AffiliateLinks.switchOff()
    }
  }

  it should "return false when no skimlinks exist in the blocks" in {
    Switches.AffiliateLinks.switchOn()
    try {
      val content = articleWithBody(sampleArticleBody)
      val blocks = Seq(
        Block(
          id = "1",
          bodyHtml = "<p>No affiliate links here.</p>",
          bodyTextSummary = "",
          title = None,
          attributes = BlockAttributes(),
          published = true,
          createdDate = None,
          firstPublishedDate = None,
          publishedDate = None,
          lastModifiedDate = None,
          createdBy = None,
          lastModifiedBy = None,
          elements = Seq(),
        ),
      )

      DotcomRenderingUtils.shouldAddAffiliateLinks(content, blocks) should be(false)
    } finally {
      Switches.AffiliateLinks.switchOff()
    }
  }

  def getLiveblogPageWithBlockIds(pageBlokIds: Seq[Int]) = {
    val liveblogBlocks = pageBlokIds.map(id => getBodyBlockWithId(id))
    val liveblogCurrentPage = LiveBlogCurrentPage(
      currentPage = FirstPage(liveblogBlocks),
      pagination = None,
      pinnedBlock = None,
    )

    LiveBlogPage(
      article = testArticle,
      currentPage = liveblogCurrentPage,
      related = relatedContent,
    )
  }

  def getRequestedBlocks(keyEvents: Seq[Int], summaries: Seq[Int], latest60: Seq[Int] = Seq.empty) = {
    val offsetDate = jodaToJavaInstant(DateTime.now).atOffset(ZoneOffset.UTC)
    val keyEventBlocks =
      keyEvents.toSeq.map(digit => getApiBlockWithId(digit, offsetDate.plusMinutes(digit).toCapiDateTime))
    val summarieBlocks =
      summaries.toSeq.map(digit => getApiBlockWithId(digit, offsetDate.plusMinutes(digit).toCapiDateTime))

    val latest60Blocks =
      latest60.toSeq.map(digit => getApiBlockWithId(digit, offsetDate.plusMinutes(digit).toCapiDateTime))

    val requested: Map[String, Seq[Block]] =
      Map("body:key-events" -> keyEventBlocks, "body:summary" -> summarieBlocks, "body:latest:60" -> latest60Blocks)

    requested
  }

  def getApiBlockWithId(id: Int, publishDate: CapiDateTime) = {
    Block(
      id = id.toString,
      bodyHtml = "",
      bodyTextSummary = "",
      title = None,
      attributes = BlockAttributes(),
      published = true,
      createdDate = None,
      firstPublishedDate = Some(publishDate),
      publishedDate = None,
      lastModifiedDate = None,
      createdBy = None,
      lastModifiedBy = None,
      elements = Seq(),
    )
  }

  def getBodyBlockWithId(
      publicationOrder: Int,
  ): BodyBlock =
    BodyBlock(
      s"$publicationOrder",
      "",
      "",
      None,
      LiveblogBlockAttribute(false, false, false, None),
      false,
      None,
      firstPublishedDate = Some(new DateTime(publicationOrder)),
      None,
      None,
      Nil,
      Nil,
    )
}
