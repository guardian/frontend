package controllers

import frontsapi.model.{UpdateList, Block, Section, Trail}
import play.api.mvc. Controller
import play.api.libs.json._
import common.{S3FrontsApi, Logging}
import org.joda.time.DateTime
import conf.Configuration


object FrontsController extends Controller with Logging {
  implicit val trailRead = Json.reads[Trail]
  implicit val blockRead = Json.reads[Block]
  implicit val sectionRead = Json.reads[Section]
  implicit val updateListRead = Json.reads[UpdateList]

  implicit val trailWrite = Json.writes[Trail]
  implicit val blockWrite = Json.writes[Block]
  implicit val sectionWrite = Json.writes[Section]

  def index() = AuthAction{ request =>
    Ok(views.html.fronts(Configuration.environment.stage))
  }

  def schema = AuthAction{ request =>
    S3FrontsApi.getSchema.map { json: String =>
      Ok(json).as("application/json")
    }.getOrElse(NotFound)
  }


  def readBlock(edition: String, section: String, blockId: String) = AuthAction{ request =>
    S3FrontsApi.getBlock(edition, section, blockId) map { json =>
      Ok(json).as("application/json")
    } getOrElse NotFound
  }

  def updateBlock(edition: String, section: String, blockId: String) = AuthAction{ request =>
    request.body.asJson.map { json =>
      json.asOpt[UpdateList].map { update: UpdateList =>
        S3FrontsApi.getBlock(edition, section, blockId).map { blockJson =>
          Json.parse(blockJson).asOpt[Block] map { block =>
            val index = update.after match {
              case Some(true) => block.trails.indexWhere(_.id == update.position.getOrElse("")) + 1
              case _          => block.trails.indexWhere(_.id == update.position.getOrElse(""))
            }
            val splitList = block.trails.filterNot(_.id == update.item).splitAt(index)
            val trails = splitList._1 ++ List(Trail(update.item, None, None, None)) ++ splitList._2
            val identity = Identity(request).get
            val newBlock = block.copy(trails = trails, lastUpdated = DateTime.now.toString, updatedBy = identity.fullName, updatedEmail = identity.email)
            S3FrontsApi.putBlock(edition, section, block.id, Json.prettyPrint(Json.toJson(newBlock))) //Don't need pretty, only for us devs
            Ok
          } getOrElse InternalServerError("Parse Error")
        } getOrElse {
          val identity = Identity(request).get
          S3FrontsApi.putBlock(edition, section, blockId, Json.prettyPrint(Json.toJson(Block(blockId, None, List(Trail(update.item, None, None, None)), DateTime.now.toString, identity.fullName, identity.email))))
          Created
        }
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
    S3FrontsApi.getBlock(edition, section, blockId) map { json: String =>
        Json.parse(json).asOpt[Block] map { block: Block =>
          val trails = block.trails.filterNot(_.id == trailId)
          val newBlock = block.copy(trails = trails)
          S3FrontsApi.putBlock(edition, section, block.id, Json.prettyPrint(Json.toJson(newBlock))) //Don't need pretty, only for us devs
          Ok
        } getOrElse InternalServerError("Parse Error")
      } getOrElse NotFound("No edition or section") //To be more silent in the future?
  }

}
