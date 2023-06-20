package services.dotcomrendering

import common.{Edition, GuLogging}
import conf.switches.Switches.DCRFronts
import implicits.Requests._
import model.PressedPage
import model.facia.PressedCollection
import model.pressed.LinkSnap
import play.api.mvc.RequestHeader
import views.support.Commercial

object FrontChecks {

  // To check which collections are supported by DCR and update this set please check:
  // https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/lib/DecideContainer.tsx
  // and https://github.com/guardian/dotcom-rendering/issues/4720
  val SUPPORTED_COLLECTIONS: Set[String] =
    Set(
      // We partly support thrashers. They will be fully supported after this is completed: https://github.com/guardian/dotcom-rendering/issues/7319
      "fixed/thrasher",
      "dynamic/package",

      /*
      "fixed/video"
      pending https://github.com/guardian/dotcom-rendering/issues/5149
       */

      "dynamic/slow-mpu",
      "fixed/small/slow-V-mpu",
      "fixed/medium/slow-XII-mpu",
      "dynamic/slow",
      "dynamic/fast",
      "fixed/small/slow-I",
      "fixed/small/slow-III",
      "fixed/small/slow-IV",
      "fixed/small/slow-V-third",
      "fixed/small/slow-V-half",
      "fixed/small/fast-VIII",
      "fixed/medium/slow-VI",
      "fixed/medium/slow-VII",
      "fixed/medium/fast-XII",
      "fixed/medium/fast-XI",
      "fixed/large/slow-XIV",
      "nav/list",
      "nav/media-list",
      "news/most-popular",
    )

  /*
   * This list contains JSON.HTML thrashers that DCR Supports. These thrashers should not actually be rendered by DCR
   * but instead have an alternate way of being rendered on DCR.
   *
   * Right now this is limited to just treats as we now configure treats in DCR instead of relying on a thrasher.
   *
   * In theory once 100% of the page views for these fronts are rendered by DCR then the thrashers can be deleted.
   */
  val SUPPORTED_JSON_HTML_THRASHERS: Set[String] =
    Set(
      "https://interactive.guim.co.uk/thrashers/qatar-beyond-the-football/source.json",
      "https://interactive.guim.co.uk/thrashers/newsletters-2020-election-nugget/source.json",
    )

  val UNSUPPORTED_THRASHERS: Set[String] =
    Set(
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/12/wordiply/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/04/australian-election/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2021/07/full-story/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2021/10/saved-for-later/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/12/documentaries-signup-thrasher/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2021/12/100-best-footballers/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2021/01/football-weekly-thrasher/thrasher",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/11/20/football-interactive-atom/knockout-full",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2021/07/pegasus/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/07/lakeside/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/07/support-guardian-thrasher/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/02/pw-uk/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/11/comfort-eating-grace-dent-thrasher-no-logo/default",
      "https://content.guardianapis.com/atom/interactive/interactives/thrashers/2022/02/weekend-podcast-2022/default",
      // We can support the Cotton Capital thrashers once this is completed: https://github.com/guardian/dotcom-rendering/issues/7748
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/default-fronts-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/david-olusoga-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/cassandra-gooptar-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/gary-younge-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/deneen-l-brown-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/the-enslaved-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/olivette-otele-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/interactives-front--globe",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/michael-taylor-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/lanre-bakare-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/hidden-figures-front-default",
      "https://content.guardianapis.com/atom/interactive/interactives/2022/10/tr/johny-pitts-photo-essay-front-default",
      // End of list of Cotton Capital thrashers
    )

  def allCollectionsAreSupported(faciaPage: PressedPage): Boolean = {
    faciaPage.collections.forall(collection => SUPPORTED_COLLECTIONS.contains(collection.collectionType))
  }

  def hasNoWeatherWidget(faciaPage: PressedPage): Boolean = {
    // See: https://github.com/guardian/dotcom-rendering/issues/4602
    !faciaPage.isNetworkFront
  }

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

  def isNotPaidFront(faciaPage: PressedPage)(implicit request: RequestHeader): Boolean = {
    // We don't support paid fronts
    // See: https://github.com/guardian/dotcom-rendering/issues/5945

    !faciaPage.isPaid(Edition(request));
  }

  def hasNoRegionalAusTargetedContainers(faciaPage: PressedPage): Boolean = {
    // We don't support the Aus region selector component
    // https://github.com/guardian/dotcom-rendering/issues/6234
    !faciaPage.collections.exists(collection =>
      collection.targetedTerritory.exists(_.id match {
        case "AU-VIC" => true
        case "AU-QLD" => true
        case "AU-NSW" => true
        case _        => false
      }),
    )
  }

  def hasNoUnsupportedSnapLinkCards(faciaPage: PressedPage): Boolean = {
    def containsUnsupportedSnapLink(collection: PressedCollection) = {
      collection.curated.exists(card =>
        card match {
          case card: LinkSnap if card.properties.embedType.contains("link") => false
          case card: LinkSnap if card.properties.embedType.contains("interactive") =>
            card.properties.embedUri.exists(UNSUPPORTED_THRASHERS.contains)
          case card: LinkSnap if card.properties.embedType.contains("json.html") =>
            card.properties.embedUri.exists(uri => !SUPPORTED_JSON_HTML_THRASHERS.contains(uri))
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

  def hasNoDynamicPackage(faciaPage: PressedPage): Boolean = {
    !faciaPage.collections.map(_.collectionType).contains("dynamic/package")
  }

  def hasNoFixedVideo(faciaPage: PressedPage): Boolean = {
    !faciaPage.collections.map(_.collectionType).contains("fixed/video")
  }

}

object FaciaPicker extends GuLogging {

  def dcrChecks(faciaPage: PressedPage)(implicit request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("allCollectionsAreSupported", FrontChecks.allCollectionsAreSupported(faciaPage)),
      ("hasNoWeatherWidget", FrontChecks.hasNoWeatherWidget(faciaPage)),
      ("isNotAdFree", FrontChecks.isNotAdFree()),
      ("hasNoPageSkin", FrontChecks.hasNoPageSkin(faciaPage)),
      ("isNotPaidFront", FrontChecks.isNotPaidFront(faciaPage)),
      ("hasNoRegionalAusTargetedContainers", FrontChecks.hasNoRegionalAusTargetedContainers(faciaPage)),
      ("hasNoUnsupportedSnapLinkCards", FrontChecks.hasNoUnsupportedSnapLinkCards(faciaPage)),
      ("hasNoDynamicPackage", FrontChecks.hasNoDynamicPackage(faciaPage)),
      ("hasNoFixedVideo", FrontChecks.hasNoFixedVideo(faciaPage)),
    )
  }

  def getTier(faciaPage: PressedPage)(implicit request: RequestHeader): RenderType = {
    lazy val checks = dcrChecks(faciaPage)
    lazy val dcrSwitchEnabled = DCRFronts.isSwitchedOn
    lazy val dcrCouldRender = checks.values.forall(checkValue => checkValue)

    val tier = decideTier(request.isRss, request.forceDCROff, request.forceDCR, dcrSwitchEnabled, dcrCouldRender)

    logTier(faciaPage, dcrCouldRender, checks, tier)

    tier
  }

  def decideTier(
      isRss: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      dcrSwitchEnabled: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
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
