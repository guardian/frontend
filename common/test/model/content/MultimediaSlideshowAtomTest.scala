package model.content

import com.gu.contentatom.thrift.atom.media.{Category, MediaAtom => ThriftMediaAtom}
import com.gu.contentatom.thrift.{
  AtomData,
  AtomType,
  ContentChangeDetails,
  Atom => ThriftAtom,
  Image => ThriftImage,
  ImageAsset => ThriftImageAsset,
  ImageAssetDimensions,
}
import com.gu.facia.api.models.{FaciaMultimediaSlideshow, FaciaSlide, FaciaSlideImage, FaciaSlideVideo}
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

  private val thriftVideoAtom = ThriftAtom(
    id = "media-atom-123",
    atomType = AtomType.Media,
    labels = Nil,
    defaultHtml = "",
    data = AtomData.Media(ThriftMediaAtom(assets = Nil, title = "My video", category = Category.News)),
    contentChangeDetails = ContentChangeDetails(revision = 1),
  )

  private val faciaSlideshow = FaciaMultimediaSlideshow(
    id = "atom-1",
    title = Some("My slideshow"),
    aspectRatio = Some("5:4"),
    slides = List(
      FaciaSlide(FaciaSlideImage(thriftImage), Some("A caption"), Some("A label"), Some("A credit")),
      FaciaSlide(FaciaSlideVideo(thriftVideoAtom), None, None, None),
    ),
  )

  "fromFacia" should "map the title, aspect ratio and each slide" in {
    val atom = MultimediaSlideshowAtom.fromFacia(faciaSlideshow)

    atom.id shouldBe "atom-1"
    atom.title shouldBe Some("My slideshow")
    atom.aspectRatio shouldBe Some("5:4")
    atom.slides should have size 2
  }

  it should "convert an image slide into an ImageMedia" in {
    val atom = MultimediaSlideshowAtom.fromFacia(faciaSlideshow)

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

  it should "include the full media atom for a video slide" in {
    val atom = MultimediaSlideshowAtom.fromFacia(faciaSlideshow)

    atom.slides(1).content match {
      case MultimediaSlideshowVideo(mediaAtom) =>
        mediaAtom.id shouldBe "media-atom-123"
        mediaAtom.title shouldBe "My video"
      case other => fail(s"Expected a video slide, got $other")
    }
  }

  "MultimediaSlideshowAtom JSON format" should "round-trip" in {
    implicit val format = PressedContentFormat.multimediaSlideshowAtomFormat
    val atom = MultimediaSlideshowAtom.fromFacia(faciaSlideshow)

    Json.toJson(atom).as[MultimediaSlideshowAtom] shouldBe atom
  }
}
