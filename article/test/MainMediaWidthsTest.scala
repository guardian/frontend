package test

import com.gu.contentapi.client.model.{Content => ApiContent, Element => ApiElement, Tag => ApiTag, Block, Blocks, Asset}
import layout.ContentWidths.{LiveBlogMedia, MainMedia}
import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.Eventually
import views.MainMediaWidths
import model.{Content, Article}

class MainMediaWidthsTest extends FreeSpec with ShouldMatchers with Eventually with SingleServerSuite {
  "should return correct widths" in {
    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = None
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual MainMedia.inline
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

    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = Some(List(imageElement))
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual MainMedia.showcase
  }

  "should return correct widths for a liveblog" in {
    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("tone/minutebyminute", "tone")),
      elements = None,
      blocks = Some(Blocks.apply(None, Some(Seq(Block("","","",None,Map(), false, None, None, None,None,Nil,None,None, Nil)))))
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual LiveBlogMedia.inline
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

    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDateOption = Some(new DateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("tone/features", "tone")),
      elements = Some(List(imageElement))
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual MainMedia.featureShowcase
  }

  private def tag(id: String = "/id", tagType: String = "keyword", name: String = "", url: String = "") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = url, apiUrl = "apiurl", references = Nil)
  }
}
