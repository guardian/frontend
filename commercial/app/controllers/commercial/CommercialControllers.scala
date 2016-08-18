package controllers.commercial

import com.softwaremill.macwire._
import model.commercial.books.{BestsellersAgent, BookFinder}
import model.commercial.events.LiveEventAgent

trait CommercialControllers {
  def bestsellersAgent: BestsellersAgent
  def liveEventAgent: LiveEventAgent
  def bookFinder: BookFinder
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
}
