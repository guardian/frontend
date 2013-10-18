package model

import org.scalatest.FlatSpec
import org.scalatest.Matchers

import com.gu.openplatform.contentapi.model.{ Asset, MediaAsset, Element => ApiElement, Content => ApiContent, Tag => ApiTag }

class ElementsTest extends FlatSpec with Matchers {

  "Elements" should "find the biggest crops of all the pictures" in {
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
