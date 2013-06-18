package controllers.event

import common.Logging
import play.api.mvc._
import controllers.{AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import model.Entity

object EntityController extends Controller with Logging with AuthLogging {
  
  def find(id: String) = AuthAction{ request =>
    val results = Entity.mongo.find(id)
    Ok(Entity.toJsonList(results)).as("application/json")
  }
  
  def findByType(rdfType: String) = AuthAction{ request =>
    val results = Entity.mongo.findByRdfType(rdfType)
    Ok(Entity.toJsonList(results)).as("application/json")
  }

  def create() = AuthAction{ request =>
    request.body.asJson.map(_.toString).map(Entity.fromJson)
      .map(entity => Ok(Entity.toJsonString(Entity.mongo.createNew(entity))).as("application/json"))
      .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  // def update(entityId: String) = AuthAction{ request =>
  def update(entityId: String) = AuthAction{ request =>
    // entityId has leading /
    Entity.mongo.get(entityId.drop(1)).map{ oldEntity =>
      request.body.asJson.map(_.toString).map(Entity.fromJson)
        .map(entity => Ok(Entity.toJsonString(Entity.mongo.update(oldEntity.id, entity))).as("application/json"))
        .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
    }.getOrElse(NotFound)
  }

  def delete(entityId: String) = AuthAction{ request =>
    // entityId will have leading /
    Entity.mongo.delete(entityId.drop(1))
    Ok(status("deleted: " + entityId)).as("application/json")
  }

  def read(entityId: String, rdfType: String) = AuthAction{ request =>
    Entity.mongo.get(entityId.drop(1), rdfType).map{ entity =>   Ok(Entity.toJsonString(entity)) }
      .getOrElse(NotFound(status("no entity found: " + entityId)).as("application/json"))
  }
  
  def status(msg: String) = toJson(Map("status" -> msg))
}
