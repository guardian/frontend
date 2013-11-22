package model.diagnostics.javascript 

import common._
import conf._
import net.sf.uadetector.service.UADetectorServiceFactory
import model.diagnostics.alpha._
import play.api.mvc.{ Content => _, _ }

object Alpha extends Logging {
  
  def report(queryString: Map[String, Seq[String]]) {
      
      val qs = queryString.map { case (k,v) => k -> v.mkString }
      val platform = qs.get("platform")

      qs.get("type") match {
        case Some("session") => {
          platform match {
            case Some("desktop") =>
              DesktopSession.increment
              DesktopView.increment
            case Some("responsive") =>
              ResponsiveSession.increment
              ResponsiveView.increment
            case _ => {}
          }
        }
        case Some("view") => {
          platform match {
            case Some("desktop") => DesktopView.increment
            case Some("responsive") => ResponsiveView.increment
            case _ => {}
          }
        }
        case _ => {}
      }
    
    }
} 
