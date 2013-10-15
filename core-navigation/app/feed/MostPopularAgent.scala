package feed

import conf.ContentApi
import common._
import model.Content
import scala.concurrent.duration._


object MostPopularAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  def mostPopular(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)

  def await() { quietly(agent.await(2.seconds)) }

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach { edition =>
      ContentApi.item("/", edition)
        .showMostViewed(true)
        .response.foreach{ response =>
          val mostViewed = response.mostViewed map { Content(_) } take 10
          agent.send{ old =>
            old + (edition.id -> mostViewed)
          }
      }
    }
  }
}


object MostPopularExpandableAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  def mostPopular(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)

  def await() { quietly(agent.await(2.seconds)) }

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach { edition =>
      ContentApi.item("/", edition)
        .showMostViewed(true)
        .showFields("headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl,body")
        .response.foreach{ response =>
        val mostViewed = response.mostViewed map { Content(_) } take 10
        agent.send{ old =>
          old + (edition.id -> mostViewed)
        }
      }
    }
  }
}
