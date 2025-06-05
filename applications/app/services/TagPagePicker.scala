package services.dotcomrendering

import common.GuLogging
import conf.switches.Switches.DCRTagPages
import implicits.Requests._
import model.TagCombiner
import play.api.mvc.RequestHeader
import services.IndexPage

object TagPagePicker extends GuLogging {

  def getTier(tagPage: IndexPage)(implicit request: RequestHeader): RenderType = {
    lazy val isSwitchedOn = DCRTagPages.isSwitchedOn;

    val checks = dcrChecks(tagPage)

    val tier = decideTier(
      request.isRss,
      request.isJson,
      request.forceDCROff,
      request.forceDCR,
      isSwitchedOn,
      dcrCouldRender(checks),
    )

    logTier(tagPage, isSwitchedOn, dcrCouldRender(checks), checks, tier)

    tier
  }

  private def dcrCouldRender(checks: Map[String, Boolean]): Boolean = {
    checks.values.forall(identity)
  }

  private def dcrChecks(tagPage: IndexPage): Map[String, Boolean] = {
    Map(
      ("isNotTagCombiner", !tagPage.page.isInstanceOf[TagCombiner]),
    )
  }

  private def decideTier(
      isRss: Boolean,
      isJson: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      isSwitchedOn: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (isJson) {
      // JSON requests always require forceDCR
      if (forceDCR) RemoteRender
      else LocalRender
    } else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (dcrCouldRender && isSwitchedOn) RemoteRender
    else LocalRender
  }

  private def logTier(
      tagPage: IndexPage,
      isSwitchedOn: Boolean,
      dcrCouldRender: Boolean,
      checks: Map[String, Boolean],
      tier: RenderType,
  )(implicit request: RequestHeader): Unit = {
    val tierReadable = if (tier == RemoteRender) "dotcomcomponents" else "web"
    val checksToString = checks.map { case (key, value) =>
      (key, value.toString)
    }
    val properties =
      Map(
        "isSwitchedOn" -> isSwitchedOn.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isTagPage" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomFrontsLogger.logger.logRequest(s"tag front executing in $tierReadable", properties, tagPage)
  }
}
