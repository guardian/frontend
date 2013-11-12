package model.commercial.soulmates

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import play.api.libs.ws.WS
import conf.CommercialConfiguration
import play.api.libs.json.{JsArray, JsString, JsValue}

object SoulmatesApi extends ExecutionContexts with Logging {

  private def loadPopularMembers: Future[JsValue] = {
    CommercialConfiguration.soulmatesApi.popularUrl map {
      url =>
        val json = WS.url(url) withRequestTimeout 2000 get() map {
          response => response.json
        }

        json onSuccess {
          case JsArray(ads) => log.info(s"Loaded ${ads.size} soulmates ads")
        }
        json onFailure {
          case e: Exception => log.error(s"Loading soulmates ads failed: ${e.getMessage}")
        }

        json
    } getOrElse {
      log.warn("No Soulmates API config properties set")
      Future(JsString("{}"))
    }
  }

  def getPopularMembers(json: => Future[JsValue] = loadPopularMembers): Future[Seq[Member]] = {
    json map {
      case JsArray(members) =>
        members map {
          member =>
            Member(
              (member \ "username").as[String],
              (member \ "gender").as[String],
              (member \ "age").as[Int],
              (member \ "profile_photo").as[String]
            )
        }
      case other => Nil
    }
  }

}
