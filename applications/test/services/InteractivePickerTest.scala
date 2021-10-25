package services

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.{ConfiguredTestSuite, TestRequest}
import implicits.HtmlFormat
import play.api.test.Helpers._

@DoNotDiscover class InteractivePickerTest extends FlatSpec with Matchers {
  val path = "/lifeandstyle/ng-interactive/2016/mar/12/stephen-collins-cats-cartoon"
  object MockPressedInteractives {
    private[this] val interactives = Set[String](path)
    def isPressed(path: String): Boolean = interactives.contains(path)
  }

  "Interactive Picker get rendering tier" should "return PressedInteractive if pressed and switched on" in {
    conf.switches.Switches.InteractivePickerFeature.switchOn

    val testRequest = TestRequest(path)
    val tier = InteractivePicker.getRenderingTier(path, MockPressedInteractives.isPressed)(
      testRequest,
    )

    tier should be(PressedInteractive)
  }

  it should "return FrontendLegacy only if the request forces DCR off" in {
    val legacyPath = "/world/live/2021/oct/13/covid-news-live?dcr=false"
    val testRequest = TestRequest(legacyPath)
    val tier =
      InteractivePicker.getRenderingTier(legacyPath, MockPressedInteractives.isPressed)(
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
}
