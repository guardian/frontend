package controllers

import frontsapi.model.{UpdateList, Block, Section, Trail}
import play.api.mvc.{Action, Controller}
import conf.AdminConfiguration
import tools.S3FrontsApi
import play.api.libs.json._
import common.Logging

object FrontsController extends Controller with Logging {
  implicit val trailRead = Json.reads[Trail]
  implicit val blockRead = Json.reads[Block]
  implicit val sectionRead = Json.reads[Section]
  implicit val updateListRead = Json.reads[UpdateList]

  implicit val trailWrite = Json.writes[Trail]
  implicit val blockWrite = Json.writes[Block]
  implicit val sectionWrite = Json.writes[Section]

  def index = AuthAction{ request =>
    Ok(views.html.fronts(AdminConfiguration.environment.stage))
  }

  def schema = AuthAction{ request =>
    S3FrontsApi.getSchema.map { json: String =>
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
    request.body.asJson.map { json =>
      json.asOpt[UpdateList].map { update: UpdateList =>
        S3FrontsApi.getFront(edition, section).map { frontJson =>
          Json.parse(frontJson).asOpt[Section] map { sec =>
            val block = sec.blocks.filter(_.id == blockId).head
            val index = update.after match {
              case Some(true) => block.trails.indexWhere(_.id == update.position.getOrElse("")) + 1
              case _          => block.trails.indexWhere(_.id == update.position.getOrElse(""))
            }
            val splitList = block.trails.splitAt(index)
            val trails = splitList._1 ++ List(Trail(update.item, None, None, None)) ++ splitList._2
            val newSection = sec.copy(blocks = sec.blocks.filterNot(_.id == block.id) :+ block.copy(trails = trails))
            S3FrontsApi.putFront(edition, section, Json.prettyPrint(Json.toJson(newSection))) //Don't need pretty, only for us devs
            Ok
          } getOrElse InternalServerError("Parse Error")
        } getOrElse NotFound("No Edition or Section")
      } getOrElse NotFound("Invalid JSON")
    } getOrElse NotFound("Problem parsing json")
  }

  /**
   * @todo
   */
  def updateTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
    request.body.asJson.map{ json =>
    }
    Ok
  }

  def deleteTrail(edition: String, section: String, blockId: String, trailId: String) = AuthAction{ request =>
      S3FrontsApi.getFront(edition, section) map { json: String =>
        Json.parse(json).asOpt[Section] map { sectionClass: Section =>
          sectionClass.blocks.find(_.id == blockId).map { block =>
            val trails = block.trails.filterNot(_.id == trailId)
            val newSection = sectionClass.copy(blocks = sectionClass.blocks.filterNot(_.id == block.id) :+ block.copy(trails = trails))
            S3FrontsApi.putFront(edition, section, Json.prettyPrint(Json.toJson(newSection))) //Don't need pretty, only for us devs
            Ok
          } getOrElse NotFound("Block Not Found")
        } getOrElse InternalServerError("Parse Error")
      } getOrElse NotFound("No edition or section") //To be more silent in the future?
  }

  private def getBlock(edition: String, section: String, blockId: String): Option[JsObject] = {
    S3FrontsApi.getFront(edition, section).flatMap { r =>
      (Json.parse(r) \ "blocks").as[Seq[JsObject]].find { block =>
        (block \ "id").as[String].equals(blockId)
      }
    }
  }

}
