package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime
import scala.concurrent.Future
import model.commercial.{MasterClass, Lookup}
import model.ImageElement
import play.api.Play
import play.api.Play.current


object MasterClassAgent extends Logging with ExecutionContexts {
  private val masterClass1 = EventbriteMasterClass("1", "MasterClass A", new DateTime(),
    "http://www.theguardian.com", "Description of MasterClass A", "Live", Venue(), Ticket(1.0) :: Nil, 1,
    "http://www.theguardian.com")

  private val masterClass2 = masterClass1.copy(name = "MasterClass B", description = "MasterClass with multiple tickets", tickets = List(Ticket(1.0), Ticket(5.0)))
  private val masterClass3 = masterClass1.copy(name = "Guardian MasterClass C", description = "Description of MasterClass C")
  private val masterClass4 = masterClass1.copy(name = "Guardian MasterClass D", description = "Description of MasterClass D")

  private lazy val agent = AkkaAgent[Seq[MasterClass]](Nil)


  def getUpcoming: Seq[MasterClass] = {
    agent.get()
  }

  def wrapEventbriteWithContentApi(eventbriteEvents: Seq[EventbriteMasterClass]): Future[Seq[MasterClass]] = {
    var results = eventbriteEvents
    if (Play.isDev) {
      results = eventbriteEvents.takeRight(10)
    }

    val seqThumbs: Seq[Future[MasterClass]] = results.map {
      event =>
        val contentId: String = event.guardianUrl.replace("http://www.theguardian.com/", "")
        val thumbnail: Future[Option[ImageElement]] = Lookup.thumbnail(contentId)

        thumbnail.map {
          thumb => MasterClass(event, thumb)
        } recover {
          // This shouldn't be necessary. The Option[ImageElement] should have handled all exceptions
          case _: Exception => MasterClass(event, None)
        }
    }
    Future.sequence(seqThumbs)
  }

  def refresh() {
    for {
      eventBrite <- EventbriteApi.loadAds()
      masterclasses <- wrapEventbriteWithContentApi(eventBrite)
    } {
      log.info("Updating Masterclass agent")
      agent send masterclasses
    }
  }

  def stop() {
    agent.close()
  }

}
