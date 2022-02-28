package model.dotcomrendering.pageElements

import com.gu.contentapi.client.utils.format.{ArticleDesign, InteractiveDesign, LiveBlogDesign, StandardDisplay}
import model.{ContentFormat, ContentType, DotcomContentType, MetaData}
import org.scalatest.{FlatSpec, Matchers}
import model.dotcomrendering.DotcomRenderingUtils
import org.mockito.Mockito.when
import org.scalatest.mockito.MockitoSugar

class DotcomRenderingUtilsTest extends FlatSpec with Matchers with MockitoSugar {

  val testContent = mock[ContentType]
  val testMetadata = mock[MetaData]
  val formatWithArticleDesign = ContentFormat.defaultContentFormat

  "getModifiedContent" should "ensure an interactive design when the content type is interactive" in {
    when(testContent.metadata) thenReturn testMetadata
    when(testMetadata.format) thenReturn Some(formatWithArticleDesign)
    when(testMetadata.contentType) thenReturn Some(DotcomContentType.Interactive)

    val actual = DotcomRenderingUtils.getModifiedContent(testContent, forceLive = false)

    actual.design should be(InteractiveDesign)
  }

  it should "ensure an interactive design when the content type is interactive even when we attempt to force a live design" in {
    when(testContent.metadata) thenReturn testMetadata
    when(testMetadata.format) thenReturn Some(formatWithArticleDesign)
    when(testMetadata.contentType) thenReturn Some(DotcomContentType.Interactive)

    val actual = DotcomRenderingUtils.getModifiedContent(testContent, forceLive = true)

    actual.design should be(InteractiveDesign)
  }

  it should "ensure a live design takes priority when the forceLive flag is set" in {
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

}
