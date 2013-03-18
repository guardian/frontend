package feed

import common.{ Logging, AkkaSupport }
import model.{ Content, Trail }
import conf.ContentApi
import com.gu.openplatform.contentapi.model.ItemResponse
import akka.actor.Cancellable
import common._
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._

object MostPopularAgent extends AkkaSupport with Logging {

  private val agent = play_akka.agent[Map[String, Seq[Trail]]](Map.empty)

  private var schedule: Option[Cancellable] = None

  def mostPopular(edition: String) = agent().get(edition)

  def refresh() {
    refresh("UK")
    refresh("US")
  }

  def await() { quietly(agent.await(2.seconds)) }

  private def refresh(edition: String) {
    agent.sendOff { old =>
      val response: ItemResponse = ContentApi.item("/", edition).showMostViewed(true).response
      val mostViewed = response.mostViewed map { new Content(_) } take (10)
      old + (edition -> mostViewed)
    }
  }

  def startup() {
    schedule = Some(play_akka.scheduler.every(60.seconds, initialDelay = 1.second) {
      refresh()
    })
  }

  def shutdown() {
    schedule.foreach(_.cancel())
    agent.close()
  }

}
