package controllers

import play.api.mvc.Controller
import conf.AdminConfiguration
import tools.S3FrontsApi
import play.api.libs.json.{JsValue, Json}

object FrontsController extends Controller {

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(AdminConfiguration.environment.stage))
  }

  def readSection(section: String) = AuthAction{ request =>
    S3FrontsApi.getFront(section).map { json: String =>
      Ok(json).as("application/json")
    }.getOrElse(NotFound)
  }

  def readEdition(section: String, edition: String) = AuthAction{ request =>
    S3FrontsApi.getFront(section).map { r =>
      (Json.parse(r) \ "editions" \ edition).asOpt[JsValue].map { json =>
        Ok(json).as("application/json")
      }.getOrElse(NotFound)
    }.getOrElse(NotFound)
  }

  def readBlock(section: String, edition: String, blockId: String) = AuthAction{ request =>
    S3FrontsApi.getFront(section).map { r =>
      (Json.parse(r) \ "editions" \ edition \ "blocks").asOpt[Seq[JsValue]].map { blocks =>
        blocks.find { block =>
          (block \ "id").as[String].equals(blockId)
        }.map { json =>
          Ok(Json.prettyPrint(json)).as("application/json")
        }.getOrElse(NotFound)
      }.getOrElse(NotFound)
    }.getOrElse(NotFound)
  }

}
