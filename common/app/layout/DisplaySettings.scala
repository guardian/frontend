package layout

import com.gu.facia.api.utils.BoostLevel
import model.pressed._
import play.twirl.api.TwirlFeatureImports.twirlOptionToBoolean

case class DisplaySettings(
    isBoosted: Boolean,
    boostLevel: Option[BoostLevel],
    showBoostedHeadline: Boolean,
    showQuotedHeadline: Boolean,
    imageHide: Boolean,
    showLivePlayable: Boolean,
)

object DisplaySettings {
  def fromTrail(faciaContent: PressedContent, config: CollectionConfig): DisplaySettings =
    DisplaySettings(
      faciaContent.display.isBoosted,
      faciaContent.display.boostLevel,
      faciaContent.display.showBoostedHeadline,
      faciaContent.display.showQuotedHeadline,
      Some(config.suppressImages) || faciaContent.display.imageHide,
      faciaContent.display.showLivePlayable,
    )
}
