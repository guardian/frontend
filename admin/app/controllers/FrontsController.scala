package controllers

import play.api.mvc.Controller
import conf.AdminConfiguration
import tools.S3FrontsApi
import play.api.libs.json.{JsValue, Json}
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
    S3FrontsApi.getFront(edition, section).map { r =>
      (Json.parse(r) \ "blocks").asOpt[Seq[JsValue]].map { blocks =>
        blocks.find { block =>
          (block \ "id").as[String].equals(blockId)
        }.map { json =>
          Ok(Json.prettyPrint(json)).as("application/json")
        }.getOrElse(NotFound)
      }.getOrElse(NotFound)
    }.getOrElse(NotFound)
  }

  def updateBlock(section: String, edition: String, blockId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
      json \ ""
    }
    Ok
  }

  def deleteTrail(section: String, edition: String, blockId: String, trail: String) = AuthAction{ request =>
    S3FrontsApi.getFront(edition, section).map { r =>
      (Json.parse(r) \ "blocks").asOpt[Seq[JsValue]].map { blocks =>
        blocks.find { block =>
          (block \ "id").as[String].equals(blockId)
        }.map { json =>
          Ok(Json.prettyPrint(json)).as("application/json")
        }
      }
    }
    Ok
  }

//  private def getBlock(section: String, edition: String, block: String): Option[JsValue] = {
//    S3FrontsApi.getFront(section).flatMap { r =>
//      (Json.parse(r) \ "editions" \ edition \ "blocks").asOpt[Seq[JsValue]].flatMap { blocks =>
//        blocks.find { block =>
//          (block \ "id").as[String].equals(block)
//        }
//      }
//    }
//  }

}
