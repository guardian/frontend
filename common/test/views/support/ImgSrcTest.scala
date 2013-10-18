package views.support

import org.scalatest.FlatSpec
import org.scalatest.matchers.Matchers
import model.{ImageContainer, ImageAsset}
import com.gu.openplatform.contentapi.model.Asset
import conf.Switches.ImageServerSwitch


class ImgSrcTest extends FlatSpec with Matchers  {

  val asset: Asset = Asset(
    "image",
    Some("image/jpeg"),
    Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"),
    Map.empty[String, String]
  )

  val imageAsset = ImageAsset(asset, 1)

  val image = ImageContainer(Seq(imageAsset), null) // yep null, sorry but the tests don't need it

  "ImgSrc" should "convert the URL of the image to the resizing endpoint" in {

    ImageServerSwitch.switchOn()

    GalleryLargeTrail.bestFor(image) should be (Some("http://i.gucode.co.uk/glt/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"))

  }

  it should "not convert the URL of the image if it is disabled" in {

    ImageServerSwitch.switchOff()

    GalleryLargeTrail.bestFor(image) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"))

  }

  it should "not convert the URL of the image if it is a GIF (we do not support animated GIF)" in {

    ImageServerSwitch.switchOn()

    val gifImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), null)
    GalleryLargeTrail.bestFor(gifImage) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))

  }

  it should "not convert the URL of the image if it is not one of ours" in {

    ImageServerSwitch.switchOn()

    val someoneElsesImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), null)
    GalleryLargeTrail.bestFor(someoneElsesImage) should be (Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))

  }


}
