package common.dfp

import common.Box
import common.dfp._
import common.GuLogging
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import services.S3
import scala.io.Codec.UTF8

import scala.concurrent.{ExecutionContext, Future}

class RemoteBundleRetriever() extends GuLogging {
  def run()(implicit executionContext: ExecutionContext): Future[Unit] =
    Future {
      RemoteBundleAgent.refresh()
    }
}
