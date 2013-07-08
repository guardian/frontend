package controllers

import play.api.mvc.Controller
import conf.AdminConfiguration
import tools.S3FrontsApi
import play.api.libs.json._
import common.Logging

object FrontsController extends Controller with Logging {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(AdminConfiguration.environment.stage))
  }

  def schema() = AuthAction{ request =>
    S3FrontsApi.getSchema().map { json: String =>
      Ok(json).as("application/json")
    }.getOrElse(NotFound)
  }

  def readSection(edition: String, section: String) = AuthAction{ request =>
    S3FrontsApi.getFront(edition, section).map { json: String =>
      Ok(json).as("application/json")
    }.getOrElse(NotFound)
  }

  def readBlock(edition: String, section: String, blockId: String) = AuthAction{ request =>
    getBlock(edition, section, blockId).map { block =>
      Ok(Json.prettyPrint(block)).as("application/json")
    }.getOrElse(NotFound)
  }

  /**
   * @todo
   */
  def updateBlock(edition: String, section: String, blockId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  /**
   * @todo
   */
  def updateTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  /**
   * @todo
   */
  def deleteTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
    var front = Json.parse(S3FrontsApi.getFront(edition, section).get)
    val block = (front \ "blocks").as[Seq[JsObject]].find { block =>
      (block \ "id").as[String].equals(blockId)
    }
    val blockIndex = (front \ "blocks").as[Seq[JsObject]].indexWhere { block =>
      (block \ "id").as[String].equals(blockId)
    }
    block.map { block =>
      val newTrails = (block \ "trails").as[Seq[JsObject]].filterNot { trail =>
        (trail \ "id").as[String].equals(trailId)
      }
      block.transform((__ \ 'trails).json.put(Json.arr(newTrails))).map { json =>
        // NOTE: indexed path broke for some reason
        front.transform((__ \ 'blocks)(blockIndex).json.put(Json.arr(json))).map { foo =>
          Ok(Json.prettyPrint(foo))
        }.getOrElse(NotFound)
      }.getOrElse(NotFound)
    }.getOrElse(NotFound)
  }

  private def getBlock(edition: String, section: String, blockId: String): Option[JsObject] = {
    S3FrontsApi.getFront(edition, section).flatMap { r =>
      (Json.parse(r) \ "blocks").as[Seq[JsObject]].find { block =>
        (block \ "id").as[String].equals(blockId)
      }
    }
  }

}
