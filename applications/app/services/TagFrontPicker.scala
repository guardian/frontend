package services.dotcomrendering

import common.GuLogging
import experiments.{ActiveExperiments}
import implicits.Requests._
import play.api.mvc.RequestHeader
import services.IndexPage

object TagFrontPicker extends GuLogging {

  def getTier(tagFront: IndexPage)(implicit request: RequestHeader): RenderType = {
    lazy val participatingInTest = false // There's no room for a 0% test at the moment - so we're just going with false
    lazy val dcrCouldRender = false

    val tier = decideTier(request.isRss, request.forceDCROff, request.forceDCR, participatingInTest, dcrCouldRender)

    logTier(tagFront, participatingInTest, dcrCouldRender, Map(), tier)

    tier
  }

  private def decideTier(
      isRss: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (forceDCROff) LocalRender
    else if (forceDCR) RemoteRender
    else if (dcrCouldRender && participatingInTest) RemoteRender
    else LocalRender
  }

  private def logTier(
      tagFront: IndexPage,
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
//        "testPercentage" -> DCRTagFronts.participationGroup.percentage,
        "dcrCouldRender" -> dcrCouldRender.toString,
        "isFront" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomLogger.logger.logRequest(s"tag front executing in $tierReadable", properties, tagFront)
  }
}
