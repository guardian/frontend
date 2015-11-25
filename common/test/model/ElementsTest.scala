package model

import com.gu.contentapi.client.model.{Asset, Content => ApiContent, Element => ApiElement}
import contentapi.FixtureTemplates
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

class ElementsTest extends FlatSpec with Matchers {

  "Elements" should "find the biggest crop of the main picture" in {
    val images: Elements = Content(
      ApiContent(id = "foo/2012/jan/07/bar",
        sectionId = None,
        sectionName = None,
        webPublicationDateOption = Some(new DateTime),
        webTitle = "Some article",
        webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
        apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
        elements = Some(List(
          image("test-image-0", "main", 0, List(asset("smaller picture 1", 50), asset("biggest picture 1", 100))),
          image("test-image-1", "main", 1, "a single picture 2", 200))),
        fields = None)
    )

    images.mainPicture.flatMap(_.largestImage.flatMap(_.caption)) should be(Some("biggest picture 1"))
  }

  def thumbnailFixture(crops: (Int, Int)*) = FixtureTemplates.emptyElement.copy(
    `type` = "image",
    relation = "thumbnail",
    assets = crops.toList map { case (width, height) =>
      FixtureTemplates.emptyAsset.copy(
        `type` = "image",
        mimeType = Some("image/jpeg"),
        typeData = Map(
          "width" -> width.toString,
          "height" -> height.toString
        )
      )
    }
  )

  "trailPicture" should "find an asset with an aspect ratio within 1% of the desired aspect ratio" in {
    val theImage = thumbnailFixture((504, 300))

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(theImage))
      )
    ).trailPicture(5, 3).map(_.delegate) shouldEqual Some(theImage)
  }

  it should "reject images more than 1% from the desired aspect ratio" in {
    val theImage = thumbnailFixture((506, 300))

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(theImage))
      )
    ).trailPicture(5, 3).map(_.delegate) shouldEqual None
  }

  it should "not die if an image has 0 height or width" in {
    val theImage = thumbnailFixture((500, 300))

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(
          thumbnailFixture((0, 300), (500, 0), (500, 300))
        ))
      )
    ).trailPicture(5, 3) shouldBe defined
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
