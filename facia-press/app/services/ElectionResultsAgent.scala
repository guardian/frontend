package services

import common.{Box, GuLogging}

import scala.concurrent.Future

class ElectionResultsAgent extends GuLogging {

  private lazy val electionResults = Box[Map[String, String]](Map.empty)

  def refresh(): Future[Unit] = {
    log.info("Fetching election data")
    Future.successful(())
  }

  def getResults: Map[String, String] = electionResults.get()
}
