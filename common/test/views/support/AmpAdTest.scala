package views.support

import com.gu.contentapi.client.model.v1.{Section, Tag => ApiTag, TagType, Content => ApiContent}
import org.scalatest.{FlatSpec, Matchers}
import model.{Article, Content}
import play.api.libs.json.JsString

class AmpAdTest extends FlatSpec with Matchers {
   "AmpAdDataSlot" should "return a string containing article's section ID" in {
     val sectionId = "sectionId"
     val result = AmpAdDataSlot(article(sectionId)).toString()

     result should include(sectionId)
   }

  "AmpAdDataSlot" should "return a string containing article's contentType" in {
    val contentType = "article"
    val result = AmpAdDataSlot(article("")).toString()

    result should include(contentType)
  }

  "AmpAd" should "return a JSON object containing passed URI" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val result = AmpAd(article(""), uri, edition).toJson()
    val targetingUrl = (result \ "targeting" \ "url").as[JsString].value

    targetingUrl should be(uri)
  }

  "AmpAd" should "return a JSON object containing passed edition" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val result = AmpAd(article(""), uri, edition).toJson()
    val targetingEdition = (result \ "targeting" \ "edition").as[JsString].value

    targetingEdition should be(edition)
  }

  "AmpAd" should "return a JSON object containing passed article's section ID" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val result = AmpAd(article(sectionId), uri, edition).toJson()
    val targetingSection = (result \ "targeting" \ "section").as[JsString].value

    targetingSection should be(sectionId)
  }

  "AmpAd" should "return a JSON object containing passed article's content type" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val contentType = "Article"
    val sectionId = "sectionId"
    val result = AmpAd(article(sectionId), uri, edition).toJson()
    val targetingContentType = (result \ "targeting" \ "ct").as[JsString].value

    targetingContentType should be(contentType)
  }

  "AmpAd" should "return a JSON object containing passed article's series tag" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val seriesTag = tag("series/foo", "Foo", TagType.Series)
    val result = AmpAd(article(sectionId, seriesTag), uri, edition).toJson()
    val targetingSeries = (result \ "targeting" \ "se").as[JsString].value

    targetingSeries should be("foo")
  }

  "AmpAd" should "return a JSON object containing passed article's keyword IDs" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val keywordTag1 = tag("keyword1", "Keyword1", TagType.Keyword)
    val keywordTag2 = tag("keyword2", "Keyword2", TagType.Keyword)
    val result = AmpAd(article(sectionId, keywordTag1, keywordTag2), uri, edition).toJson()
    val targetingKeywordIds = (result \ "targeting" \ "keywordIds").as[JsString].value

    targetingKeywordIds should be("keyword1,keyword2")
  }

  "AmpAd" should "return a JSON object containing passed article's keywords" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val keywordTag1 = tag("keyword1", "Keyword1", TagType.Keyword)
    val keywordTag2 = tag("keyword2", "Keyword2", TagType.Keyword)
    val result = AmpAd(article(sectionId, keywordTag1, keywordTag2), uri, edition).toJson()
    val targetingKeywords = (result \ "targeting" \ "k").as[JsString].value

    targetingKeywords should be("keyword1,keyword2")
  }

  "AmpAd" should "return a JSON object containing passed article's contributors" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val contributorTag1 = tag("contributor1", "Contributor1", TagType.Contributor)
    val contributorTag2 = tag("contributor2", "Contributor2", TagType.Contributor)
    val result = AmpAd(article(sectionId, contributorTag1, contributorTag2), uri, edition).toJson()
    val targetingContributors = (result \ "targeting" \ "co").as[JsString].value

    targetingContributors should be("contributor1,contributor2")
  }

  "AmpAd" should "return a JSON object containing passed article's author IDs" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val contributorTag1 = tag("contributor1", "Contributor1", TagType.Contributor)
    val contributorTag2 = tag("contributor2", "Contributor2", TagType.Contributor)
    val result = AmpAd(article(sectionId, contributorTag1, contributorTag2), uri, edition).toJson()
    val targetingAuthorIds = (result \ "targeting" \ "authorIds").as[JsString].value

    targetingAuthorIds should be("contributor1,contributor2")
  }

  "AmpAd" should "return a JSON object containing passed article's blog tags" in {
    val uri = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val edition = "uk"
    val sectionId = "sectionId"
    val blogTag = tag("blog", "Blog", TagType.Blog)
    val result = AmpAd(article(sectionId, blogTag), uri, edition).toJson()
    val targetingBlogs = (result \ "targeting" \ "bl").as[JsString].value

    targetingBlogs should be("blog")
  }

  private def article(sectionId: String, tags: ApiTag*) = {
    val contentApiItem = contentApi(sectionId, tags.toList)
    val content = Content.make(contentApiItem)

    Article.make(content)
  }

  private def contentApi(sectionId: String, tags: List[ApiTag]) = ApiContent(
    id = "foo/2012/jan/07/bar",
    webTitle = "Some article",
    webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
    section = Option(section(sectionId)),
    tags = tags
  )

  private def section(id: String) = {
    val webTitle = "Some section"
    val webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar"
    val apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar"

    Section(id, webTitle, webUrl, apiUrl)
  }
  private def tag(id: String, name: String, tagType: TagType = TagType.Keyword) = ApiTag(id, tagType, webTitle = name, webUrl = "does not matter",
    apiUrl = "does not matter", sectionId = Some("does not matter"))
}
