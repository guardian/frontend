package model

import conf.ContentApi
import common.{AkkaSupport, Edition, Logging}
import play.api.libs.ws.WS
import play.api.libs.json.Json._
import conf.Configuration

trait TrailblockNew {
  val id: String
  val name: String
  val edition: Edition

  def trails: Seq[Trail]
  def refresh
  def close
}

/**
 * Trailblock defined from the fronts api
 *
 * @param id
 * @param name
 * @param edition
 */
class RunningOrderTrailblock(
  val id: String,
  val name: String,
  val edition: Edition) extends TrailblockNew with AkkaSupport with Logging
{

  private lazy val agent = play_akka.agent[Seq[Trail]](Nil)

  def trails: Seq[Trail] = agent()

  def refresh = {
    // get the running order from the api
    WS.url(s"${Configuration.frontsApi.host}/frontsapi/list/$id").get() foreach { response =>
      response.status match {
        case 200 =>
          val articles = (parse(response.body) \ id).asOpt[List[String]].getOrElse(Nil)
          retrieveArticles(articles)
        case _ => log.warn(s"Could not load running order: ${response.status} ${response.statusText}")
      }
    }
  }

  private def retrieveArticles(articles: Seq[String]) = {
    ContentApi.search(edition)
      .ids(articles.mkString(","))
      .response map { r =>
      agent.send{ old =>
        r.results.map(new Content(_))
      }
    }
  }

  def close = agent.close()

}

object RunningOrderTrailblock {

  def apply(id: String, name: String)(implicit edition: Edition) = new RunningOrderTrailblock(id, name, edition)

}
