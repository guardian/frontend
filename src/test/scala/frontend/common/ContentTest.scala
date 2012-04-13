package frontend.common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{MediaAsset, Content => ApiContent, Tag => ApiTag}

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
          mediaAssets = media)

    val trail = Trail(content)

    trail.linkText should be ("Some article")
    trail.url should be ("/foo/2012/jan/07/bar")
    trail.images should be (List(Image(media(0))))
  }

  "Images" should "find exact size image" in {
    val imageMedia = List(image("too small", 50), image("exact size", 70), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
    }

    images.imageOfWidth(70).get.caption should be (Some("exact size"))
  }

  it should "not find any images if there are none in range" in {

    val imageMedia = List(image("too small", 50), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
    }

    images.imageOfWidth(70, tolerance = 10) should be (None)
  }

  it should "find exact size image even if there are others in the size range" in {

    val imageMedia = List(image("too small", 50), image("nearly right", 69),
      image("exact size", 70), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
    }

    images.imageOfWidth(70, tolerance = 10).get.caption should be (Some("exact size"))
  }

  it should "find image with closest size in range" in {

    val imageMedia = List(image("too small", 50), image("find me", 69),
      image("i will lose out", 75) ,image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
    }

    images.imageOfWidth(70, tolerance = 10).get.caption should be (Some("find me"))
  }
  
  "Tags" should "understand tag types" in {
   
    val theKeywords = Seq(tag("/keyword1", "keyword"), tag("/keyword2", "keyword"))
    val theSeries = Seq(tag("/series", "series"))
    val theContributors = Seq(tag("/contributor", "contributor"))
    val theTones = Seq(tag("/tone", "tone"))
    val theBlogs = Seq(tag("/blog", "blog"))

    val tags =new Tags {
      override val tags = theBlogs ++ theTones ++ theContributors ++ theSeries ++ theKeywords
    }

    tags.keywords should be (theKeywords)

    tags.contributors should be (theContributors)

    tags.blogs should be (theBlogs)

    tags.tones should be (theTones)

    tags.series should be (theSeries)

  }
  
  "Content" should "understand the meta data used by the plugins framework" in {

    def metaData = Map[String, Any](
      //people (including 3rd parties) rely on the names of these things, avoid changing them
      "keywords" -> keywords.map{_.name}.mkString(","),
      "description" -> trailText.getOrElse(""),
      "page-id" -> id,
      "section" -> section,
      //"publication" -> publication,
      "tag-ids" -> tags.map(_.id).mkString(","),
      "author" -> contributors.map(_.name).mkString(","),
      "tones" -> tones.map(_.name).mkString(","),
      "series" -> series.map(_.name).mkString(","),
      "blogs" -> blogs.map(_.name).mkString(","),
      "web-publication-date" -> webPublicationDate,
      "short-url" -> shortUrl,
      "api-url" -> content.apiUrl,
      "web-title" -> content.webTitle,
      "byline" -> content.safeFields.get("byline").getOrElse("") ,
      "commentable" -> content.safeFields.get("commentable").getOrElse("false")
    )

    val fields = Map(
      "publication" -> "The Guardian",
      "short-url" -> "http://gu.com/p/12345"
    )

    val apiContent = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar", fields = fields)
    
    
    
  }
  
  private def tag(id: String, tagType: String) ={
    Tag(ApiTag(id = id, `type` = tagType, None, None, "title", "weburl", "apiurl", Nil))
  }

  private def image(caption: String, width: Int) = {
    MediaAsset("picture", "body", 1, Some("http://www.foo.com/bar"),
      Some(Map("caption" -> caption, "width" -> width.toString)))
  }

}
