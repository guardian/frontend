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
        val json = WS.url(u) withRequestTimeout 2000 get() map {
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
      Future(JsNull)
    }
  }

  private def getMembers(json: => Future[JsValue]): Future[Seq[Member]] = {
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

  private def loadMixedMembers(): Future[JsValue] = loadMembers {
    CommercialConfiguration.soulmatesApi.mixedUrl
  }

  private def loadMenMembers(): Future[JsValue] = loadMembers {
    CommercialConfiguration.soulmatesApi.menUrl
  }

  private def loadWomenMembers(): Future[JsValue] = loadMembers {
    CommercialConfiguration.soulmatesApi.womenUrl
  }

  private def loadGayMembers(): Future[JsValue] = loadMembers {
    CommercialConfiguration.soulmatesApi.gayUrl
  }

  private def loadLesbianMembers(): Future[JsValue] = loadMembers {
    CommercialConfiguration.soulmatesApi.lesbianUrl
  }

  def getMixedMembers(json: => Future[JsValue] = loadMixedMembers()): Future[Seq[Member]] = getMembers(json)

  def getMenMembers(json: => Future[JsValue] = loadMenMembers()): Future[Seq[Member]] = getMembers(json)

  def getWomenMembers(json: => Future[JsValue] = loadWomenMembers()): Future[Seq[Member]] = getMembers(json)

  def getGayMembers(json: => Future[JsValue] = loadGayMembers()): Future[Seq[Member]] = getMembers(json)

  def getLesbianMembers(json: => Future[JsValue] = loadLesbianMembers()): Future[Seq[Member]] = getMembers(json)

}
