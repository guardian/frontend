package common.commercial

import common.commercial.FixtureBuilder.mkPressedContent
import model.pressed.{FreeHtmlKicker, ItemKicker, KickerProperties}
import org.scalatest.{FlatSpec, Matchers, OptionValues}

class CardContentTest extends FlatSpec with Matchers with OptionValues {

  private def mkKicker(): ItemKicker = FreeHtmlKicker(
    properties = KickerProperties(kickerText = Some("kicker!!!")),
    body = "kicker!!!"
  )

  "fromPressedContent" should "populate kicker" in {
    val pressedContent = mkPressedContent(1, kicker = Some(mkKicker()))
    val card = CardContent.fromPressedContent(pressedContent)
    card.kicker.value shouldBe "kicker!!!"
  }
}
