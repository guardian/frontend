package feed

import conf.ContentApi
import common._
import model.Content
import scala.concurrent.duration._

object MostPopularAgent extends Logging {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  object MostPopularAgentRefreshJob extends Job with ExecutionContexts {
    val cron = "0 * * * * ?"
    val metric = CoreNavivationMetrics.MostPopularLoadTimingMetric

    def run() {
      log.info("Refreshing most popular.")
      Edition.all foreach { edition =>
        ContentApi.item("/", edition).showMostViewed(true).response.foreach{ response =>
          val mostViewed = response.mostViewed map { new Content(_) } take 10
          agent.send{ old =>
            old + (edition.id -> mostViewed)
          }
        }
      }
    }
  }

  def mostPopular(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)
  def await() { quietly(agent.await(2.seconds)) }

  def start() { Jobs.schedule(MostPopularAgentRefreshJob) }
  def refresh() { MostPopularAgentRefreshJob.run() }
  def stop() { agent.close() }
}
