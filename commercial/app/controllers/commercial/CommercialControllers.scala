package controllers.commercial

import com.softwaremill.macwire._

trait CommercialControllers {
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
}
