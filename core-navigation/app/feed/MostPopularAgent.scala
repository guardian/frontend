package feed

import common.{ Logging, AkkaSupport }
import model.{ Content, Trail }
import conf.ContentApi
import com.gu.openplatform.contentapi.model.ItemResponse
import akka.actor.Cancellable
import common._

import scala.concurrent.duration._

object MostPopularAgent extends AkkaSupport with Logging with ExecutionContexts {

  private val agent = play_akka.agent[Map[String, Seq[Content]]](Map.empty)

  private lazy val schedule = play_akka.scheduler.every(60.seconds, initialDelay = 1.second) {
    refresh()
  }

  def mostPopular(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)

  def refresh() {
    Edition.all.foreach(refresh)
  }

  def await() { quietly(agent.await(2.seconds)) }

  private def refresh(edition: Edition) {
    ContentApi.item("/", edition).showMostViewed(true).response.foreach{ response =>
      val mostViewed = response.mostViewed map { new Content(_) } take (10)
      agent.send{ old =>
        old + (edition.id -> mostViewed)
      }
    }
  }

  def startup() {
    schedule
  }

  def shutdown() {
    schedule.cancel()
    agent.close()
  }

}
