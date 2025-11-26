package services.dotcomrendering

import com.madgag.scala.collection.decorators.MapDecorator
import common.commercial.hosted.{HostedArticlePage, HostedGalleryPage, HostedVideoPage}
import implicits.Requests._
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import implicits.AppsFormat
import conf.switches.Switches

object HostedContentPageChecks {

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: HostedArticlePage => false
      case v: HostedVideoPage   => false
      case g: HostedGalleryPage => false
      case _                    => false
    }
  }
}

object HostedContentPicker {

  def dcrChecks(page: PageWithStoryPackage): Map[String, Boolean] = {
    Map(
      ("isSupportedType", HostedContentPageChecks.isSupportedType(page)),
    )
  }

  private[this] def dcr100PercentPage(page: PageWithStoryPackage): Boolean = {
    val allowListFeatures = dcrChecks(page)
    val hostedPage100PercentFeatures = allowListFeatures.view.filterKeys(
      Set(
        "isSupportedType",
      ),
    )

    hostedPage100PercentFeatures.forall({ case (_, isMet) => isMet })
  }

  def getTier(page: PageWithStoryPackage)(implicit
      request: RequestHeader,
  ): RenderType = {
    val checks = dcrChecks(page)
    val dcrCanRender = checks.values.forall(identity)

    val tier: RenderType = decideTier(dcrCanRender)

    // include features that we wish to log but not allow-list against
    val features = checks.mapV(_.toString) +
      ("dcrCouldRender" -> dcrCanRender.toString)

    if (tier == RemoteRender) {
      if (request.getRequestFormat == AppsFormat)
        DotcomponentsLogger.logger.logRequest(
          s"[HostedContentRendering] path executing in dotcom rendering for apps (DCAR)",
          features,
          page.article,
        )
      else
        DotcomponentsLogger.logger.logRequest(
          s"[HostedContentRendering] path executing in dotcomponents",
          features,
          page.article,
        )
    } else {
      DotcomponentsLogger.logger.logRequest(
        s"[HostedContentRendering] path executing in web (frontend)",
        features,
        page.article,
      )
    }

    tier
  }

  def decideTier(dcrCanRender: Boolean)(implicit
      request: RequestHeader,
  ): RenderType = {
    if(Switches.DCRHostedContent.isSwitchedOff) LocalRender
    else if (request.forceDCROff) LocalRender
    else if (request.forceDCR) LocalRender // Prevent RemoteRender (DCR) for now
    else if (dcrCanRender) LocalRender // Prevent RemoteRender (DCR) for now
    else LocalRender
  }
}
