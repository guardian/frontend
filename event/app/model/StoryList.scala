package model

import common.AkkaSupport
import akka.actor.Cancellable
import akka.util.Duration
import java.util.concurrent.TimeUnit.{ MINUTES, SECONDS }
import tools.Mongo
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.casbah.Imports._
import conf.{ MongoErrorCount, MongoOkCount, MongoTimingMetric }

object StoryList extends AkkaSupport {

  private var schedule: Option[Cancellable] = None

  private val storyIdAgent = play_akka.agent[Seq[String]](Nil)
  private val contentIdAgent = play_akka.agent[Seq[String]](Nil)

  def refresh() {
    storyIdAgent.sendOff { old =>
      measure(Mongo.Stories.find(MongoDBObject.empty, Map("id" -> 1)).map(_.as[String]("id")).toList.distinct)
    }
    contentIdAgent.sendOff { old =>
      measure(Mongo.Stories.find(MongoDBObject.empty, Map("events.content.id" -> 1)).flatMap { dbo =>
        val events = dbo.as[MongoDBList]("events")
        val content = events.map(_.asInstanceOf[DBObject].as[MongoDBList]("content"))
        content.flatMap(_.map(_.asInstanceOf[DBObject].as[String]("id")))
      }.toList.distinct)
    }
  }

  def shutdown() {
    schedule.foreach(_.cancel())
    storyIdAgent.close()
    contentIdAgent.close()
  }

  def startup() {
    schedule = Some(play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
      refresh()
    })
  }

  def storyExists(id: String) = storyIdAgent().contains(id)
  def storyExistsForContent(id: String) = contentIdAgent().contains(id)

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
