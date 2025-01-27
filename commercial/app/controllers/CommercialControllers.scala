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
  lazy val contentApiOffersController = wire[ContentApiOffersController]
  lazy val creativeTestPage = wire[CreativeTestPage]
  lazy val hostedContentController = wire[HostedContentController]
  lazy val jobsController = wire[JobsController]
  lazy val multi = wire[Multi]
  lazy val travelOffersController = wire[TravelOffersController]
  lazy val trafficDriverController = wire[TrafficDriverController]
  lazy val piggybackPixelController = wire[PiggybackPixelController]
  lazy val adsDotTextFileController = wire[AdsDotTextViewController]
  lazy val passbackController = wire[PassbackController]
  lazy val ampIframeHtmlController = wire[AmpIframeHtmlController]
  lazy val nonRefreshableLineItemsController = wire[nonRefreshableLineItemsController]
}
