package model

import org.joda.time.DateTime
import com.mongodb.casbah.Imports._
import com.novus.salat._
import json.{ StringDateStrategy, JSONConfig }
import tools.Mongo
import org.joda.time.format.ISODateTimeFormat
import conf.ContentApi
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }

case class Event(
  id: String,
  title: String,
  contentIds: Seq[String] = Nil,
  content: Seq[Content] = Nil)

object Event {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  import Mongo.Events

  object mongo {

    def withContent(contentId: String) = {

      val rawEvents = Events.find(Map("content.id" -> contentId)).map { dbObj => grater[ParsedEvent].asObject(dbObj) }.map(Event(_)).toList

      val query = rawEvents.flatMap(_.contentIds).distinct.mkString(",")

      val apiContent: Seq[Content] = ContentApi.search("UK").ids(query).response.results.map(new Content(_))

      rawEvents.map { raw =>
        raw.copy(
          content = apiContent.filter(c => raw.contentIds.contains(c.id))
        )
      }
    }
  }

  def apply(parsedEvent: ParsedEvent): Event = Event(
    id = parsedEvent.id,
    title = parsedEvent.title,
    contentIds = parsedEvent.content.map(_.id)
  )
}

// just used for parsing from Json
private case class ParsedParent(id: String, title: Option[String] = None)
private case class ParsedContent(id: String, importance: Int)

private case class ParsedEvent(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[ParsedContent] = Nil,
  parent: Option[ParsedParent] = None,
  ancestor: Option[ParsedParent] = None)