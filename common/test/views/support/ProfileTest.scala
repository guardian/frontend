package views.support

import com.gu.contentapi.client.model.v1.AssetType
import conf.switches.Switches._
import model.{ImageAsset, ImageMedia}
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}

class ProfileTest extends FlatSpec with Matchers with BeforeAndAfter {

  before {
    ImageServerSwitch.switchOn()
  }

  after {
    ImageServerSwitch.switchOn()
  }

  object HidpiProfileSmall extends Profile(width = Some(100), height = Some(60), hidpi = true)

  val imageAsset: ImageAsset = ImageAsset(
    fields = Map("width" -> "460", "height" -> "276"),
    mediaType = AssetType.Image.name,
    mimeType = Some("image/jpeg"),
    url = Some("https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg")
  )
  val image: ImageMedia = ImageMedia.apply(Seq(imageAsset))

  "A hidpi profile with small width" should "return double the dimensions of the profile for the true dimensions" in {
    HidpiProfileSmall.trueWidthFor(image) should be(Some(200))
    HidpiProfileSmall.trueHeightFor(image) should be(Some(120))
  }

  object HidpiProfileLarge extends Profile(width = Some(1000), height = Some(600), hidpi = true)

  "A hidpi profile with large width" should "return the dimensions of the original asset" in {
    HidpiProfileLarge.trueWidthFor(image) should be(Some(460))
    HidpiProfileLarge.trueHeightFor(image) should be(Some(276))
  }

  "A non hidpi profile with small width" should "return the dimensions of the profile" in {
    Item120.trueWidthFor(image) should be(Some(120))
    Item120.trueHeightFor(image) should be(Some(72))
  }

  "A non hidpi profile with large width" should "return the dimensions of the original asset" in {
    Item1200.trueWidthFor(image) should be(Some(460))
    Item1200.trueHeightFor(image) should be(Some(276))
  }


  "A non hidpi profile with small width and image resizing off" should "return the dimensions of the original asset" in {
    ImageServerSwitch.switchOff()
    Item120.trueWidthFor(image) should be(Some(460))
    Item120.trueHeightFor(image) should be(Some(276))
  }
}
