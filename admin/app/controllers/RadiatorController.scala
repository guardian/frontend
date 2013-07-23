package controllers

import play.api.mvc.Controller
import common.Logging
import tools.{PageviewsByDayGraph, CloudWatch}
import model.MetaData
import conf.Switches

object RadiatorController extends Controller with Logging with AuthLogging {
  def render() = AuthAction{ implicit request =>
      val metadata = new MetaData {
        def id: String = ""
        def webTitle: String = "Radiator"

        def section: String = ""
        def canonicalUrl: Option[String] = None
        def analyticsName: String = ""
      }

      val graphs = Seq(PageviewsByDayGraph) ++ (CloudWatch.latency filter { _.name == "Router" })

      Ok(views.html.radiator(graphs, metadata, Switches.all))
  }
}
