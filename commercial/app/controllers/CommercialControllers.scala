package commercial.controllers

import com.softwaremill.macwire._
import contentapi.ContentApiClient
import model.commercial.CapiAgent
import model.commercial.books.{BestsellersAgent, BookFinder}
import model.commercial.events.{LiveEventAgent, MasterclassAgent}
import model.commercial.jobs.JobsAgent
import model.commercial.travel.TravelOffersAgent

trait CommercialControllers {
  def contentApiClient: ContentApiClient
  def bestsellersAgent: BestsellersAgent
  def liveEventAgent: LiveEventAgent
  def bookFinder: BookFinder
  def capiAgent: CapiAgent
  def masterclassAgent: MasterclassAgent
  def travelOffersAgent: TravelOffersAgent
  def jobsAgent: JobsAgent
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
}
