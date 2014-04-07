package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime
import scala.concurrent.Future
import model.commercial.{MasterClass, Lookup}
import model.ImageElement

object MasterClassAgent extends Logging with ExecutionContexts {
  private val masterClass1 = EventbriteMasterClass("1", "MasterClass A", new DateTime(),
    "http://www.theguardian.com", "Description of MasterClass A", "Live", Venue(), Ticket(1.0) :: Nil, 1,
    "http://www.theguardian.com")

  private val masterClass2 = masterClass1.copy(name = "MasterClass B", description = "MasterClass with multiple tickets", tickets = List(Ticket(1.0), Ticket(5.0)))
  private val masterClass3 = masterClass1.copy(name = "Guardian MasterClass C", description = "Description of MasterClass C")

  private val placeholder: List[EventbriteMasterClass] = List(masterClass1, masterClass2, masterClass3)

  private lazy val agent = AkkaAgent[Seq[MasterClass]](Nil)


  def getUpcoming: Seq[MasterClass] = {
    agent.get()
  }

  def wrapEventbriteWithContentApi(eventbriteEvents: Seq[EventbriteMasterClass]): Future[Seq[MasterClass]] = {
    val seqThumbs: Seq[Future[MasterClass]] = eventbriteEvents.take(10).map {
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
