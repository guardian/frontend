package views.support

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import model.{ImageContainer, ImageAsset}
import com.gu.contentapi.client.model.Asset
import conf.Switches.{ImageServerSwitch, PngResizingSwitch}
import conf.Configuration


class ImgSrcTest extends FlatSpec with Matchers  {

  val imageHost = Configuration.images.path

  val asset: Asset = Asset(
    "image",
    Some("image/jpeg"),
    Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"),
    Map.empty[String, String]
  )

  val imageAsset = ImageAsset(asset, 1)

  val image = ImageContainer(Seq(imageAsset), null, imageAsset.index) // yep null, sorry but the tests don't need it

  val mediaImageAsset = ImageAsset(Asset(
    "image",
    Some("image/jpeg"),
    Some("http://media.guim.co.uk/knly7wcp46fuadowlsnitzpawm/437_0_3819_2291/1000.jpg"),
    Map.empty[String, String]
  ), 1)

  val mediaImage = ImageContainer(Seq(mediaImageAsset), null, mediaImageAsset.index)


  "ImgSrc" should "convert the URL of a static image to the resizing endpoint with a /static prefix" in {
    ImageServerSwitch.switchOn()
      GalleryLargeTrail.bestFor(image) should be (Some(s"$imageHost/static/w-480/h-288/q-95/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"))
  }

  it should "convert the URL of a media service to the resizing endpoint with a /media prefix" in {
    ImageServerSwitch.switchOn()
      GalleryLargeTrail.bestFor(mediaImage) should be (Some(s"$imageHost/media/w-480/h-288/q-95/knly7wcp46fuadowlsnitzpawm/437_0_3819_2291/1000.jpg"))
  }

  it should "not convert the URL of the image if it is disabled" in {
    ImageServerSwitch.switchOff()
    GalleryLargeTrail.bestFor(image) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"))
  }

  it should "convert the URL of the image if it is a PNG" in {
    ImageServerSwitch.switchOn()
    PngResizingSwitch.switchOn()
    val pngImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/contributor/2014/10/30/1414675415419/Jessica-Valenti-R.png")),0)), null, 0)
    GalleryLargeTrail.bestFor(pngImage) should be (Some(s"$imageHost/static/w-480/h-288/q-95/sys-images/Guardian/Pix/contributor/2014/10/30/1414675415419/Jessica-Valenti-R.png"))
  }

  it should "not convert the URL of the image if it is a GIF (we do not support animated GIF)" in {
    ImageServerSwitch.switchOn()
    val gifImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), null, 0)
    GalleryLargeTrail.bestFor(gifImage) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))
  }

  it should "not convert the URL of the image if it is not one of ours" in {
    ImageServerSwitch.switchOn()
    val someoneElsesImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), null, 0)
    GalleryLargeTrail.bestFor(someoneElsesImage) should be (Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))
  }
}
