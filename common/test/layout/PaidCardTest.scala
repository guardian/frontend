package layout

import common.facia.FixtureBuilder.mkPressedCuratedContent
import model.pressed.{FreeHtmlKicker, ItemKicker, KickerProperties}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.OptionValues
import org.scalatest.matchers.should.Matchers

class PaidCardTest extends AnyFlatSpec with Matchers with OptionValues {

  private def mkKicker(): ItemKicker =
    FreeHtmlKicker(
      properties = KickerProperties(kickerText = Some("kicker!!!")),
      body = "kicker!!!",
    )

  "fromPressedContent" should "populate kicker" in {
    val pressedContent = mkPressedCuratedContent(1, kicker = Some(mkKicker()))
    val card = PaidCard.fromPressedContent(pressedContent)
    card.kicker.value shouldBe "kicker!!!"
  }
}
