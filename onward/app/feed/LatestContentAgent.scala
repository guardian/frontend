package feed

import conf.ContentApi
import common._
import model.Content

object LatestContentAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  def latestContent(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)

  def update() {
    log.info("Updating latest content.")
    Edition.all foreach update
  }

  private def update(edition: Edition) = {
    ContentApi.search(edition).response.map{ response =>
      val latest = response.results map { Content(_) } take 5
      agent.send( _.updated(edition.id, latest))
    }
  }
}