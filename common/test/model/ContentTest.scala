package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ MediaAsset, Content => ApiContent, Tag => ApiTag }

class ContentTest extends FlatSpec with ShouldMatchers {

  "Trail" should "be populated properly" in {

    val media = List(
      MediaAsset("picture", "body", 1, Some("http://www.foo.com/bar"),
        Some(Map("caption" -> "caption", "width" -> "55"))),
      MediaAsset("audio", "body", 1, None, None)
    )

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      mediaAssets = media,
      tags = List(tag("type/article"))
    )

    val trail: Trail = new Content(content)

    trail.linkText should be("Some article")
    trail.url should be("/foo/2012/jan/07/bar")
    trail.images should be(List(Image(media(0))))
  }

  "Tags" should "understand tag types" in {

    val theKeywords = Seq(Tag(tag("/keyword1", "keyword")), Tag(tag("/keyword2", "keyword")))
    val theSeries = Seq(Tag(tag("/series", "series")))
    val theContributors = Seq(Tag(tag("/contributor", "contributor")))
    val theTones = Seq(Tag(tag("/tone", "tone")))
    val theBlogs = Seq(Tag(tag("/blog", "blog")))
    val theTypes = Seq(Tag(tag("/type", "type")))

    val tags = new Tags {
      override val tags = theBlogs ++ theTones ++ theContributors ++ theSeries ++ theKeywords ++ theTypes
    }

    tags.keywords should be(theKeywords)

    tags.contributors should be(theContributors)

    tags.blogs should be(theBlogs)

    tags.tones should be(theTones)

    tags.series should be(theSeries)

    tags.types should be(theTypes)

  }

  "Canonical urls" should "point back to guardian.co.uk" in {
    val apiContent = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar"
    )

    val apiTag = tag(url = "http://www.guardian.co.uk/sport/cycling")

    new Content(apiContent).canonicalUrl should be(Some("http://www.guardian.co.uk/foo/2012/jan/07/bar"))

    Tag(apiTag).canonicalUrl should be(Some("http://www.guardian.co.uk/sport/cycling"))
  }

  private def tag(id: String = "/id", tagType: String = "keyword", name: String = "", url: String = "") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = url, apiUrl = "apiurl", references = Nil)
  }
}
