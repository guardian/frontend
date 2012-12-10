package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import com.gu.openplatform.contentapi.model.{ MediaAsset, Content => ApiContent, Tag => ApiTag }

class ImagesTest extends FlatSpec with ShouldMatchers {

  "Images" should "find exact size image" in {
    val imageMedia = List(image("too small", 50), image("exact size", 70), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.imageOfWidth(70).get.caption should be(Some("exact size"))
  }

  it should "not find any images if there are none in range" in {

    val imageMedia = List(image("too small", 50), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.imageOfWidth(70, tolerance = 10) should be(None)
  }

  it should "find exact size image even if there are others in the size range" in {

    val imageMedia = List(image("too small", 50), image("nearly right", 69),
      image("exact size", 70), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.imageOfWidth(70, tolerance = 10).get.caption should be(Some("exact size"))
  }

  it should "find image with closest size in range" in {

    val imageMedia = List(image("too small", 50), image("find me", 69),
      image("i will lose out", 75), image("too big", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.imageOfWidth(70, tolerance = 10).get.caption should be(Some("find me"))
  }

  it should "understand that in body pictures are not main pictures" in {

    val imageMedia = List(image("a", 50), image("b", 69), image("c", 70), image("d", 100))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
      override lazy val inBodyPictureCount = 4
    }

    images.hasMainPicture should be(false)
  }

  it should "understand that main image is the image of type 'body' with an index of 1" in {

    val imageMedia = List(image("a", 50, index = 2), image("b", 69, index = 1),
      image("c", 70, index = 3), image("d", 100, index = 4))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
      override lazy val inBodyPictureCount = 3
    }

    images.hasMainPicture should be(true)
    images.mainPicture.isDefined should be(true)
    images.mainPicture.foreach(_.index should be(1))
  }

  it should "understand that main image is the image of rel 'gallery' with an index of 1" in {

    val imageMedia = List(image("a", 50, rel = "gallery", index = 1), image("b", 69, rel = "gallery", index = 2))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.hasMainPicture should be(true)
    images.mainPicture.size should be(1)
    images.mainPicture.foreach(_.caption should be(Some("a")))
  }

  it should "understand that main image is the image of type 'video' and rel 'body' with an index of 1" in {

    val imageMedia = List(image("a", 50, `type` = "video", index = 1), image("b", 69, `type` = "video", index = 2))

    val images = new Images {
      def images = Nil
      def videoImages = imageMedia.map(Image(_))
    }

    images.mainPicture.size should be(1)
    images.mainPicture.foreach(_.caption should be(Some("a")))
  }

  it should "return crops with index 1 if more than one body picture" in {

    val imageMedia = List(image("a", 50, index = 1), image("b", 69, index = 2), image("c", 50, rel = "alt-size", index = 1), image("d", 69, rel = "alt-size", index = 2))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.mainPicture(50).foreach { crop =>
      crop.index should be(1)
      crop.caption should be(Some("c"))
    }
  }

  it should "get a crop of the main pic of a specific size" in {

    val imageMedia = List(image("a", 50, rel = "alt-size"), image("b", 69),
      image("crop", 70, rel = "alt-size"), image("d", 100, rel = "alt-size"))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.mainPicture(70).isDefined should be(true)
    images.mainPicture(70).foreach(_.caption should be(Some("crop")))
  }

  it should "get the main picture if crop size is not available" in {

    val imageMedia = List(image("a", 50, rel = "alt-size"), image("main pic", 69),
      image("c", 70, rel = "alt-size"), image("d", 100, rel = "alt-size"))

    val images = new Images {
      def images = imageMedia.map(Image(_))
      def videoImages = Nil
    }

    images.mainPicture(69).isDefined should be(true)
    images.mainPicture(69).foreach(_.caption should be(Some("main pic")))
  }

  private def image(caption: String, width: Int, rel: String = "body", index: Int = 1, `type`: String = "picture") = {
    MediaAsset(`type`, rel, 1, Some("http://www.foo.com/bar"),
      Some(Map("caption" -> caption, "width" -> width.toString)))
  }
}
