package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import com.gu.openplatform.contentapi.model.{ Asset, MediaAsset, Element => ApiElement, Content => ApiContent, Tag => ApiTag }

class ElementsTest extends FlatSpec with ShouldMatchers {

  "Images" should "find exact size image" in {

    val images = new Elements {
      override def images = List(image("test-image-0","body", 0,"too small",50),
                        image("test-image-1","body", 1, "exact size",70),
                        image("test-image-2","body", 2, "too big",100))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.imageOfWidth(70).get.caption should be(Some("exact size"))
  }

  it should "find the main picture if exact width can't be found" in {

    val images = new Elements {
      override def images = List(image("test-image-0","body", 0, "too big", 100),
                        image("test-image-1","body", 1, "close to size",69),
                        image("test-image-2","body", 2, "most appropriate",50))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = images.find(_.delegate.id == "test-image-2").headOption.flatMap(_.largestImage)
      override def mainVideo = None
    }

    images.imageOfWidth(70).get.caption should be(Some("most appropriate"))
  }

  it should "find the main picture based on lowest index (primary) and biggest width (secondary)" in {

    val images = new Elements {
      override def images = List(image("test-image-0","body", 0, "main picture",50),
                        image("test-image-1","body", 1, "picture 2",69),
                        image("test-image-2","body", 2, "picture 3",100))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.largestMainPicture.get.caption should be(Some("main picture"))
  }

  it should "find a video-based picture if no images are available" in {
    val images = new Elements {
      override def videos = List(video("test-image-0","body", 0, "main video picture",50),
                        video("test-image-1","body", 1, "picture 2",70),
                        video("test-image-2","body", 2, "picture 3",100))
      override def images = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.largestMainPicture.get.caption should be(Some("main video picture"))
  }

  it should "find the biggest crop of the main picture" in {
    val images = new Elements {
      override def images = List(image("test-image-0","body", 0, List(asset("main picture 1",50), asset("biggest main picture",100))),
                        image("test-image-1","body", 1, "a big-but-not-main picture",200))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.largestMainPicture.get.caption should be(Some("biggest main picture"))
  }

  it should "find the biggest crops of all the pictures" in {
    val images = new Elements {
      override def images = List(
                        image("test-image-0","body", 0, List(asset("smaller picture 1",50), asset("biggest picture 1",100))),
                        image("test-image-1","body", 1, "a single picture 2", 200))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.largestCrops(0).caption should be(Some("biggest picture 1"))
    images.largestCrops(1).caption should be(Some("a single picture 2"))
  }

  it should "get a crop of the main pic of a specific size" in {

    val images = new Elements {
      override def images = List(image("test-image-0","body", 0, List(asset("main picture 1",50), asset("main picture 2",80), asset("biggest main picture",100))),
        image("test-image-1","body", 1, "a correct but not-main picture",80))
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
      override def mainVideo = None
    }

    images.mainPicture(80).get.caption should be(Some("main picture 2"))
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      caption: String,
                      width: Int): ImageElement = {
    new ImageElement(ApiElement(id, relation, "image", Some(0), List(asset(caption, width))))
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      assets: List[Asset]): ImageElement = {
    new ImageElement(ApiElement(id, relation, "image", Some(0), assets))
  }

  private def video(  id: String,
                      relation: String,
                      index: Int,
                      caption: String,
                      width: Int): VideoElement = {
    new VideoElement(ApiElement(id, relation, "video", Some(0), List(asset(caption, width))))
  }

  private def asset(caption: String, width: Int): Asset = {
    Asset("image", Some("image/jpeg"), Some("http://www.foo.com/bar"), Map("caption" -> caption, "width" -> width.toString))
  }
}
