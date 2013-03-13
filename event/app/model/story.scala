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
import java.util.concurrent.TimeUnit._
import akka.actor.Cancellable

// model :- Story -> Event -> Articles|Agents|Places

case class Place(id: Option[String] = None) {}

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
  lazy val hasExplainer: Boolean = explainer.isDefined
  lazy val hasContent: Boolean = content.nonEmpty
}

object Event {
  def apply(e: ParsedEvent, content: Seq[ApiContent]): Event = Event(
    title = e.title,
    startDate = e.startDate,
    importance = e.importance,
    agents = e.agents,
    places = e.places,
    explainer = e.explainer.filter(_.nonEmpty),
    content = e.content.flatMap { c =>

      val cleanQuote = c.quote.map { q =>
        Quote(q.text.filter(_.nonEmpty), q.by.filter(_.nonEmpty), q.url.filter(_.nonEmpty), q.subject.filter(_.nonEmpty))
      }
      val storyItems = Some(StoryItems(c.importance, c.colour, c.shares, c.comments, cleanQuote))
      content.find(_.id == c.id).map(Content(_, storyItems))
    }
  )
}

case class Story(
    id: String,
    title: String,
    events: Seq[Event] = Nil,
    explainer: Option[String] = None,
    hero: Option[String] = None) extends implicits.Collections {

  lazy val hasHero: Boolean = hero.isDefined
  lazy val hasEvents: Boolean = events.nonEmpty
  lazy val content = events.flatMap(_.content).sortBy(_.importance).reverse.distinctBy(_.id)
  lazy val hasContent: Boolean = content.nonEmpty
  lazy val agents = events.flatMap(_.agents).sortBy(_.importance).reverse
  lazy val hasAgents: Boolean = agents.nonEmpty
  lazy val contentWithQuotes = contentByImportance.filter(_.quote.isDefined)
  lazy val hasQuotes: Boolean = contentWithQuotes.nonEmpty
  lazy val contentByImportance: Seq[Content] = content.sortBy(_.webPublicationDate.getMillis).reverse.sortBy(_.importance * -1).distinctBy(_.id)
  lazy val contentByPerformance: Seq[Content] = content.sortBy(_.performance).reverse.distinctBy(_.id)
  lazy val contentByTone: List[(String, Seq[Content])] = content.groupBy(_.tones.headOption.map(_.webTitle).getOrElse("News")).toList
  // This is here as a hack, colours should eventually be tones from the content API
  lazy val contentByColour: Map[String, Seq[Content]] = content.groupBy(_.colour).filter(_._1 > 0).map { case (key, value) => toColour(key) -> value }
  lazy val contentByAnalysis: Seq[Content] = contentByColour.get("Analysis").getOrElse(Nil).sortBy(_.webPublicationDate.getMillis).reverse.sortBy(_.importance).filter(!_.quote.isDefined)

  private def toColour(i: Int) = i match {
    case 1 => "Overview"
    case 2 => "Background"
    case 3 => "Analysis"
    case 4 => "Reaction"
    case 5 => "Light"
  }
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
    explainer = s.explainer.filter(_.nonEmpty),
    hero = s.hero.filter(_.nonEmpty),
    events = s.events.map(Event(_, content))
  )

  import Mongo.Stories

  object mongo {

    def withContent(contentId: String): Option[Story] = {
      if (StoryList.storyExistsForContent(contentId)) {

        val parsedStory = measure(Stories.findOne(Map("events.content.id" -> contentId)).map(grater[ParsedStory].asObject(_)))
        loadContentFor(parsedStory)

      } else {
        None
      }
    }

    def byId(id: String): Option[Story] = {
      if (StoryList.storyExists(id)) {
        val parsedStory = measure(Stories.findOne(Map("id" -> id)).map(grater[ParsedStory].asObject(_)))
        loadContentFor(parsedStory)
      } else {
        None
      }
    }

    def latestWithContent(): Seq[Story] = {
      measure(Stories.find(DBObject.empty).map(grater[ParsedStory].asObject(_))).toSeq.reverse.map(loadContent(_))
    }

    def latest(): Seq[Story] = {
      val fields = Map("id" -> 1, "title" -> 1, "hero" -> 1, "explainer" -> 1)
      val stories = measure(Stories.find(DBObject.empty, fields).map(grater[ParsedStory].asObject(_))).toSeq.reverse.map(Story(_, Nil))
      stories
    }

    private def loadContent(parsedStory: ParsedStory): Story = {
        val contentIds = parsedStory.events.flatMap(_.content.map(_.id)).distinct
        // TODO proper edition
        val content = ContentApi.search("UK").showFields("all").ids(contentIds.mkString(",")).pageSize(50).response.results.toSeq
        Story(parsedStory, content)
    }

    private def loadContentFor(parsedStory: Option[ParsedStory]): Option[Story] = {
      parsedStory.map { parsed =>
        loadContent(parsed)
      }
    }
  }

  private def measure[T](block: => T): T = MongoTimingMetric.measure {
    try {
      val result = block
      MongoOkCount.increment()
      result
    } catch {
      case e: Throwable =>
        MongoErrorCount.increment()
        throw e
    }
  }
}

// just used for parsing from Json
private case class ParsedContent(
  id: String,
  importance: Int,
  colour: Int,
  shares: Option[Int] = None,
  comments: Option[Int] = None,
  quote: Option[Quote] = None)

private case class ParsedPlace(id: String)

private case class ParsedStory(
  id: String,
  title: String,
  events: Seq[ParsedEvent] = Nil,
  hero: Option[String] = None,
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
