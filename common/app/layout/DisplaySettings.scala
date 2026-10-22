package layout

import com.gu.facia.api.utils.BoostLevel
import model.pressed._

case class DisplaySettings(
    boostLevel: Option[BoostLevel],
    isImmersive: Option[Boolean],
    showBoostedHeadline: Boolean,
    showQuotedHeadline: Boolean,
    imageHide: Boolean,
    showLivePlayable: Boolean,
)

object DisplaySettings {
  def fromTrail(faciaContent: PressedContent): DisplaySettings =
    DisplaySettings(
      faciaContent.display.boostLevel,
      faciaContent.display.isImmersive,
      faciaContent.display.showBoostedHeadline,
      faciaContent.display.showQuotedHeadline,
      faciaContent.display.imageHide,
      faciaContent.display.showLivePlayable,
    )
}
