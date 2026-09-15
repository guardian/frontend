package model.content

import com.gu.contentatom.thrift.atom.multimediaslideshow.{
  MediaReference,
  Slide,
  SlideContent,
  MultimediaSlideshowAtom => ThriftMultimediaSlideshowAtom,
}
import com.gu.contentatom.thrift.{Image => ThriftImage, ImageAsset => ThriftImageAsset, ImageAssetDimensions}
import model.PressedContentFormat
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json

class MultimediaSlideshowAtomTest extends AnyFlatSpec with Matchers {

  private val thriftImage = ThriftImage(
    assets = Seq(
      ThriftImageAsset(
        mimeType = Some("image/jpeg"),
        file = "https://example.com/image.jpg",
        dimensions = Some(ImageAssetDimensions(height = 400, width = 600)),
        credit = Some("A credit"),
      ),
    ),
    master = None,
    mediaId = "media-id",
  )

  private val thriftAtom = ThriftMultimediaSlideshowAtom(
    slides = Seq(
      Slide(
        content = SlideContent.Image(thriftImage),
        caption = Some("A caption"),
        label = Some("A label"),
        credit = Some("A credit"),
      ),
      Slide(
        content = SlideContent.MediaAtom(MediaReference(mediaAtomId = "media-atom-123")),
        caption = None,
        label = None,
        credit = None,
      ),
    ),
    title = Some("My slideshow"),
  )

  "makeFromThrift" should "map the title and each slide" in {
    val atom = MultimediaSlideshowAtom.makeFromThrift("atom-1", thriftAtom)

    atom.id shouldBe "atom-1"
    atom.title shouldBe Some("My slideshow")
    atom.slides should have size 2
  }

  it should "convert an image slide into an ImageMedia" in {
    val atom = MultimediaSlideshowAtom.makeFromThrift("atom-1", thriftAtom)

    atom.slides.head.caption shouldBe Some("A caption")
    atom.slides.head.label shouldBe Some("A label")
    atom.slides.head.credit shouldBe Some("A credit")
    atom.slides.head.content match {
      case MultimediaSlideshowImage(image) =>
        image.allImages.head.url shouldBe Some("https://example.com/image.jpg")
        image.allImages.head.width shouldBe 600
      case other => fail(s"Expected an image slide, got $other")
    }
  }

  it should "keep the media atom reference for a video slide" in {
    val atom = MultimediaSlideshowAtom.makeFromThrift("atom-1", thriftAtom)

    atom.slides(1).content shouldBe MultimediaSlideshowVideo("media-atom-123")
  }

  "MultimediaSlideshowAtom JSON format" should "round-trip" in {
    implicit val format = PressedContentFormat.multimediaSlideshowAtomFormat
    val atom = MultimediaSlideshowAtom.makeFromThrift("atom-1", thriftAtom)

    Json.toJson(atom).as[MultimediaSlideshowAtom] shouldBe atom
  }
}
