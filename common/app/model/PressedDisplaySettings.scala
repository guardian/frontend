package model.pressed

import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi}

final case class PressedDisplaySettings(
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  imageHide: Boolean,
  showLivePlayable: Boolean
)

object PressedDisplaySettings {
  def make(content: fapi.FaciaContent): PressedDisplaySettings = {
    val contentProperties = PressedProperties.getProperties(content)
    PressedDisplaySettings(
      imageHide = contentProperties.imageHide,
      isBoosted = FaciaContentUtils.isBoosted(content),
      showBoostedHeadline = FaciaContentUtils.showBoostedHeadline(content),
      showQuotedHeadline = FaciaContentUtils.showQuotedHeadline(content),
      showLivePlayable = FaciaContentUtils.showLivePlayable(content)
    )
  }
}
