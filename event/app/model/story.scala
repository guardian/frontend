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

// model :- Story -> Event -> Articles|Agents|Places

case class Place(id: String) {}

case class Agent(
  name: Option[String] = None,
  explainer: Option[String] = None,
  importance: Int = 0,
  role: Option[String] = None,
  picture: Option[String] = None,
  rdfType: Option[String] = None // Eg, http://schema.org/Person
  ) {}

case class Event(
    title: String,
    startDate: DateTime,
    importance: Option[Int] = None,
    agents: Seq[Agent] = Nil,
    places: Seq[Place] = Nil,
    contentIds: Seq[String] = Nil,
    explainer: Option[String] = None,
    content: Seq[Content] = Nil) {
  lazy val hasContent: Boolean = content.nonEmpty
  lazy val contentByDate: Map[String, Seq[Content]] = content.groupBy(_.webPublicationDate.toDateMidnight.toString())
  lazy val contentByTone: Map[String, Seq[Content]] = content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News"))
}

object Event {
  def apply(e: ParsedEvent, content: Seq[ApiContent]): Event = Event(
    title = e.title,
    startDate = e.startDate,
    importance = e.importance,
    agents = e.agents,
    places = e.places,
    explainer = e.explainer,
    content = e.content.flatMap { c =>
      content.find(_.id == c.id).map(new Content(_, Some(c.importance), Some(c.colour)))
    }
  )
}

case class Story(
    id: String,
    title: String,
    events: Seq[Event] = Nil,
    explainer: Option[String] = None) {
  lazy val contentByTone: List[(String, Seq[Content])] = events.flatMap(_.content).groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News")).toList
}

object Story {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  def apply(s: ParsedStory, content: Seq[ApiContent]): Story = Story(
    id = s.id,
    title = s.title,
    explainer = s.explainer,
    events = s.events.map(Event(_, content))
  )

  import Mongo.Stories

  object mongo {

    def withContent(contentId: String): Option[Story] = {
      if (StoryList.storyExistsForContent(contentId)) {
        val parsedStory = Stories.findOne(Map("events.content.id" -> contentId)).map(grater[ParsedStory].asObject(_))
        loadContentFor(parsedStory)
      } else {
        None
      }
    }

    def byId(id: String): Option[Story] = {
      if (StoryList.storyExists(id)) {
        val parsedStory = Stories.findOne(Map("id" -> id)).map(grater[ParsedStory].asObject(_))
        loadContentFor(parsedStory)
      } else {
        None
      }
    }

    private def loadContentFor(parsedStory: Option[ParsedStory]): Option[Story] = {
      parsedStory.map { parsed =>
        val contentIds = parsed.events.flatMap(_.content.map(_.id)).distinct
        // TODO proper edition
        val content = ContentApi.search("UK").ids(contentIds.mkString(",")).pageSize(50).response.results.toSeq
        Story(parsed, content)
      }
    }
  }

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
private case class ParsedContent(id: String, importance: Int, colour: Int)
//private case class ParsedAgent(id: String)
private case class ParsedPlace(id: String)

private case class ParsedStory(
  id: String,
  title: String,
  events: Seq[ParsedEvent] = Nil,
  explainer: Option[String] = None)

private case class ParsedEvent(
    title: String,
    startDate: DateTime,
    importance: Option[Int] = None,
    agents: Seq[Agent] = Nil,
    places: Seq[Place] = Nil,
    explainer: Option[String] = None,
    content: Seq[ParsedContent] = Nil) {
}
