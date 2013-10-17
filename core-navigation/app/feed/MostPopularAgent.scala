package feed

import conf.ContentApi
import common._
import model.Content
import scala.concurrent.duration._
import scala.concurrent.Await
import services.OphanApi
import scala.util.Try
import akka.util.Timeout


object MostPopularAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  def mostPopular(edition: Edition): Seq[Content] = agent().get(edition.id).getOrElse(Nil)

  def await() { quietly(agent.await(2.seconds)) }

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach refresh
  }

  def refresh(edition: Edition) = ContentApi.item("/", edition)
    .showMostViewed(true)
    .response.map{ response =>
      val mostViewed = response.mostViewed map { Content(_) } take 10
      agent.alter{ old =>
        old + (edition.id -> mostViewed)
      }(Timeout(5.seconds))
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
