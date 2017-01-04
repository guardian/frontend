package model

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.model.v1.{Element => ApiElement, _}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichJodaDateTime

class FaciaDisplayElementTest extends FlatSpec with Matchers {

  behavior of "fromContent"

  it should "create an inline image FaciaDisplayElement" in {

    val faciaDisplayElement = FaciaDisplayElement.fromContent(contentApiResponseWithImages).get
    val inlineImage = faciaDisplayElement.asInstanceOf[InlineImage]

    assert(inlineImage.imageMedia.allImages.size === 2)
  }

  it should "create an inline video FaciaDisplayElement" in {
    val elements = Some(List(
      video("test-video-0", "main", "main video", 500),
      image("test-image-0", "thumbnail", 0, List(imageAsset("smaller picture 1", 50), imageAsset("biggest picture 1", 100)))
    ))
    val videoResponse = contentApiResponseWithImages.copy(elements = elements)

    val videoElement = FaciaDisplayElement.fromContent(videoResponse).get

    val inlineVideo = videoElement.asInstanceOf[InlineVideo]

    assert(inlineVideo.videoElement.videos.videoAssets.size === 1)
    assert(inlineVideo.title === contentApiResponseWithImages.webTitle)
    assert(inlineVideo.endSlatePath === "/video/end-slate/section/test-section.json?shortUrl=https://gu.com/p/5ehd8")
    assert(inlineVideo.fallBack.isDefined)
  }

  it should "return none when no picture or video elements, such as for crosswords" in {
    val crosswordResponse = contentApiResponseWithImages.copy(elements = Some(Nil))

    val crosswordElement = FaciaDisplayElement.fromContent(crosswordResponse)

    assert(crosswordElement.isDefined === false)
  }

  private val contentApiResponseWithImages = contentapi.Content(
    id = "/some/kinda/id",
    sectionId = Some("test-section"),
    sectionName = Some("Test Section"),
    webPublicationDate = Some(new DateTime().toCapiDateTime),
    webTitle = "Some kinda title",
    webUrl = "https://www.theguardian.com/section/some/kinda/id",
    apiUrl = "https://content.guardianapis.com/section/some/kinda/id",
    elements = Some(List(
      image("test-image-0", "main", 0, List(imageAsset("smaller picture 1", 50), imageAsset("biggest picture 1", 100)))
    )),
    fields = Some(ContentFields(
      shortUrl = Some("https://gu.com/p/5ehd8")))
  )

  private def video(id: String, relation: String, caption: String, width: Int): ApiElement = {
    val videoAsset = Asset(AssetType.Video, Some("video/webm"), Some("http://video.com/uri"), Some(AssetFields(caption = Some(caption), width = Some(width))))
    ApiElement(id, relation, ElementType.Video, Some(0), List(videoAsset))
  }

  private def image(id: String, relation: String, index: Int, assets: List[Asset]): ApiElement =
    ApiElement(id, relation, ElementType.Image, Some(0), assets)

  private def imageAsset(caption: String, width: Int): Asset =
    Asset(AssetType.Image, Some("image/jpeg"), Some("http://www.foo.com/bar"),
      Some(AssetFields(caption = Some(caption), width = Some(width))))

}
