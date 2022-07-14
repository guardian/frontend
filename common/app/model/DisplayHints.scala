package model.pressed

import com.gu.facia.api.{models => fapi}
import model.PressedCollectionFormat

final case class DisplayHints(maxItemsToDisplay: Option[Int])

object DisplayHints {
  implicit val displayHintsFormat = PressedCollectionFormat.displayHintsFormat

  def make(displayHints: fapi.DisplayHints): DisplayHints = {
    DisplayHints(displayHints.maxItemsToDisplay)
  }
}
