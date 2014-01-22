package model.diagnostics.alpha

import common.Logging

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
