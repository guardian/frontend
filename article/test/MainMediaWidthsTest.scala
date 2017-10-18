package test

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{Content => ApiContent, Element => ApiElement, Tag => ApiTag, _}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import implicits.Dates.jodaToJavaInstant
import layout.ContentWidths.{LiveBlogMedia, MainMedia}
import org.joda.time.DateTime
import org.scalatest._
import org.scalatest.concurrent.Eventually
import views.MainMediaWidths
import model.{Article, Content}

@DoNotDiscover class MainMediaWidthsTest extends FreeSpec with Matchers with Eventually with ConfiguredTestSuite {
  "should return correct widths" in {
    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
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
      ElementType.Image,
      Some(0),
      List(Asset(
        AssetType.Image,
        Some("image/jpeg"),
        Some("http://www.foo.com/bar"),
        Some(AssetFields(caption = Some("caption"), width = Some(55), role = Some("showcase"))))))

    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
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
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("tone/minutebyminute", TagType.Tone)),
      elements = None,
      blocks = Some(Blocks.apply(None, Some(Seq(Block("","","",None, BlockAttributes(), false, None, None, None,None,Nil,None,None, Nil)))))
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual LiveBlogMedia.inline
  }

  "should return correct widths for showcase main media in feature content" in {
    val imageElement = ApiElement(
      "test-picture",
      "main",
      ElementType.Image,
      Some(0),
      List(Asset(
        AssetType.Image,
        Some("image/jpeg"),
        Some("http://www.foo.com/bar"),
        Some(AssetFields(caption = Some("caption"), width = Some(55), role = Some("showcase"))))))

    val item = ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("tone/features", TagType.Tone)),
      elements = Some(List(imageElement))
    )

    val content = Content.make(item)
    val article = Article.make(content)

    MainMediaWidths(article) shouldEqual MainMedia.featureShowcase
  }

  private def tag(id: String = "/id", tagType: TagType = TagType.Keyword, name: String = "", url: String = "") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = url, apiUrl = "apiurl", references = Nil)
  }
}
