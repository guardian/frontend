package model.diagnostics 

import common._
import conf._
import net.sf.uadetector.service.UADetectorServiceFactory
import model.diagnostics._
import play.api.mvc.{ Content => _, _ }

object Error extends Logging {
  
  val agent = UADetectorServiceFactory.getResourceModuleParser()
  
  private def isHealthCheck(userAgent: String): Boolean = {
    userAgent startsWith "ELB-HealthChecker"
  }

  private def getOperatingSystem(userAgent:String) = {
    val ua = agent.parse(userAgent)
    ua.getOperatingSystem().getFamily.toString match {
      case "OS_X"       => "osx"
      case "IOS"        => "ios"
      case "ANDROID"    => "android"
      case "WINDOWS"    => "windows"
      case "RIMOS"      => "rimos"
      case _            => "unknown"
    }
  }

  def report(queryString: Map[String, Seq[String]], userAgent: String) {
      val qs = queryString.map { case (k,v) => k -> v.mkString }
      val osFamily = getOperatingSystem(userAgent).toString
      
      if (qs.contains("type") && !isHealthCheck(userAgent)) {
      
        // temporary log to the application logs until we find a decent log
        // analysis tool to send this output

        log.error(s"""${osFamily}\t${qs.values.mkString("\t")}\t${userAgent}""")
        
        qs.get("type").get.toString match {
          case "js" => Metric.increment(s"js.${osFamily}") 
          case "ads" => Metric.increment("ads") 
          case _ => {}
        }
      }
    }
} 
