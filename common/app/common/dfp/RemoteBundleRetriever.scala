package common.dfp

import common.Box
import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

class RemoteBundleRetriever() extends GuLogging {
  def run()(implicit executionContext: ExecutionContext): Future[Unit] =
    Future {
      RemoteBundleAgent.refresh()
    }
}
