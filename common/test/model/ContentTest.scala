package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Asset, Element =>ApiElement, Content => ApiContent, Tag => ApiTag }

class ContentTest extends FlatSpec with ShouldMatchers {

  "Trail" should "be populated properly" in {

    val imageElement = ApiElement(
      "test-picture",
      "main",
      "image",
      Some(0),
      List(Asset(
        "image",
        Some("image/jpeg"),
        Some("http://www.foo.com/bar"),
        Map("caption" -> "caption", "width" -> "55"))))

    val elements = List(
      imageElement,
      ApiElement(
        "test-audio",
        "main",
        "audio",
        Some(0),
        Nil)
    )

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      //mediaAssets = media,
      tags = List(tag("type/article")),
      elements = Some(elements)
    )

    val trail: Trail = Content(content)

    trail.linkText should be("Some article")
    trail.url should be("/foo/2012/jan/07/bar")
    trail.images.headOption.flatMap(_.largestImage.flatMap(_.url)) should be (Some("http://www.foo.com/bar"))
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

  "Content" should "understand that in body pictures are not main pictures" in {

    val testContent = content("article", List(image("test-image-0","body", "body picture 1", 50, 0),
                                              image("test-image-1","body", "body picture 2", 50, 0),
                                              image("test-image-2","main", "main picture 1", 50, 0)))

    testContent.mainPicture.get.caption should be(Some("main picture 1"))
  }


  it should "understand that main image is the image of relation 'gallery'" in {

    val testContent = content("gallery", List(image("test-image-0","body", "body picture 1", 50, 0),
                                              image("test-image-1","body", "body picture 2", 50, 0),
                                              image("test-image-2","main", "main picture 1", 50, 0),
                                              image("test-image-3","gallery", "gallery picture 1", 50, 0)))

    testContent.mainPicture.get.caption should be(Some("gallery picture 1"))
  }

  it should "understand that main image can be an image of type 'video'" in {

    val testContent = content("article", List(image("test-image-0","body", "body picture 1", 50, 0),
                                              image("test-image-1","body", "body picture 2", 50, 0),
                                              video("test-image-3","main", "video poster", 50, 0)))

    testContent.mainPicture.get.caption should be(Some("video poster"))
  }

  private def tag(id: String = "/id", tagType: String = "keyword", name: String = "", url: String = "") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = url, apiUrl = "apiurl", references = Nil)
  }

  private def content(contentType:String, elements:List[ApiElement]): Content = {
    Content(
      ApiContent("/content", None, None, DateTime.now, "webTitle", "webUrl", "apiUrl", None,
                 List(tag(s"type/${contentType}")), Nil,Nil, Some(elements), None, Nil, None)
    )
  }

  private def image(  id: String,
                      relation: String,
                      caption: String,
                      width: Int,
                      index: Int): ApiElement = {
    ApiElement(id, relation, "image", Some(index), List(asset(caption, width)))
  }

  private def video(  id: String,
                      relation: String,
                      caption: String,
                      width: Int,
                      index: Int): ApiElement = {
    ApiElement(id, relation, "video", Some(index), List(asset(caption, width)))
  }

  private def asset(caption: String, width: Int): Asset = {
    Asset("image", Some("image/jpeg"), Some("http://www.foo.com/bar"), Map("caption" -> caption, "width" -> width.toString))
  }
}
