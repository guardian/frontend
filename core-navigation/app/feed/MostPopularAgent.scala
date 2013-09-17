package feed

import conf.ContentApi
import common._
import model.{SupportedContentFilter, Content}
import scala.concurrent.duration._
import scala.concurrent.Await
import services.OphanApi
import scala.util.Try


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
          val mostViewed = SupportedContentFilter(response.mostViewed map { Content(_) }) take 10
          agent.send{ old =>
            old + (edition.id -> mostViewed)
          }
      }
    }
  }
}


object MostPopularFromFacebookAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Content]]](Map.empty)

  def mostPopular: Seq[Content] = agent().get("facebook").getOrElse(Nil)

  def await() {
    quietly(agent.await(2.seconds))
  }

  def refresh() {

    def getMostPopularReferredFromFacebook: Seq[String] = {

      def path(url: String) = url split "/" drop 3 mkString "/"

      val paths = OphanApi.getMostRead(referrer = "facebook", hours = 1) map {
        json => {
          val urls = (json \\ "url") map (_.as[String])
          urls map path
        }
      }

      for (e <- paths.failed) log error "Failed to get most popular referred from Facebook: " + e.getMessage

      Try(Await.result(paths, 2.seconds)) getOrElse Nil
    }

    log.info("Refreshing most popular referred from facebook.")

    val ophanList = getMostPopularReferredFromFacebook take 10
    val ophanListAsString = ophanList mkString ","
    log.debug("Ophan list of most popular referred from facebook: " + ophanListAsString)

    val contentApiList = ContentApi.search(Edition.defaultEdition).ids(ophanListAsString).response
    contentApiList foreach {
      response =>
        val results = response.results map (Content(_))
        log.debug("Content API list from IDs of most popular referred from facebook: " + results.map(_.id).mkString(","))
        val mostViewed = SupportedContentFilter(results) take 10
        val sortedMostViewed = mostViewed sorted Ordering.by[Content, Int](content => ophanList.indexOf(content.id))
        agent.send(old => old + ("facebook" -> sortedMostViewed))
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
        val mostViewed = SupportedContentFilter(response.mostViewed map { Content(_) }) take 10
        agent.send{ old =>
          old + (edition.id -> mostViewed)
        }
      }
    }
  }
}
