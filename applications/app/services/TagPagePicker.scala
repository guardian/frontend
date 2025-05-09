package services.dotcomrendering

import common.GuLogging
import conf.switches.Switches.DCRTagPages
import implicits.Requests._
import model.TagCombiner
import play.api.mvc.RequestHeader
import services.IndexPage

object TagPagePicker extends GuLogging {

  def getTier(tagPage: IndexPage)(implicit request: RequestHeader): RenderType = {
    lazy val isSwitchedOn = DCRTagPages.isSwitchedOn

    val tier = decideTier(
      request.isRss,
      request.isJson,
      request.forceDCROff,
      request.forceDCR,
      isSwitchedOn,
    )

    logTier(tagPage, isSwitchedOn, tier)

    tier
  }

  private def decideTier(
      isRss: Boolean,
      isJson: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      isSwitchedOn: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (isJson) {
      // JSON requests always require forceDCR
      if (forceDCR) RemoteRender
      else LocalRender
    } else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (isSwitchedOn) RemoteRender
    else LocalRender
  }

  private def logTier(
      tagPage: IndexPage,
      isSwitchedOn: Boolean,
      tier: RenderType,
  )(implicit request: RequestHeader): Unit = {
    val tierReadable = if (tier == RemoteRender) "dotcomcomponents" else "web"
    val properties =
      Map(
        "isSwitchedOn" -> isSwitchedOn.toString,
        "isTagPage" -> "true",
        "tier" -> tierReadable,
      )

    DotcomFrontsLogger.logger.logRequest(s"tag front executing in $tierReadable", properties, tagPage)
  }
}
