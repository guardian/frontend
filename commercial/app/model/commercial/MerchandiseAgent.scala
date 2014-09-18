package model.commercial

import akka.agent.Agent
import common.Logging

object MerchandiseAgent extends Logging {

  def updateAvailableMerchandise[T](agent: Agent[Seq[T]], freshMerchandise: Seq[T]) {
    agent.send { oldMerchandise =>
      if (freshMerchandise.nonEmpty) {
        freshMerchandise
      } else {
        log.warn("Cannot update current ads because feed is empty")
        oldMerchandise
      }
    }
  }

}
