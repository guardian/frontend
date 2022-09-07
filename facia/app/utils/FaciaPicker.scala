package utils

import common.GuLogging
import experiments.{ActiveExperiments, DCRFronts}
import implicits.Requests._
import model.PressedPage
import play.api.mvc.RequestHeader
import views.support.Commercial

object FrontChecks {

  // To check which collections are supported by DCR and update this set please check:
  // https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/lib/DecideContainer.tsx
  // and https://github.com/guardian/dotcom-rendering/issues/4720
  val SUPPORTED_COLLECTIONS: Set[String] =
    Set(
      /*
    "dynamic/slow-mpu",
      pending https://github.com/guardian/dotcom-rendering/issues/5926 and
      https://github.com/guardian/dotcom-rendering/issues/5821
       */

      /*
    "fixed/small/slow-V-mpu",
      pending https://github.com/guardian/dotcom-rendering/issues/5926
       */

      /*
    "fixed/medium/slow-XII-mpu",
      pending https://github.com/guardian/dotcom-rendering/issues/5926
       */

      /*
    "dynamic/package",
      pending https://github.com/guardian/dotcom-rendering/issues/5196 and
      https://github.com/guardian/dotcom-rendering/issues/5267
       */

      /*
    "news/most-popular"
      pending https://github.com/guardian/frontend/issues/25448 and
      https://github.com/guardian/dotcom-rendering/issues/5902
       */

      /*
    "dynamic/fast"
      pending https://github.com/guardian/dotcom-rendering/issues/5782
       */

      "dynamic/slow",
      "fixed/small/slow-I",
      "fixed/small/slow-III",
      "fixed/small/slow-IV",
      "fixed/small/slow-V-third",
      "fixed/medium/slow-VI",
      "fixed/large/slow-XIV",
      "fixed/large/slow-XIV",
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

  def hasNoSlideshows(faciaPage: PressedPage): Boolean = {
    // We don't support image slideshows
    // See: https://github.com/guardian/dotcom-rendering/issues/4612
    !faciaPage.collections.exists(collection =>
      collection.curated.exists(card => card.properties.imageSlideshowReplace),
    )
  }

  def isNotPaidContent(faciaPage: PressedPage): Boolean = {
    // We don't support paid content
    // See: https://github.com/guardian/dotcom-rendering/issues/5945
    !faciaPage.frontProperties.isPaidContent
  }

  def hasNoPaidForCards(faciaPage: PressedPage): Boolean = {
    // We don't support labs containers
    // See: https://github.com/guardian/dotcom-rendering/issues/5150
    !faciaPage.collections.exists(collection => collection.curated.exists(card => card.isPaidFor))
  }

}

class FaciaPicker extends GuLogging {

  private def dcrChecks(faciaPage: PressedPage)(implicit request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("allCollectionsAreSupported", FrontChecks.allCollectionsAreSupported(faciaPage)),
      ("hasNoWeatherWidget", FrontChecks.hasNoWeatherWidget(faciaPage)),
      ("isNotAdFree", FrontChecks.isNotAdFree()),
      ("hasNoPageSkin", FrontChecks.hasNoPageSkin(faciaPage)),
      ("hasNoSlideshows", FrontChecks.hasNoSlideshows(faciaPage)),
      ("isNotPaidContent", FrontChecks.isNotPaidContent(faciaPage)),
      ("hasNoPaidForCards", FrontChecks.hasNoPaidForCards(faciaPage)),
    )
  }

  def getTier(faciaPage: PressedPage)(implicit request: RequestHeader): RenderType = {
    lazy val participatingInTest = ActiveExperiments.isParticipating(DCRFronts)
    lazy val checks = dcrChecks(faciaPage)
    lazy val dcrCouldRender = checks.values.forall(checkValue => checkValue == true)

    val tier = decideTier(request.forceDCROff, request.forceDCR, participatingInTest, dcrCouldRender)

    logTier(faciaPage, participatingInTest, dcrCouldRender, checks, tier)

    tier
  }

  def decideTier(
      forceDCROff: Boolean,
      forceDCR: Boolean,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (dcrCouldRender && participatingInTest) RemoteRender
    else LocalRender
  }

  private def logTier(
      faciaPage: PressedPage,
      participatingInTest: Boolean,
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
        "participatingInTest" -> participatingInTest.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomFrontsLogger.logger.logRequest(s"front executing in $tierReadable", properties, faciaPage)
  }
}

object FaciaPicker extends FaciaPicker
