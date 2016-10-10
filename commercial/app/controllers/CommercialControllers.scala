package commercial.controllers

import com.softwaremill.macwire._
import commercial.model.merchandise.jobs.JobsAgent
import contentapi.ContentApiClient
import commercial.model.capi.CapiAgent
import commercial.model.merchandise.books.{BestsellersAgent, BookFinder}
import commercial.model.merchandise.events.{LiveEventAgent, MasterclassAgent}
import commercial.model.merchandise.travel.TravelOffersAgent

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
  lazy val subscriberNumberPageController = wire[SubscriberNumberPageController]
  lazy val contributorEmailPageController = wire[ContributorEmailPageController]
  lazy val trafficDriverController = wire[TrafficDriverController]
}
