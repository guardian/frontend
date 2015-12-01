package views.support

import com.gu.contentapi.client.model.{Asset, Content, Element, Tag}
import conf.Configuration
import conf.switches.Switches.ImageServerSwitch
import model.{ImageAsset, ImageContainer}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.OneAppPerSuite

class ImgSrcTest extends FlatSpec with Matchers with OneAppPerSuite {

  lazy val imageHost = Configuration.images.path

  val asset = Asset(
    "image",
    Some("image/jpeg"),
    Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"),
    Map.empty[String, String]
  )

  val element = Element("elementId", "main", "image", Some(1), List(asset))

  val tag = List(Tag(id = "type/article", `type` = "keyword", webTitle = "",
      sectionId = None, sectionName = None, webUrl = "", apiUrl = "apiurl", references = Nil))

  val content = Content(id = "foo/2012/jan/07/bar",
    sectionId = None,
    sectionName = None,
    webPublicationDateOption = Some(new DateTime),
    webTitle = "Some article",
    webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
    tags = tag,
    elements = Some(List(element))
  )

  val imageAsset = ImageAsset(asset, 1)

  val image = ImageContainer(Seq(imageAsset), element, imageAsset.index) // yep null, sorry but the tests don't need it

  val mediaImageAsset = ImageAsset(Asset(
    "image",
    Some("image/jpeg"),
    Some("http://media.guim.co.uk/knly7wcp46fuadowlsnitzpawm/437_0_3819_2291/1000.jpg"),
    Map.empty[String, String]
  ), 1)

  val mediaImage = ImageContainer(Seq(mediaImageAsset), element, mediaImageAsset.index)


  "ImgSrc" should "convert the URL of a static image to the resizing endpoint with a /static prefix" in {
    ImageServerSwitch.switchOn()
      Item700.bestFor(image) should be (Some(s"$imageHost/img/static/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg?w=700&q=85&auto=format&sharp=10&s=70cbadc4c6d3f932fe763721dd8ba5ac"))
  }

  it should "convert the URL of a media service to the resizing endpoint with a /media prefix" in {
    ImageServerSwitch.switchOn()
      Item700.bestFor(mediaImage) should be (Some(s"$imageHost/img/media/knly7wcp46fuadowlsnitzpawm/437_0_3819_2291/1000.jpg?w=700&q=85&auto=format&sharp=10&s=47061238050fb440cc090b52c2f2354f"))
  }

  it should "not convert the URL of the image if it is disabled" in {
    ImageServerSwitch.switchOff()
    Item700.bestFor(image) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"))
  }

  it should "convert the URL of the image if it is a PNG" in {
    ImageServerSwitch.switchOn()
    val pngImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/contributor/2014/10/30/1414675415419/Jessica-Valenti-R.png")),0)), element, 0)
    Item700.bestFor(pngImage) should be (Some(s"$imageHost/img/static/sys-images/Guardian/Pix/contributor/2014/10/30/1414675415419/Jessica-Valenti-R.png?w=700&q=85&auto=format&sharp=10&s=454c03a065f89e05748e41457c3bcb32"))
  }

  it should "not convert the URL of the image if it is a GIF (we do not support animated GIF)" in {
    ImageServerSwitch.switchOn()
    val gifImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), element, 0)
    Item700.bestFor(gifImage) should be (Some("http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))
  }

  it should "not convert the URL of the image if it is not one of ours" in {
    ImageServerSwitch.switchOn()
    val someoneElsesImage = ImageContainer(Seq(ImageAsset(asset.copy(file = Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif")),0)), element, 0)
    Item700.bestFor(someoneElsesImage) should be (Some("http://foo.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.gif"))
  }
}
