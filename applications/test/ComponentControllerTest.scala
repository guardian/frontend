package controllers

import model.{EventGraphic, Thrasher}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.ws.WSClient
import play.api.test.Helpers.stubControllerComponents
import renderers.DotcomRenderingService

class ComponentControllerTest extends AnyFlatSpec with Matchers with MockitoSugar {
  private val controller = new ComponentController(
    mock[WSClient],
    stubControllerComponents(),
    mock[DotcomRenderingService],
  )

  "getComponentType" should "parse accepted event graphic paths" in {
    controller.getComponentType("event-graphic/us-election-2024") shouldBe EventGraphic.fromId("us-election-2024")
    controller.getComponentType("event-graphic/us-mid-election-2026") shouldBe EventGraphic.fromId(
      "us-mid-election-2026",
    )
  }

  it should "reject an event graphic id that is not accepted" in {
    controller.getComponentType("event-graphic/us-election-2026") shouldBe None
    controller.getComponentType("event-graphic/election-tracker/us-election-2026") shouldBe None
  }

  it should "parse a thrasher path" in {
    controller.getComponentType("thrasher/world-cup-2026") shouldBe Some(Thrasher("world-cup-2026"))
  }

  it should "reject unsupported or malformed paths" in {
    controller.getComponentType("unknown/example") shouldBe None
    controller.getComponentType("event-graphic") shouldBe None
    controller.getComponentType("event-graphic/") shouldBe None
  }
}
