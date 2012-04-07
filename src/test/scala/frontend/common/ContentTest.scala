package frontend.common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import com.gu.openplatform.contentapi.model.{MediaAsset, Content => ApiContent}

import org.joda.time.DateTime

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

  private def image(caption: String, width: Int) = {
    MediaAsset("picture", "body", 1, Some("http://www.foo.com/bar"),
      Some(Map("caption" -> caption, "width" -> width.toString)))
  }

}
