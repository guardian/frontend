package feed

import common._
import services.OphanApi

import scala.concurrent.{ExecutionContext, Future}

class MostReadAgent(ophanApi: OphanApi) extends GuLogging {

  private val agent = Box[Map[String, Int]](Map.empty)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Int]] = {
    log.info("Refreshing most read.")

    // limiting to sport/football section for now as this is only used by popular-in-tag component
    val ophanQuery = ophanApi.getMostReadInSection("sport,football", 2, 1000)

    ophanQuery.flatMap { mostReadItems =>
      agent.alter(mostReadItems.map(item => (item.url, item.count)).toMap)
    }
  }

  def getViewCount(id: String): Option[Int] = {
    agent.get().get(id)
  }

  def getViewCounts: Map[String, Int] = {
    agent.get()
  }
}
