package model.commercial

import akka.agent.Agent
import common.Logging

import scala.concurrent.Future
import scala.util.Random

object MerchandiseAgent extends Logging {

  def updateAvailableMerchandise[T](agent: Agent[Seq[T]], freshMerchandise: Seq[T]): Future[Seq[T]] = {
    agent.alter { oldMerchandise =>
      if (freshMerchandise.nonEmpty) {
        freshMerchandise
      } else {
        log.warn("Using old merchandise as there is no fresh merchandise")
        oldMerchandise
      }
    }
  }

  def getTargetedMerchandise[T](segment: Segment, available: Seq[T], default: Seq[T])(targeting: T => Boolean): Seq[T] = {
    val targeted = Random.shuffle(available filter targeting)
    if (targeted.isEmpty) default
    else targeted
  }

}
