package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime
import scala.concurrent.Future
import model.commercial.{MasterClass, Lookup}
import model.ImageElement
import play.api.Play
import play.api.Play.current


object MasterClassAgent extends Logging with ExecutionContexts {
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
          // This is just in case the Future doesn't pan out.
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
