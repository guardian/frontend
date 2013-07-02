package controllers.front

import model._
import model.Trailblock
import scala.Some
import common._
import play.api.libs.ws.WS
import play.api.libs.json.{JsObject, JsValue, JsNull}
import play.api.libs.json.Json.parse
import scala.concurrent.Future
import conf.ContentApi


/*
  Responsible for refreshing one block on the front (e.g. the Sport block) for one edition
 */
class RunningOrderAgent(val description: RunningOrderDescription) extends AkkaSupport with Logging {

  private lazy val agent = play_akka.agent[Option[Trailblock]](None)

  def refresh() = {

    // get the running order from the api
    WS.url("/frontsapi/list/test").get() foreach { response =>
      response.status match {
        case 200 =>
          description.articles = (parse(response.body) \ "test").asOpt[List[String]].getOrElse(Nil)
        case _ => log.warn(s"Could not load running order config ${response.status} ${response.statusText}")
      }
    }
  }

  def retrieveArticles(articles: List[String]) = {
    description.query map { trails =>
      agent.send{ old =>
        Some(Trailblock(description, trails))
      }
    }
  }

  def close() = agent.close()

  def trailblock: Option[Trailblock] = agent()

}

object RunningOrderAgent {
  def apply(description: TrailblockDescription): RunningOrderAgent =
    new RunningOrderAgent(description)
}


