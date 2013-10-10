package model.travel.service

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.travel.Offer
import scala.concurrent.duration._
import scala.concurrent.Await

object OffersAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Offer]]](Map.empty)

  def allOffers: Seq[Offer] = agent().get("offers").getOrElse(Nil)

  def refresh() {
    val offers = Await.result(OffersApi.getAllOffers, atMost = 20.seconds)
    agent send Map("offers" -> offers)
  }

}
