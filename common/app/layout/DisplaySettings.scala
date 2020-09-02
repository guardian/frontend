package layout

import model.pressed._

case class DisplaySettings(
    /** TODO check if this should actually be used to determine anything at an item level; if not, remove it */
    isBoosted: Boolean,
    showBoostedHeadline: Boolean,
    showQuotedHeadline: Boolean,
    imageHide: Boolean,
    showLivePlayable: Boolean,
)

object DisplaySettings {
  def fromTrail(faciaContent: PressedContent): DisplaySettings =
    DisplaySettings(
      faciaContent.display.isBoosted,
      faciaContent.display.showBoostedHeadline,
      faciaContent.display.showQuotedHeadline,
      faciaContent.display.imageHide,
      faciaContent.display.showLivePlayable,
    )
}
