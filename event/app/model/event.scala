package model

import org.joda.time.DateTime
import com.mongodb.casbah.Imports._
import com.novus.salat._
import json.{ StringDateStrategy, JSONConfig }
import tools.Mongo
import org.joda.time.format.ISODateTimeFormat
import conf.{ MongoOkCount, MongoErrorCount, ContentApi, MongoTimingMetric }
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }

case class Event(
    id: String,
    title: String,
    startDate: DateTime,
    importance: Option[Int] = None,
    contentIds: Seq[String] = Nil,
    content: Seq[Content] = Nil) {
  lazy val contentByDate: Map[String, Seq[Content]] = content.groupBy(_.webPublicationDate.toDateMidnight.toString())
  lazy val contentByTone: Map[String, Seq[Content]] = content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
}

object Event {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  import Mongo.Events

  object mongo {

    def eventChainFor(eventId: String) = {
      val entryEvent = measure(Events.find(Map("id" -> eventId)).map(grater[ParsedEvent].asObject(_)))
      allEventsFor(entryEvent)
    }

    def withContent(contentId: String) = {
      // assume there is just one for now, that is not necessarily true
      val entryEvent = measure(Events.find(Map("content.id" -> contentId)).map(grater[ParsedEvent].asObject(_)))
      allEventsFor(entryEvent)
    }

    private def allEventsFor(entryEvent: Iterator[ParsedEvent]): Seq[Event] = {

      val parsedEvents = entryEvent.flatMap(_._rootEvent.map(_.id)).flatMap { rootId =>
        measure(Events.find(Map("_rootEvent.id" -> rootId)).$orderby(Map("startDate" -> 1)).map(grater[ParsedEvent].asObject(_)))
      }.toList

      val rawEvents = parsedEvents.map(Event(_))

      val apiContent: Seq[ApiContent] = {
        val idList = rawEvents.flatMap(_.contentIds).distinct.mkString(",")
        //todo proper edition
        ContentApi.search("UK").ids(idList).pageSize(50).response.results.toSeq
      }

      rawEvents.map {
        raw =>
          val eventContent = raw.contentIds.flatMap(id => apiContent.find(_.id == id))

          val contentWithImportance = eventContent.map { content =>
            val contentImportance = parsedEvents.find(_.id == raw.id).flatMap(_.content.find(_.id == content.id).map(_.importance))

            new Content(content, contentImportance)
          }
          raw.copy(content = contentWithImportance)
      }
    }
  }

  def apply(parsedEvent: ParsedEvent): Event = Event(
    id = parsedEvent.id,
    title = parsedEvent.title,
    startDate = parsedEvent.startDate,
    importance = parsedEvent.importance,
    contentIds = parsedEvent.content.map(_.id)
  )

  private def measure[T](block: => T): T = MongoTimingMetric.measure {
    try {
      val result = block
      MongoOkCount.increment()
      result
    } catch {
      case e =>
        MongoErrorCount.increment()
        throw e
    }
  }
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
  ancestor: Option[ParsedParent] = None,
  _rootEvent: Option[ParsedParent] = None)