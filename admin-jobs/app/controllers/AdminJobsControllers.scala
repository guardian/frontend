package controllers

import akka.actor.ActorSystem
import com.softwaremill.macwire._
import controllers.BreakingNews.BreakingNewsApi

trait AdminJobsControllers {
  def breakingNewsApi: BreakingNewsApi
  def actorSystem: ActorSystem
  lazy val newsAlertController = wire[NewsAlertController]
}
