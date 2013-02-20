package model

import common.AkkaSupport
import akka.actor.Cancellable
import akka.util.Duration
import java.util.concurrent.TimeUnit.{ MINUTES, SECONDS }
import tools.Mongo
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.casbah.Imports._

object StoryList extends AkkaSupport {

  private var schedule: Option[Cancellable] = None

  private val agent = play_akka.agent[Seq[String]](Nil)

  def refresh() {
    agent.sendOff { old =>
      Mongo.Stories.find(MongoDBObject.empty, Map("id" -> 1)).map(_.as[String]("id")).toSeq.distinct
    }
  }

  def shutdown() {
    schedule.foreach(_.cancel())
    agent.close()
  }

  def startup() = {
    schedule = Some(play_akka.scheduler.every(Duration(1, MINUTES), initialDelay = Duration(5, SECONDS)) {
      refresh()
    })
  }

  def exists(id: String) = agent().contains(id)
}
