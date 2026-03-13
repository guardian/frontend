package services.dotcomrendering

import ab.ABTests.isUserInTestGroup
import common.GuLogging
import implicits.Requests._
import play.api.mvc.RequestHeader
import implicits.AppsFormat
import conf.switches.Switches

object HostedContentPicker extends GuLogging {
  def getTier()(implicit
      request: RequestHeader,
  ): RenderType = {
    val tier: RenderType = decideTier()
    tier match {
      case RemoteRender =>
        if (request.getRequestFormat == AppsFormat)
          log.info(s"[HostedContentRendering] path executing in dotcom rendering for apps (DCAR)")
        else
          log.info(s"[HostedContentRendering] path executing in dotcomponents")
      case LocalRender =>
        log.info(s"[HostedContentRendering] path executing in web (frontend)")
    }
    tier
  }

  def decideTier()(implicit
      request: RequestHeader,
  ): RenderType = {
    if (Switches.DCRHostedContent.isSwitchedOff) LocalRender
    else if (request.forceDCROff) LocalRender
    else if (request.forceDCR) RemoteRender
    else LocalRender
  }
}
