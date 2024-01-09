package commercial.controllers

import com.softwaremill.macwire._
import commercial.model.capi.CapiAgent
import commercial.model.merchandise.jobs.JobsAgent
import commercial.model.merchandise.travel.TravelOffersAgent
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait CommercialControllers {
  def contentApiClient: ContentApiClient
  def capiAgent: CapiAgent
  def travelOffersAgent: TravelOffersAgent
  def jobsAgent: JobsAgent
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val contentApiOffersController: ContentApiOffersController = wire[ContentApiOffersController]
  lazy val creativeTestPage: CreativeTestPage = wire[CreativeTestPage]
  lazy val hostedContentController: HostedContentController = wire[HostedContentController]
  lazy val jobsController: JobsController = wire[JobsController]
  lazy val multi: Multi = wire[Multi]
  lazy val travelOffersController: TravelOffersController = wire[TravelOffersController]
  lazy val trafficDriverController: TrafficDriverController = wire[TrafficDriverController]
  lazy val piggybackPixelController: PiggybackPixelController = wire[PiggybackPixelController]
  lazy val cmpDataController: CmpDataController = wire[CmpDataController]
  lazy val adsDotTextFileController: AdsDotTextViewController = wire[AdsDotTextViewController]
  lazy val prebidAnalyticsController: PrebidAnalyticsController = wire[PrebidAnalyticsController]
  lazy val passbackController: PassbackController = wire[PassbackController]
  lazy val ampIframeHtmlController: AmpIframeHtmlController = wire[AmpIframeHtmlController]
  lazy val nonRefreshableLineItemsController: nonRefreshableLineItemsController =
    wire[nonRefreshableLineItemsController]
}
