package model

import org.scalatest.FlatSpec
import org.scalatest.Matchers

import com.gu.openplatform.contentapi.model.{ Asset, Element => ApiElement, Content => ApiContent}
import org.joda.time.DateTime

class ElementsTest extends FlatSpec with Matchers {

  "Elements" should "find the biggest crop of the main picture" in {
    val images = new Elements {
      def delegate = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
                                "http://www.guardian.co.uk/foo/2012/jan/07/bar",
                                "http://content.guardianapis.com/foo/2012/jan/07/bar",
                                elements = Some(List(
                                  image("test-image-0","main", 0, List(asset("smaller picture 1",50), asset("biggest picture 1",100))),
                                  image("test-image-1","main", 1, "a single picture 2", 200))),
                                fields = None)
    }

    images.mainPicture.flatMap(_.largestImage.map(_.caption)) should be(Some("biggest picture 1"))
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      caption: String,
                      width: Int): ApiElement = {
    new ApiElement(id, relation, "image", Some(0), List(asset(caption, width)))
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      assets: List[Asset]): ApiElement = {
    new ApiElement(id, relation, "image", Some(0), assets)
  }

  private def asset(caption: String, width: Int): Asset = {
    Asset("image", Some("image/jpeg"), Some("http://www.foo.com/bar"), Map("caption" -> caption, "width" -> width.toString))
  }
}
