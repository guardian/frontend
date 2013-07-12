package views.support

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import model.Image
import com.gu.openplatform.contentapi.model.MediaAsset
import conf.Switches.ImageServerSwitch


class ImgSrcTest extends FlatSpec with ShouldMatchers  {



  val imageAsset = MediaAsset(
    "picture",
    "body",
    2,
    Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"),
    None,
    Nil
  )

  "ImgSrc" should "convert the URL of the image to the resizing endpoint" in {

    ImageServerSwitch.switchOn()

    ImgSrc(Image(imageAsset), GalleryLargeTrail) should be ("http://i.gucode.co.uk/glt/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg")

  }

  it should "not convert the URL of the image if it is disabled" in {

    ImageServerSwitch.switchOff()

    ImgSrc(Image(imageAsset), GalleryLargeTrail) should be ("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg")

  }

  it should "not convert the URL of the image if it is a GIF (we do not support animated GIF)" in {

    ImageServerSwitch.switchOn()

    val gifImage = Image(imageAsset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")))
    ImgSrc(gifImage, GalleryLargeTrail) should be ("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")

  }

  it should "not convert the URL of the image if it is not one of ours" in {

    ImageServerSwitch.switchOn()

    val someoneElsesImage = Image(imageAsset.copy(file = Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")))
    ImgSrc(someoneElsesImage, GalleryLargeTrail) should be ("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")

  }


}
