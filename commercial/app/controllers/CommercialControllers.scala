package commercial.controllers

import com.softwaremill.macwire._
import commercial.AdmiralAgent
import commercial.model.capi.CapiAgent
import contentapi.ContentApiClient
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait CommercialControllers {
  def contentApiClient: ContentApiClient
  def capiAgent: CapiAgent
  def controllerComponents: ControllerComponents
  def admiralAgent: AdmiralAgent
  implicit def appContext: ApplicationContext
  lazy val contentApiOffersController = wire[ContentApiOffersController]
  lazy val hostedContentController = wire[HostedContentController]
  lazy val piggybackPixelController = wire[PiggybackPixelController]
  lazy val adsDotTextFileController = wire[AdsDotTextViewController]
  lazy val passbackController = wire[PassbackController]
  lazy val ampIframeHtmlController = wire[AmpIframeHtmlController]
  lazy val nonRefreshableLineItemsController = wire[nonRefreshableLineItemsController]
  lazy val TemporaryAdLiteController = wire[TemporaryAdLiteController]
  lazy val admiralController = wire[AdmiralController]
}
