package model.pressed

import com.gu.facia.api.utils.{BoostLevel, FaciaContentUtils}
import com.gu.facia.api.{models => fapi}

final case class PressedDisplaySettings(
    isBoosted: Boolean,
    boostLevel: Option[BoostLevel],
    isImmersive: Option[Boolean],
    showBoostedHeadline: Boolean,
    showQuotedHeadline: Boolean,
    imageHide: Boolean,
    showLivePlayable: Boolean,
)

object PressedDisplaySettings {
  def make(content: fapi.FaciaContent, suppressImages: Option[Boolean]): PressedDisplaySettings = {
    val shouldSuppressImages = suppressImages.getOrElse(false)
    val contentProperties = PressedProperties.getProperties(content)
    PressedDisplaySettings(
      imageHide = shouldSuppressImages || contentProperties.imageHide,
      isBoosted = FaciaContentUtils.isBoosted(content),
      boostLevel = Some(FaciaContentUtils.boostLevel(content)),
      isImmersive = Some(FaciaContentUtils.isImmersive(content)),
      showBoostedHeadline = FaciaContentUtils.showBoostedHeadline(content),
      showQuotedHeadline = FaciaContentUtils.showQuotedHeadline(content),
      showLivePlayable = FaciaContentUtils.showLivePlayable(content),
    )
  }
}
