package services

import play.api.mvc.RequestHeader

sealed trait RenderingTier
object Regular extends RenderingTier
object USElection2020AmpPage extends RenderingTier

/*
  Author: Pascal
  Date: 21st Jan 2020

  This object was introduced in late 2020, to handle the routing between regular rendering of interactives
  versus the code that had been written to handle the US Presidential Election Tracker amp page.

  The tracker (an ng-interactive) didn't have a AMP page and there were two ways to provide one to it.
  1. Implement the support for it in DCR, or
  2. Implement support for it directly in the [applications] app, using the AMP page already present in CAPI.

  The former wold have taken too long so we went for the latter.
 */

object ApplicationsInteractiveRendering {
  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    val isSpecialElection = ApplicationsUSElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    if (isSpecialElection && isAmp) USElection2020AmpPage else Regular
  }
}
