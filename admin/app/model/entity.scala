package model

import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Entities
import com.novus.salat._
import json.{ StringDateStrategy, JSONConfig }

case class Entity(
    id: String,
    properties: Map[String, String] // very simple model, just a bunch of key values at the moment, Eg, 'geo:latitude' => '-0.12'
) extends Enumeration

object Entity {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Entity].fromJSON(json)
  def toJsonString(s: Entity) = grater[Entity].toPrettyJSON(s)

  def toDbObject(s: Entity) = grater[Entity].asDBObject(s)
  def fromDbObject(s: DBObject) = grater[Entity].asObject(s)

  def toJsonList(s: Seq[Entity]) = grater[Entity].toPrettyJSONArray(s)

  object mongo {
    def createNew(entity: Entity) = {
      Entities.insert(toDbObject(entity)).getLastError.ok()
      entity
    }
    
    def find(id:String) = Entities.find(Map("id" -> "(?i)%s".format(id).r.pattern)).limit(1000).toSeq.map(fromDbObject)
    
    def findByRdfType(rdfType:String) = Entities.find(Map("properties.rdf:type" -> rdfType)).limit(1000).toSeq.map(fromDbObject)

    def update(entityId: String, entity: Entity) = {
      Entities.update(Map("id" -> entityId), toDbObject(entity), upsert = false)
      entity
    }

    def delete(entityId: String) = Entities.remove(Map("id" -> entityId)).getLastError().ok()

    def get(id: String, rdfType: String = null) = {
        val query = scala.collection.mutable.Map("id" -> id)
        if (!rdfType.isEmpty) query += "properties.rdf:type" -> rdfType
        Entities.findOne(query).map(fromDbObject)
    }

  }
}
