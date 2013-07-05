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
    Ok(
      S3FrontsApi.getFront(section).getOrElse("")
    ).as("application/json")
  }

  def readEdition(section: String, edition: String) = AuthAction{ request =>
    Ok(
      S3FrontsApi.getFront(section) map { r =>
        Json.prettyPrint(Json.parse(r) \ "editions" \ edition)
      } getOrElse("")
    ).as("application/json")
  }

  def readBlock(section: String, edition: String, blockId: String) = AuthAction{ request =>
    Ok(
      S3FrontsApi.getFront(section) map { r =>
        (Json.parse(r) \ "editions" \ edition \ "blocks").as[Seq[JsValue]] find { block =>
          (block \ "id").as[String].equals(blockId)
        } map(Json.prettyPrint(_)) getOrElse("")
      } getOrElse("")
    ).as("application/json")
  }

}
