package model

import org.joda.time.DateTime
import com.mongodb.casbah.Imports._
import com.novus.salat._
import json.{ StringDateStrategy, JSONConfig }
import tools.Mongo
import org.joda.time.format.ISODateTimeFormat
import conf.{ MongoOkCount, MongoErrorCount, ContentApi, MongoTimingMetric }
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import common.{ Logging, AkkaSupport }
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import akka.actor.Cancellable

case class Story(
  id: String,
  title: String,
  events: Seq[Event] = Nil,
  // createdBy: Option[Modified] = None,
  // modifiedBy: Seq[Modified] = Nil,
  explainer: Option[String] = None)

case class Event(
    id: String,
    title: String,
    startDate: DateTime,
    importance: Option[Int] = None,
    contentIds: Seq[String] = Nil,
    content: Seq[Content] = Nil) {
  lazy val hasContent: Boolean = content.nonEmpty
  lazy val contentByDate: Map[String, Seq[Content]] = content.groupBy(_.webPublicationDate.toDateMidnight.toString())
  lazy val contentByTone: Map[String, Seq[Content]] = content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
}

object Story {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  import Mongo.Stories

  object mongo {

    //    def withContent(contentId: String): Seq[Story] = {
    //
    //      Stories.find(Map("events.content.id" -> contentId)).toSeq.head.map(grater[Story].asObject(_))
    //
    //      //if (ContentListAgent.eventExistsFor(contentId)) {
    //      // assume there is just one for now, that is not necessarily true
    //      // val entryEvent = measure(Stories.find(Map("content.id" -> contentId)).map(grater[ParsedEvent].asObject(_)))
    //      // allEventsFor(entryEvent)
    //      // } else {
    //      //   Nil
    //      // }
    //    }

    def byId(id: String): Option[Story] = {
      Stories.findOne(Map("id" -> id)).map(grater[Story].asObject(_))
    }

    // private def allEventsFor(entryEvent: Iterator[ParsedEvent]): Seq[Event] = {

    //   val parsedEvents = entryEvent.flatMap(_._rootEvent.map(_.id)).flatMap { rootId =>
    //     measure(Events.find(Map("_rootEvent.id" -> rootId)).$orderby(Map("startDate" -> 1)).map(grater[ParsedEvent].asObject(_)))
    //   }.toList

    //   val rawEvents = parsedEvents.map(Event(_))

    //   val apiContent: Seq[ApiContent] = {
    //     val idList = rawEvents.flatMap(_.contentIds).distinct.mkString(",")
    //     //todo proper edition
    //     ContentApi.search("UK").ids(idList).pageSize(50).response.results.toSeq
    //   }

    //   rawEvents.map {
    //     raw =>
    //       val eventContent = raw.contentIds.flatMap(id => apiContent.find(_.id == id))

    //       val contentWithImportance = eventContent.map { content =>
    //         val contentImportance = parsedEvents.find(_.id == raw.id).flatMap(_.content.find(_.id == content.id).map(_.importance))

    //         new Content(content, contentImportance)
    //       }
    //       raw.copy(content = contentWithImportance)
    //   }
    // }
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
private case class ParsedContent(id: String, importance: Int)

private case class ParsedEvent(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[ParsedContent] = Nil)

// while this is a prototype and we have no real way of knowing which content is
// related to an event we want to limit the number of calls to the DB.
// Just keep a list in memory to check against.
// object ContentListAgent extends AkkaSupport with Logging {

//   import Mongo.Stories

//   private implicit val ctx = new Context {
//     val name = "ISODateTimeFormat context"

//     override val jsonConfig = JSONConfig(dateStrategy =
//       StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
//   }

//   private val agent = play_akka.agent[Seq[String]](Nil)

//   private var schedule: Option[Cancellable] = None

//   def refresh() {
//     log.info("updating content list")
//     agent.sendOff { old =>
//       val ids = Stories.find().flatMap { dbo =>
//         grater[ParsedEvent].asObject(dbo).content.map(_.id)
//       }
//       val newIds = ids.toList
//       log.info("Updated Content List with %s ids".format(ids.length))
//       newIds
//     }
//   }

//   def startup() {
//     schedule = Some(play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
//       refresh()
//     })
//   }

//   def shutdown() {
//     agent.close()
//     schedule.foreach(_.cancel())
//   }

//   def storyExistsFor(id: String) = agent().contains {
//     if (id.startsWith("/")) id.drop(1) else id
//   }
// }