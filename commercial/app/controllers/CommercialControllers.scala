package commercial.controllers

import com.softwaremill.macwire._
import commercial.model.capi.CapiAgent
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder}
import commercial.model.merchandise.events.{LiveEventAgent, MasterclassAgent}
import commercial.model.merchandise.jobs.JobsAgent
import commercial.model.merchandise.travel.TravelOffersAgent
import contentapi.ContentApiClient
import model.ApplicationContext

trait CommercialControllers {
  def contentApiClient: ContentApiClient
  def bestsellersAgent: BestsellersAgent
  def liveEventAgent: LiveEventAgent
  def bookFinder: BookFinder
  def capiAgent: CapiAgent
  def masterclassAgent: MasterclassAgent
  def travelOffersAgent: TravelOffersAgent
  def jobsAgent: JobsAgent
  implicit def appContext: ApplicationContext
  lazy val bookOffersController = wire[BookOffersController]
  lazy val contentApiOffersController = wire[ContentApiOffersController]
  lazy val creativeTestPage = wire[CreativeTestPage]
  lazy val hostedContentController = wire[HostedContentController]
  lazy val jobsController = wire[JobsController]
  lazy val liveEventsController = wire[LiveEventsController]
  lazy val masterclassesController = wire[MasterclassesController]
  lazy val multi = wire[Multi]
  lazy val paidContentCardController = wire[PaidContentCardController]
  lazy val soulmatesController = wire[SoulmatesController]
  lazy val travelOffersController = wire[TravelOffersController]
  lazy val trafficDriverController = wire[TrafficDriverController]
  lazy val piggybackPixelController = wire[PiggybackPixelController]
}
