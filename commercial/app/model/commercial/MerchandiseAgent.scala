package model.commercial

import common.{AkkaAgent, Logging}

import scala.concurrent.Future
import scala.util.Random

trait MerchandiseAgent[T] extends Logging {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  def available: Seq[T] = agent()

  def updateAvailableMerchandise(freshMerchandise: Seq[T]): Future[Seq[T]] = {
    agent.alter { oldMerchandise =>
      if (freshMerchandise.nonEmpty) {
        freshMerchandise
      } else {
        log.warn("Using old merchandise as there is no fresh merchandise")
        oldMerchandise
      }
    }
  }

  def getTargetedMerchandise(segment: Segment, default: Seq[T])(targeting: T => Boolean): Seq[T] = {
    val targeted = Random.shuffle(available filter targeting)
    if (targeted.isEmpty) default else targeted
  }

}
