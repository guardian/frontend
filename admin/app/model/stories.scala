package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Stories
import com.mongodb

case class Modified(email: String, date: DateTime)

//TODO rename the SContent (and other classes) after we have deleted copies in Event
case class SContent(
  id: String, 
  shares: Option[Int] = None,
  comments: Option[Int] = None,
  importance: Int = 50, 
  colour: Int = 0,
  quote: Option[SQuote] = None,
  headlineOverride: Option[String] = None
)

case class SQuote(
  text: Option[String] = None,
  by: Option[String] = None,
  url: Option[String] = None,
  subject: Option[String] = None
)

/**
  *  Agents are people and organisations who play a role in the story. We want to tell their backstory.
  *  - We use the foaf:Agent property to describe the person/org, xmlns.com/foaf/spec/#term_Agent
  *  - We use the rdfs:sameAs property to externally reference, http://www.w3.org/TR/2000/CR-rdf-schema-20000327/#s2.3.4
  */
case class SAgent(
  id: Option[String],
  name: Option[String] = None,
  explainer: Option[String] = None,
  importance: Int = 0,
  role: Option[String] = None,
  picture: Option[String] = None,
  url: Option[String] = None,
  rdfType: Option[String] = None // Eg, http://schema.org/Person
)

// Places are locations (or things on the landscape - lakes, mountains, churches) where the event happened
case class SPlace(
  name: Option[String]
)

case class SEvent(
  startDate: DateTime,
  title: String,
  importance: Int = 50,
  content: Seq[SContent] = Nil,
  agents: Seq[SAgent] = Nil,
  places: Seq[SPlace] = Nil,
  explainer: Option[String] = None
)

case class Story(
  id: String,
  title: String,
  events: Seq[SEvent] = Nil,
  createdBy: Option[Modified] = None,
  lastModified: Option[Modified],
  explainer: Option[String] = None,
  hero: Option[String] = None,
  notableAssociations: Seq[String] = Nil, // basically 'related stories' (Nb. there's no predicates beyond being related in some way)
  labels: Map[String, String] = Map()
)

object Story {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Story].fromJSON(json)
  def toJsonString(s: Story) = grater[Story].toPrettyJSON(s)

  def toDbObject(s: Story) = grater[Story].asDBObject(s)
  def fromDbObject(s: DBObject) = grater[Story].asObject(s)

  def toJsonList(s: Seq[Story]) = grater[Story].toPrettyJSONArray(s)

  object mongo {
    def createNew(story: Story) = {
      Stories.insert(toDbObject(story)).getLastError.ok()
      story
    }

    //stuff.find( { foo: /^bar$/i } );
    // this is gonna be a slow query
    def find(title:String) = Stories.find(Map("title" -> "(?i)%s".format(title).r.pattern)).toSeq.map(fromDbObject)

    def update(storyId: String, story: Story) = {
      Stories.update(Map("id" -> storyId), toDbObject(story), upsert = false)
      story
    }

    def delete(storyId: String) = Stories.remove(Map("id" -> storyId)).getLastError().ok()

    def get(id: String) = Stories.findOne(Map("id" -> id)).map(fromDbObject)

    def latest = Stories.find().sort(Map("createdBy.date" -> 1)).toSeq.map(fromDbObject)
  }
}
