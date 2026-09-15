package frontpress

import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.contentatom.thrift.atom.media.{Category, MediaAtom => ThriftMediaAtom}
import com.gu.contentatom.thrift.{Atom, AtomData}
import common.GuLogging
import common.facia.FixtureBuilder
import model.ImageMedia
import model.content.{
  MultimediaSlideshowAtom,
  MultimediaSlideshowImage,
  MultimediaSlideshowSlide,
  MultimediaSlideshowVideo,
}
import model.pressed.CuratedContent
import org.mockito.Mockito._
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.Future

class MultimediaSlideshowResolutionTest extends AsyncFlatSpec with Matchers with MockitoSugar with GuLogging {

  private val mediaAtomId = "media-atom-123"

  private def videoSlide(id: String = mediaAtomId): MultimediaSlideshowSlide =
    MultimediaSlideshowSlide(MultimediaSlideshowVideo(id), None, None, None)

  private def curatedWithSlideshow(slides: Seq[MultimediaSlideshowSlide]): CuratedContent = {
    val slideshow = MultimediaSlideshowAtom("slideshow-1", Some("My slideshow"), slides)
    FixtureBuilder
      .mkPressedCuratedContent(1)
      .asInstanceOf[CuratedContent]
      .copy(multimediaSlideshowAtom = Some(slideshow))
  }

  private def mockCapiMediaResponse(id: String, media: Option[Atom]): CapiContentApiClient = {
    val capiClient = mock[CapiContentApiClient]
    val mockResponse = mock[ItemResponse]
    when(mockResponse.media).thenReturn(media)
    when(capiClient.getResponse(ItemQuery(s"atom/media/$id"))).thenReturn(Future.successful(mockResponse))
    capiClient
  }

  private def mockCapiFailure(id: String): CapiContentApiClient = {
    val capiClient = mock[CapiContentApiClient]
    when(capiClient.getResponse(ItemQuery(s"atom/media/$id")))
      .thenReturn(Future.failed(new Exception("Error message from CAPI")))
    capiClient
  }

  private def thriftMediaAtom(id: String): Atom = {
    val mockAtom = mock[Atom]
    when(mockAtom.id).thenReturn(id)
    when(mockAtom.defaultHtml).thenReturn("")
    when(mockAtom.data).thenReturn(AtomData.Media(ThriftMediaAtom(title = "My video", category = Category.News)))
    mockAtom
  }

  "resolveMultimediaSlideshowVideos" should "inline the resolved media atom for a video slide" in {
    val capiClient = mockCapiMediaResponse(mediaAtomId, Some(thriftMediaAtom(mediaAtomId)))
    val content = curatedWithSlideshow(Seq(videoSlide()))

    Enrichment
      .resolveMultimediaSlideshowVideos(content, capiClient)
      .fold(
        err => fail(s"Expected a resolved content, got error $err"),
        {
          case resolved: CuratedContent =>
            resolved.multimediaSlideshowAtom.get.slides.head.content match {
              case MultimediaSlideshowVideo(id, Some(atom)) =>
                id shouldBe mediaAtomId
                atom.id shouldBe mediaAtomId
                atom.title shouldBe "My video"
              case other => fail(s"Expected a resolved video slide, got $other")
            }
          case other => fail(s"Expected a curated content, got $other")
        },
      )
  }

  it should "keep the slide id-only when CAPI resolution fails" in {
    val capiClient = mockCapiFailure(mediaAtomId)
    val content = curatedWithSlideshow(Seq(videoSlide()))

    Enrichment
      .resolveMultimediaSlideshowVideos(content, capiClient)
      .fold(
        err => fail(s"Expected a resolved content, got error $err"),
        {
          case resolved: CuratedContent =>
            resolved.multimediaSlideshowAtom.get.slides.head.content shouldBe MultimediaSlideshowVideo(
              mediaAtomId,
              None,
            )
          case other => fail(s"Expected a curated content, got $other")
        },
      )
  }

  it should "keep the slide id-only when CAPI returns no media atom" in {
    val capiClient = mockCapiMediaResponse(mediaAtomId, None)
    val content = curatedWithSlideshow(Seq(videoSlide()))

    Enrichment
      .resolveMultimediaSlideshowVideos(content, capiClient)
      .fold(
        err => fail(s"Expected a resolved content, got error $err"),
        {
          case resolved: CuratedContent =>
            resolved.multimediaSlideshowAtom.get.slides.head.content shouldBe MultimediaSlideshowVideo(
              mediaAtomId,
              None,
            )
          case other => fail(s"Expected a curated content, got $other")
        },
      )
  }

  it should "not call CAPI when the slideshow has no video slides" in {
    val capiClient = mock[CapiContentApiClient]
    val imageSlide = MultimediaSlideshowSlide(MultimediaSlideshowImage(ImageMedia(Nil)), None, None, None)
    val content = curatedWithSlideshow(Seq(imageSlide))

    Enrichment
      .resolveMultimediaSlideshowVideos(content, capiClient)
      .fold(
        err => fail(s"Expected a resolved content, got error $err"),
        { result =>
          verifyNoInteractions(capiClient)
          result shouldBe content
        },
      )
  }

  it should "leave content without a slideshow unchanged" in {
    val capiClient = mock[CapiContentApiClient]
    val content = FixtureBuilder.mkPressedCuratedContent(1).asInstanceOf[CuratedContent]

    Enrichment
      .resolveMultimediaSlideshowVideos(content, capiClient)
      .fold(
        err => fail(s"Expected a resolved content, got error $err"),
        { result =>
          verifyNoInteractions(capiClient)
          result shouldBe content
        },
      )
  }
}
