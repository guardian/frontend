package controllers

import common.{ExecutionContexts, Logging}
import conf.Configuration
import play.Play
import play.api.libs.json._
import services.S3

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

trait S3BreakingNews extends S3 {
  override lazy val bucket = Configuration.aws.bucket
  lazy val stage = if (Play.isTest) "TEST" else Configuration.environment.stage.toUpperCase
  val namespace = "notifications"
  lazy val location = s"$stage/$namespace"
  def getKeyForPath(path: String): String = s"$location/$path.json"
}
object S3BreakingNews extends S3BreakingNews

trait BreakingNewsApi extends Logging with ExecutionContexts {

  val s3: S3BreakingNews
  val breakingNewskey = s3.getKeyForPath("breaking-news")

  def getBreakingNews : Future[Option[JsValue]] = {
    Future {
      Try(s3.get(breakingNewskey)) match {
        case Success(content) => content match {
          case Some(s) => Try(Json.parse(s)) match {
            case Success(json) =>
              Some(json)
            case Failure(e) =>
              log.error(s"Cannot deserialize Breaking News json (${e.getMessage})")
              None
          }
          case None =>
            None
        }
        case Failure(e) =>
          log.error(s"Cannot fetch Breaking News json from S3 (${e.getMessage})")
          None
      }
    }
  }

  def putBreakingNews(json: JsValue) : Future[Boolean] = {
    Future {
      Try(s3.putPublic(breakingNewskey, json.toString, "application/json")) match {
        case Success(_) =>
          true
        case Failure(e) =>
          log.error(s"Cannot write Breaking News json to S3 (${e.getMessage})")
          false
      }

    }
  }

}

object BreakingNewsApi extends BreakingNewsApi {
  lazy val s3 = S3BreakingNews
}
