package services

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.{ConfiguredTestSuite, TestRequest}
import implicits.HtmlFormat
import play.api.test.Helpers._
import experiments.ShowPressedInteractives

import java.time.LocalDateTime

@DoNotDiscover class InteractivePickerTest extends FlatSpec with Matchers {
  val path = "lifeandstyle/ng-interactive/2016/mar/12/stephen-collins-cats-cartoon"
  object MockPressedInteractives {
    private[this] val interactives = Set[String](path)
    def isPressed(path: String): Boolean = interactives.contains(path)
  }
  val date = LocalDateTime.now

  "Interactive Picker get rendering tier" should "return InteractiveLegacy if pressed and not amp and part of experiment" in {
    conf.switches.Switches.ServerSideExperiments.switchOn
    ShowPressedInteractives.switch.switchOn()

    val testRequest = TestRequest(path)
      .withHeaders(
        ShowPressedInteractives.participationGroup.headerName -> "variant",
      )
    val tags = List()
    val requestFormat = HtmlFormat
    val tier = InteractivePicker.getRenderingTier(requestFormat, path, date, tags, MockPressedInteractives.isPressed)(
      testRequest,
    )

    tier should be(InteractiveLegacy)
  }
}
