package services.dotcomrendering

import common.GuLogging
import implicits.Requests._
import model.TagCombiner
import play.api.mvc.RequestHeader
import services.IndexPage

object TagFrontPicker extends GuLogging {

  def getTier(tagPage: IndexPage)(implicit request: RequestHeader): RenderType = {
    lazy val participatingInTest = false // There's no room for a 0% test at the moment - so we're just going with false
    val checks = dcrChecks(tagPage)

    val tier = decideTier(
      request.isRss,
      request.isJson,
      request.forceDCROff,
      request.forceDCR,
      participatingInTest,
      dcrCouldRender(checks),
    )

    logTier(tagPage, participatingInTest, dcrCouldRender(checks), checks, tier)

    tier
  }

  private def dcrCouldRender(checks: Map[String, Boolean]): Boolean = {
    checks.values.forall(identity)
  }

  private def dcrChecks(tagPage: IndexPage): Map[String, Boolean] = {
    Map(
      // until we complete https://github.com/guardian/dotcom-rendering/issues/5755
      ("isNotAccessibilityPage", tagPage.page.metadata.id != "help/accessibility-help"),
      ("isNotTagCombiner", !tagPage.page.isInstanceOf[TagCombiner]),
    )
  }

  private def decideTier(
      isRss: Boolean,
      isJson: Boolean,
      forceDCROff: Boolean,
      forceDCR: Boolean,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
  ): RenderType = {
    if (isRss) LocalRender
    else if (isJson) {
      // JSON requests always require forceDCR
      if (forceDCR) RemoteRender
      else LocalRender
    } else if (forceDCROff) LocalRender
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
        "isTagFront" -> "true",
        "tier" -> tierReadable,
      ) ++ checksToString

    DotcomFrontsLogger.logger.logRequest(s"tag front executing in $tierReadable", properties, tagFront)
  }
}
