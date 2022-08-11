package services

import org.scalatest.DoNotDiscover
import test.TestRequest
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class InteractivePickerTest extends AnyFlatSpec with Matchers {
  val path = "/lifeandstyle/ng-interactive/2016/mar/12/stephen-collins-cats-cartoon"
  object MockPressedInteractives {
    private[this] val interactives = Set[String](path)
    def isPressed(path: String): Boolean = interactives.contains(path)
  }
  conf.switches.Switches.InteractivePickerFeature.switchOn()

  "Interactive Picker get rendering tier" should "return PressedInteractive if pressed and switched on" in {
    val testRequest = TestRequest(path)
    val tier = InteractivePicker.getRenderingTier(path, MockPressedInteractives.isPressed)(
      testRequest,
    )

    tier should be(PressedInteractive)
  }

  it should "return FrontendLegacy if the request forces DCR off" in {
    val testRequest = TestRequest(s"$path?dcr=false")
    val tier =
      InteractivePicker.getRenderingTier(path, MockPressedInteractives.isPressed)(
        testRequest,
      )

    tier should be(FrontendLegacy)
  }

  it should "return DotcomRendering by default" in {
    val unPressedPath = "/world/live/2021/oct/13/covid-news-live"
    val testRequest = TestRequest(unPressedPath)
    val tier =
      InteractivePicker.getRenderingTier(unPressedPath, MockPressedInteractives.isPressed)(
        testRequest,
      )

    tier should be(DotcomRendering)
  }

  it should "return DotcomRendering if interactive is pressed and dcr=true" in {
    val testRequest = TestRequest(s"$path?dcr=true")
    val tier =
      InteractivePicker.getRenderingTier(path, MockPressedInteractives.isPressed)(
        testRequest,
      )

    tier should be(DotcomRendering)
  }
}
