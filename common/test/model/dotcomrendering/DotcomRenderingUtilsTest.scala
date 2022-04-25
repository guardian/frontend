package model.dotcomrendering.pageElements

import com.gu.contentapi.client.utils.format.{ArticleDesign, InteractiveDesign, LiveBlogDesign, StandardDisplay}
import model.{CanonicalLiveBlog, ContentFormat, ContentType, DotcomContentType, MetaData}
import org.scalatest.{FlatSpec, Matchers}
import model.dotcomrendering.DotcomRenderingUtils
import org.mockito.Mockito.{verify, verifyZeroInteractions, when}
import org.scalatest.mockito.MockitoSugar
import com.gu.contentapi.client.model.v1.Blocks
import com.gu.contentapi.client.model.v1.Block
import com.gu.contentapi.client.model.v1.BlockAttributes

class DotcomRenderingUtilsTest extends FlatSpec with Matchers with MockitoSugar {

  val testContent = mock[ContentType]
  val testMetadata = mock[MetaData]
  val formatWithArticleDesign = ContentFormat.defaultContentFormat

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
    val testBlock2 = mock[Block]

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
    val summaryBlockAttributes: BlockAttributes = BlockAttributes(Some(false), Some(true), Some("I have a title"), Some(false), None)

    when(testBlock1.title) thenReturn Some("I have a title")
    when(testBlock1.attributes) thenReturn summaryBlockAttributes

    DotcomRenderingUtils.ensureSummaryTitle(testBlock1).title should be(Some("I have a title"))
  }
}
