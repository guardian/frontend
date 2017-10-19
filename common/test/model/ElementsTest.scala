package model

import java.time.ZoneOffset
import implicits.Dates.jodaToJavaInstant
import com.gu.contentapi.client.model.v1.{Asset, AssetFields, AssetType, ElementType, Content => ApiContent, Element => ApiElement}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import contentapi.FixtureTemplates
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite

class ElementsTest extends FlatSpec with Matchers with GuiceOneAppPerSuite {

  "Elements" should "find the biggest crop of the main picture" in {

    val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)
    val images: Elements = Content(
      ApiContent(id = "foo/2012/jan/07/bar",
        sectionId = None,
        sectionName = None,
        webPublicationDate = Some(offsetDate.toCapiDateTime),
        webTitle = "Some article",
        webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
        apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
        elements = Some(List(
          image("test-image-0", "main", 0, List(asset("smaller picture 1", 50), asset("biggest picture 1", 100))),
          image("test-image-1", "main", 1, "a single picture 2", 200))),
        fields = None)
    ).elements

    images.mainPicture.flatMap(_.images.largestImage.flatMap(_.caption)) should be(Some("biggest picture 1"))
  }

  def thumbnailFixture(crops: (Int, Int)*): ApiElement = FixtureTemplates.emptyElement.copy(
    `type` = ElementType.Image,
    relation = "thumbnail",
    assets = crops.toList map { case (width, height) =>
      FixtureTemplates.emptyAsset.copy(
        `type` = AssetType.Image,
        mimeType = Some("image/jpeg"),
        typeData = Some(AssetFields(
          width = Some(width),
          height = Some(height)
        ))
      )
    }
  )

  "trailPicture" should "find an asset with an aspect ratio within 1% of the desired aspect ratio" in {
    val theImage = thumbnailFixture((504, 300))

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(theImage))
      )
    ).trail.trailPicture.map(_.allImages.headOption.exists( image =>
      image.width == 504 && image.height == 300
    )) shouldBe Some(true)
  }

  it should "reject images more than 1% from the desired aspect ratio" in {
    val theImage = thumbnailFixture((506, 300))

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(theImage))
      )
    ).trail.trailPicture shouldEqual None
  }

  it should "not die if an image has 0 height or width" in {

    Content(
      FixtureTemplates.emptyApiContent.copy(
        elements = Some(List(
          thumbnailFixture((0, 300), (500, 0), (500, 300))
        ))
      )
    ).trail.trailPicture shouldBe defined
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      caption: String,
                      width: Int): ApiElement = {
    ApiElement(id, relation, ElementType.Image, Some(0), List(asset(caption, width)))
  }

  private def image(  id: String,
                      relation: String,
                      index: Int,
                      assets: List[Asset]): ApiElement = {
    ApiElement(id, relation, ElementType.Image, Some(0), assets)
  }

  private def asset(caption: String, width: Int): Asset = {
    Asset(AssetType.Image, Some("image/jpeg"), Some("http://www.foo.com/bar"),
      Some(AssetFields(caption = Some(caption), width = Some(width))))
  }
}
