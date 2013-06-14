package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Events

case class Parent(id: String, title: Option[String] = None)
case class EContent(id: String, importance: Int, colour: Int = 0)

/**
  *  Agents are people and organisations who play a role in the story. We want to tell their backstory.
  *  - We use the rdfs:sameAs property to externally reference, http://www.w3.org/TR/2000/CR-rdf-schema-20000327/#s2.3.4
  */
case class Agent(
    id: Option[String], 
    name: Option[String] = None,  // Eg. 'Jeremy Hunt'
    explainer: Option[String] = None, // Their role in the story
    role: Option[String] = None, // Eg. 'Secretary of State for Health'
    picture: Option[String] = None,
    url: Option[String] = None,
    rdfType: String // Ie. 'http://schema.org/Person' or 'http://schema.org/Organization'
    )

// Places are locations (or things on the landscape - lakes, mountains, churches) where the event happened
case class xPlace(id: Option[String], sameAs: Seq[String] = Nil)

case class Event(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[EContent] = Nil,
  parent: Option[Parent] = None,
  _rootEvent: Option[Parent] = None, //denormalisation to group events together, represents event at the top of this tree
  createdBy: Option[String] = None,
  lastModifiedBy: Option[String] = None,
  agents: Seq[Agent] = Nil,
  places: Seq[xPlace] = Nil,
  explainer: Option[String] = None
)

object Event {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Event].fromJSON(json)
  def toJsonString(e: Event) = grater[Event].toPrettyJSON(e)

  def toDbObject(e: Event) = grater[Event].asDBObject(e)
  def fromDbObject(e: DBObject) = grater[Event].asObject(e)

  def toJsonList(e: Seq[Event]) = grater[Event].toPrettyJSONArray(e)


  object mongo {

    def byId(eventId: String): Option[Event] = Events.findOne(Map("id" -> eventId)).map{ fromDbObject }

    def create(event: Event) = Events.insert(toDbObject(event)).getLastError.ok()

    def update(event: Event) = Events.update(Map("id" -> event.id),  toDbObject(event)).getLastError.ok()

    def createNew(event: Event) = {
      val eventWithParent = withUpdatedParent(event)
      Event.mongo.create(eventWithParent)
      eventWithParent
    }

    def delete(eventId: String) = {
      val deleteOk = Events.remove(Map("id" -> eventId)).getLastError.ok()

      //TODO somebody please think of the children
      // fix broken parents on child events  <------ MC perhaps just make ophans visible to the user?

      deleteOk
    }

    def update(event: Event, eventId: Option[String] = None) = {

      //we may actually be updating the id, in which case we need to update using the old id
      val idToUpdate = eventId.getOrElse(event.id)


      val eventWithParent = withUpdatedParent(event)

      val updateOk = Events.update(Map("id" -> idToUpdate), Event.toDbObject(eventWithParent), upsert = false)
       .getLastError.get("updatedExisting").asInstanceOf[Boolean]

      updateChildren(eventWithParent)

      updateOk
    }

    private def updateChildren(event: Event) {
      val children = Events.find(Map("parent.id" -> event.id)).map(fromDbObject)
      children.foreach{ child =>
        update(withUpdatedParent(child))
        updateChildren(child)
      }
    }

    private def withUpdatedParent(event: Event): Event = {
      val parentEvent = event.parent.flatMap(p => Event.mongo.byId(p.id))

      //rootId is a denormalisation. The idea is that each event inherits the rootId from the
      //very first item in the chain. It gives us easy access to the entire chain.
      //If there is no parent then use the current id
      val rootEventId = parentEvent.flatMap(_._rootEvent.map(_.id)) // the parent's root
        .orElse(parentEvent.map(_.id)) // or the parent's id
        .orElse(Some(event.id)) // or this event id

      val eventWithParent = event.copy(
        parent = parentEvent.map(p => Parent(p.id, Some(p.title))),
        _rootEvent = rootEventId.map(Parent(_))
      )
      eventWithParent
    }
  }
}
