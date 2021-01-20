package model

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{ContentFields, TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import implicits.Dates.jodaToJavaInstant
import org.scalatest.{FlatSpec, Matchers}
import org.joda.time.DateTime

class MetaDataTest extends FlatSpec with Matchers {

  def testMetaData(id: String, section: String): MetaData = {
    MetaData.make(id, section = Some(SectionId.fromId(section)), webTitle = "t")
  }

  "adUnitSuffix" should "just be section for a content page" in {
    testMetaData("world/2014/jun/19/obama-100-special-forces-iraq", "world").adUnitSuffix should be("world")
  }

  val defaultTag = ApiTag(
    id = "type/article",
    `type` = TagType.Keyword,
    webTitle = "",
    sectionId = None,
    sectionName = None,
    webUrl = "",
    apiUrl = "apiurl",
    references = Nil,
  )

  val paidContentTag = ApiTag(
    id = "tone/advertisement-features",
    `type` = TagType.Keyword,
    webTitle = "",
    sectionId = None,
    sectionName = None,
    webUrl = "",
    apiUrl = "apiurl",
    references = Nil,
  )

  val cutoffDate = new DateTime("2017-07-03T12:00:00.000Z")
  val dateBeforeCutoff = new DateTime("2017-07-02T12:00:00.000Z")
  val dateAfterCutoff = new DateTime("2017-07-04T12:00:00.000Z")

  private def contentApi(
      shouldHideReaderRevenue: Option[Boolean] = None,
      isPaid: Boolean = false,
      isSensitive: Boolean = false,
      shouldHideAdverts: Boolean = false,
      publicationDate: DateTime,
  ) = {

    val pubDateOffset = jodaToJavaInstant(publicationDate).atOffset(ZoneOffset.UTC)

    ApiContent(
      id = "/content",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(pubDateOffset.toCapiDateTime),
      webTitle = "webTitle",
      webUrl = "webUrl",
      apiUrl = "apiUrl",
      tags = defaultTag :: (if (isPaid) List(paidContentTag) else Nil),
      elements = None,
      fields = Some(
        ContentFields(
          sensitive = Some(isSensitive),
          shouldHideReaderRevenue = shouldHideReaderRevenue,
          shouldHideAdverts = Some(shouldHideAdverts),
        ),
      ),
    )
  }

  "shouldHideReaderRevenue" should "hide if shouldHideReaderRevenue is unset, and content is sensitive and published before cutoff" in {
    val content = contentApi(isSensitive = true, publicationDate = dateBeforeCutoff)
    Fields.shouldHideReaderRevenue(content, cutoffDate) should be(true)
  }

  it should "hide if shouldHideReaderRevenue is unset, and content is shouldHideAdverts and published before cutoff" in {
    val content = contentApi(shouldHideAdverts = true, publicationDate = dateBeforeCutoff)
    Fields.shouldHideReaderRevenue(content, cutoffDate) should be(true)
  }

  it should "not hide if shouldHideReaderRevenue is unset and published after cutoff, even if sensitive" in {
    val content = contentApi(isSensitive = true, publicationDate = dateAfterCutoff)
    Fields.shouldHideReaderRevenue(content, cutoffDate) should be(false)
  }

  it should "not hide if shouldHideReaderRevenue is unset and published after cutoff, even if shouldHideAdverts" in {
    val content = contentApi(shouldHideAdverts = true, publicationDate = dateAfterCutoff)
    Fields.shouldHideReaderRevenue(content, cutoffDate) should be(false)
  }

  it should "not hide if shouldHideReaderRevenue is false and published before cutoff, even if sensitive" in {
    val content =
      contentApi(shouldHideReaderRevenue = Some(false), isSensitive = true, publicationDate = dateBeforeCutoff)
    Fields.shouldHideReaderRevenue(content, cutoffDate) should be(false)
  }

  it should "hide if shouldHideReaderRevenue is true, regardless of publication date or sensitive flag" in {
    val sensitiveOldContent =
      contentApi(shouldHideReaderRevenue = Some(true), isSensitive = true, publicationDate = dateBeforeCutoff)
    val sensitiveNewContent =
      contentApi(shouldHideReaderRevenue = Some(true), isSensitive = true, publicationDate = dateBeforeCutoff)
    val notSensitiveOldContent = contentApi(shouldHideReaderRevenue = Some(true), publicationDate = dateAfterCutoff)
    val notSensitiveNewContent = contentApi(shouldHideReaderRevenue = Some(true), publicationDate = dateAfterCutoff)

    Fields.shouldHideReaderRevenue(sensitiveOldContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(sensitiveNewContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(notSensitiveOldContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(notSensitiveNewContent, cutoffDate) should be(true)
  }

  it should "hide if content is paid, regardless of shouldHideReaderRevenue flag, publication date or sensitive flag" in {
    val sensitiveOldContent = contentApi(
      shouldHideReaderRevenue = Some(false),
      isSensitive = true,
      isPaid = true,
      publicationDate = dateBeforeCutoff,
    )
    val sensitiveNewContent = contentApi(
      shouldHideReaderRevenue = Some(true),
      isSensitive = true,
      isPaid = true,
      publicationDate = dateBeforeCutoff,
    )
    val notSensitiveOldContent =
      contentApi(shouldHideReaderRevenue = None, isPaid = true, publicationDate = dateAfterCutoff)
    val notSensitiveNewContent =
      contentApi(shouldHideReaderRevenue = None, isPaid = true, publicationDate = dateAfterCutoff)

    Fields.shouldHideReaderRevenue(sensitiveOldContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(sensitiveNewContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(notSensitiveOldContent, cutoffDate) should be(true)
    Fields.shouldHideReaderRevenue(notSensitiveNewContent, cutoffDate) should be(true)
  }
}
