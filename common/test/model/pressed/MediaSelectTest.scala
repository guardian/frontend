package model.pressed

import model.PressedContentFormat.mediaSelectFormat
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json

class MediaSelectTest extends AnyFlatSpec with Matchers {

  "MediaSelect JSON format" should "read fronts pressed before multimediaSlideshowReplace existed" in {
    val json = Json.parse("""{"showMainVideo":false,"imageSlideshowReplace":true,"videoReplace":false}""")

    json.as[MediaSelect] shouldBe MediaSelect(
      showMainVideo = false,
      imageSlideshowReplace = true,
      videoReplace = false,
      multimediaSlideshowReplace = false,
    )
  }

  it should "round-trip multimediaSlideshowReplace" in {
    val mediaSelect = MediaSelect(
      showMainVideo = false,
      imageSlideshowReplace = false,
      videoReplace = false,
      multimediaSlideshowReplace = true,
    )

    Json.toJson(mediaSelect).as[MediaSelect] shouldBe mediaSelect
  }
}
