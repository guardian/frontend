package model.pressed

import com.gu.facia.api.{models => fapi}

final case class DisplayHints(maxItemsToDisplay: Option[Int])

object DisplayHints {
  def make(displayHints: fapi.DisplayHints): DisplayHints = {
    DisplayHints(displayHints.maxItemsToDisplay)
  }
}

