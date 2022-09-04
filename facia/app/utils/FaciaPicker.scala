package utils

import common.GuLogging
import experiments.{ActiveExperiments, DCRFronts}
import implicits.Requests._
import model.PressedPage
import play.api.mvc.RequestHeader

class FaciaPicker extends GuLogging {

  // To check which collections are supported by DCR and update this set please check:
  // https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/lib/DecideContainer.tsx
  // and https://github.com/guardian/dotcom-rendering/issues/4720
  private val SUPPORTED_COLLECTIONS: Set[String] =
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
      "fixed/large/slow-XIV"
    )

  def getTier(faciaPage: PressedPage, path: String)(implicit request: RequestHeader): RenderType = {
    val participatingInTest = ActiveExperiments.isParticipating(DCRFronts)
    val dcrCouldRender = dcrSupportsAllCollectionTypes(faciaPage)

    val tier = {
      if (forceDCROff) LocalRender
      else if (forceDCR) RemoteRender
      else if (dcrCouldRender && participatingInTest) RemoteRender
      else LocalRender
    }

    logTier(faciaPage, path, participatingInTest, dcrCouldRender, tier)

    tier
  }

  private def logTier(
      faciaPage: PressedPage,
      path: String,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
      tier: RenderType,
  )(implicit request: RequestHeader): Unit = {
    val tierReadable = if (tier == RemoteRender) "dotcomcomponents" else "web";
    val properties =
      Map(
        "participatingInTest" -> participatingInTest.toString,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      )

    DotcomFrontsLogger.logger.logRequest(s"front executing in $tierReadable", properties, faciaPage)
  }
}

object FaciaPicker extends FaciaPicker
