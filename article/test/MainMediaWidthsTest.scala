package test

import com.gu.contentapi.client.model.{Content => ApiContent, Element => ApiElement, Tag => ApiTag, Asset}
import layout.ContentWidths.{MainMedia}
import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.Eventually
import views.MainMediaWidths
import model.{Article}

class MainMediaWidthsTest extends FreeSpec with ShouldMatchers with Eventually with SingleServerSuite {
  "should return correct widths" in {
    val content = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = None
    )

    val article = new Article(content)

    MainMediaWidths(article) shouldEqual MainMedia.Inline
  }

  "should return correct widths for showcase main media" in {
    val imageElement = ApiElement(
      "test-picture",
      "main",
      "image",
      Some(0),
      List(Asset(
        "image",
        Some("image/jpeg"),
        Some("http://www.foo.com/bar"),
        Map("caption" -> "caption", "width" -> "55", "role" -> "showcase"))))

    val content = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = Some(List(imageElement))
    )

    val article = new Article(content)

    MainMediaWidths(article) shouldEqual MainMedia.Showcase
  }

  "should return correct widths for showcase main media in feature content" in {
    val imageElement = ApiElement(
      "test-picture",
      "main",
      "image",
      Some(0),
      List(Asset(
        "image",
        Some("image/jpeg"),
        Some("http://www.foo.com/bar"),
        Map("caption" -> "caption", "width" -> "55", "role" -> "showcase"))))

    val content = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("tone/features", "tone")),
      elements = Some(List(imageElement))
    )

    val article = new Article(content)

    MainMediaWidths(article) shouldEqual MainMedia.FeatureShowcase
  }

  private def tag(id: String = "/id", tagType: String = "keyword", name: String = "", url: String = "") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = url, apiUrl = "apiurl", references = Nil)
  }
}
