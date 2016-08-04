package controllers

import com.softwaremill.macwire._
import controllers.BreakingNews.BreakingNewsApi

trait AdminJobsControllers {
  def breakingNewsApi: BreakingNewsApi
  lazy val newsAlertController = wire[NewsAlertController]
}
