package model.commercial.soulmates

import scala.concurrent.Future
import common.{Logging, ExecutionContexts}
import play.api.libs.ws.WS
import conf.CommercialConfiguration
import play.api.libs.json.{JsNull, JsArray, JsValue}

object SoulmatesApi extends ExecutionContexts with Logging {

  private def loadMembers(url: => Option[String]): Future[JsValue] = {
    url map {
      u =>
        val json = WS.url(u) withRequestTimeout 10000 get() map {
          response => response.json
        }

        json onSuccess {
          case JsArray(ads) => log.info(s"Loaded ${ads.size} soulmates ads from $u")
        }
        json onFailure {
          case e: Exception => log.error(s"Loading soulmates ads from $u failed: ${e.getMessage}")
        }

        json
    } getOrElse {
      log.warn("No Soulmates API config properties set")
      Future(JsNull)
    }
  }

  def parse(json: => Future[JsValue]): Future[Seq[Member]] = {
    json map {
      case JsArray(members) =>
        members map {
          member =>
            Member(
              (member \ "username").as[String],
              Gender((member \ "gender").as[String]),
              (member \ "age").as[Int],
              (member \ "profile_photo").as[String]
            )
        }
      case other => Nil
    }
  }

  def getMenMembers: Future[Seq[Member]] = parse(loadMembers {
    CommercialConfiguration.soulmatesApi.menUrl
  })

  def getWomenMembers: Future[Seq[Member]] = parse(loadMembers {
    CommercialConfiguration.soulmatesApi.womenUrl
  })

}
