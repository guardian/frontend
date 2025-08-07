package services.dotcomrendering

import common.{Edition, GuLogging}
import conf.switches.Switches.{DCRFronts, DCRNetworkFronts}
import implicits.Requests._
import model.PressedPage
import model.facia.PressedCollection
import model.pressed.LinkSnap
import play.api.mvc.RequestHeader
import views.support.Commercial
import layout.slices.EmailLayouts

object FrontChecks {

  /** This is the list that DCR will accept, otherwise the validation fails, resulting in an error.
    *
    * **It must be kept in sync manually.**
    *
    * @see
    *   https://github.com/guardian/dotcom-rendering/blob/07b8f29decc1/dotcom-rendering/src/types/front.ts#L61-L83
    */
  val SUPPORTED_COLLECTIONS: Set[String] =
    Set(
      "dynamic/fast",
      "dynamic/package",
      "dynamic/slow",
      "dynamic/slow-mpu",
      "fixed/large/slow-XIV",
      "fixed/medium/fast-XI",
      "fixed/medium/fast-XII",
      "fixed/medium/slow-VI",
      "fixed/medium/slow-VII",
      "fixed/medium/slow-XII-mpu",
      "fixed/small/fast-VIII",
      "fixed/small/slow-I",
      "fixed/small/slow-III",
      "fixed/small/slow-IV",
      "fixed/small/slow-V-half",
      "fixed/small/slow-V-mpu",
      "fixed/small/slow-V-third",
      "fixed/thrasher",
      "nav/list",
      "nav/media-list",
      "news/most-popular",
      "scrollable/highlights",
      "flexible/special",
      "flexible/general",
      "scrollable/small",
      "scrollable/medium",
      "scrollable/feature",
      "static/feature/2",
      "static/medium/4",
    )

  def hasOnlySupportedCollections(faciaPage: PressedPage) =
    faciaPage.collections.forall(collection => SUPPORTED_COLLECTIONS.contains(collection.collectionType))

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
      ("hasNoUnsupportedSnapLinkCards", FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage)),
      ("hasOnlySupportedCollections", FrontChecks.hasOnlySupportedCollections(faciaPage)),
    )
  }

  def getTier(faciaPage: PressedPage)(implicit request: RequestHeader): RenderType = {
    lazy val checks = dcrChecks(faciaPage)
    lazy val dcrSwitchEnabled = DCRFronts.isSwitchedOn
    lazy val dcrCouldRender = checks.values.forall(checkValue => checkValue)
    lazy val isNetworkFront = faciaPage.isNetworkFront
    lazy val dcrNetworkFrontsSwitchEnabled = DCRNetworkFronts.isSwitchedOn

    val tier =
      decideTier(
        request.isRss,
        request.forceDCROff,
        request.forceDCR,
        dcrSwitchEnabled,
        dcrCouldRender,
        isNetworkFront,
        dcrNetworkFrontsSwitchEnabled,
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
      dcrNetworkFrontsSwitchEnabled: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (dcrCouldRender && dcrSwitchEnabled) {
      isNetworkFront match {
        case false                                 => RemoteRender
        case true if dcrNetworkFrontsSwitchEnabled => RemoteRender
        case _                                     => LocalRender
      }
    } else LocalRender
  }

  private def logTier(
      faciaPage: PressedPage,
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
        "dcrFrontsSwitchOn" -> DCRFronts.isSwitchedOn.toString,
        "dcrNetworksFrontsSwitchOn" -> DCRNetworkFronts.isSwitchedOn.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomFrontsLogger.logger.logRequest(s"front executing in $tierReadable", properties, faciaPage)
  }
}
