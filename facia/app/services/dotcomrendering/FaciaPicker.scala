package services.dotcomrendering

import common.{Edition, GuLogging}
import conf.switches.Switches.DCRFronts
import implicits.Requests._
import model.PressedPage
import model.facia.PressedCollection
import model.pressed.LinkSnap
import play.api.mvc.RequestHeader
import views.support.Commercial
import experiments.{ActiveExperiments, DCRNetworkFronts}

object FrontChecks {

  /*
   * This list contains JSON.HTML thrashers that DCR allows. These thrashers should not actually be rendered by DCR
   * but instead have an alternate way of being rendered on DCR.
   *
   * Right now this is limited to just treats as we now configure treats in DCR instead of relying on a thrasher.
   *
   * In theory once 100% of the page views for these fronts are rendered by DCR then the thrashers can be deleted.
   */
  val ALLOWED_JSON_HTML_THRASHERS: Set[String] =
    Set(
      "https://interactive.guim.co.uk/thrashers/qatar-beyond-the-football/source.json",
      "https://interactive.guim.co.uk/thrashers/newsletters-2020-election-nugget/source.json",
    )

  val UNSUPPORTED_THRASHERS: Set[String] =
    Set(
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/04/australian-election/default",
    )

  def isNotAdFree()(implicit request: RequestHeader): Boolean = {
    // We don't support the signed in experience
    // See: https://github.com/guardian/dotcom-rendering/issues/5926
    !Commercial.isAdFree(request)
  }

  def hasNoPageSkin(faciaPage: PressedPage)(implicit request: RequestHeader): Boolean = {
    // We don't support page skin ads
    // See: https://github.com/guardian/dotcom-rendering/issues/5490
    !faciaPage.metadata.hasPageSkin(request)
  }

  def hasNoUnsupportedSnapLinkCards(faciaPage: PressedPage): Boolean = {
    def containsUnsupportedSnapLink(collection: PressedCollection) = {
      collection.curated.exists(card =>
        card match {
          case card: LinkSnap if card.properties.embedType.contains("link") => false
          case card: LinkSnap if card.properties.embedType.contains("interactive") =>
            card.properties.embedUri.exists(UNSUPPORTED_THRASHERS.contains)
          case card: LinkSnap if card.properties.embedType.contains("json.html") =>
            card.properties.embedUri.exists(uri => !ALLOWED_JSON_HTML_THRASHERS.contains(uri))
          // Because embedType is typed as Option[String] it's hard to know whether we've
          // identified all possible embedTypes. If it's an unidentified embedType then
          // assume we can't render it.
          case _: LinkSnap => true
          case _           => false
        },
      )
    }
    !faciaPage.collections.exists(collection => containsUnsupportedSnapLink(collection))
  }

}

object FaciaPicker extends GuLogging {

  def dcrChecks(faciaPage: PressedPage)(implicit request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isNotAdFree", FrontChecks.isNotAdFree()),
      ("hasNoPageSkin", FrontChecks.hasNoPageSkin(faciaPage)),
      ("hasNoUnsupportedSnapLinkCards", FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage)),
    )
  }

  def getTier(faciaPage: PressedPage)(implicit request: RequestHeader): RenderType = {
    lazy val checks = dcrChecks(faciaPage)
    lazy val dcrSwitchEnabled = DCRFronts.isSwitchedOn
    lazy val dcrCouldRender = checks.values.forall(checkValue => checkValue)
    lazy val isNetworkFront = faciaPage.isNetworkFront
    lazy val isInNetworkFrontTest = ActiveExperiments.isParticipating(DCRNetworkFronts)

    val tier =
      decideTier(
        request.isRss,
        request.forceDCROff,
        request.forceDCR,
        dcrSwitchEnabled,
        dcrCouldRender,
        isNetworkFront,
        isInNetworkFrontTest,
      )

    logTier(faciaPage, dcrCouldRender, checks, tier)

    tier
  }

  def decideTier(
      isRss: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      dcrSwitchEnabled: Boolean,
      dcrCouldRender: Boolean,
      isNetworkFront: Boolean,
      isInNetworkFrontTest: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (isNetworkFront)
      if (dcrCouldRender && isInNetworkFrontTest) RemoteRender else LocalRender
    else if (dcrCouldRender && dcrSwitchEnabled) RemoteRender
    else LocalRender
  }

  private def logTier(
      faciaPage: PressedPage,
      dcrCouldRender: Boolean,
      checks: Map[String, Boolean],
      tier: RenderType,
  )(implicit request: RequestHeader): Unit = {
    val tierReadable = if (tier == RemoteRender) "dotcomcomponents" else "web"
    val checksToString = checks.map {
      case (key, value) =>
        (key, value.toString)
    }
    val properties =
      Map(
        "dcrFrontsSwitchOn" -> DCRFronts.isSwitchedOn.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomFrontsLogger.logger.logRequest(s"front executing in $tierReadable", properties, faciaPage)
  }
}
