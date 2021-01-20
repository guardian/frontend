package model.pressed

import com.gu.facia.api.{utils => fapiutils}

object KickerProperties {
  def make(kicker: fapiutils.ItemKicker): KickerProperties = KickerProperties(fapiutils.ItemKicker.kickerText(kicker))
}

final case class KickerProperties(
    kickerText: Option[String],
)
