package model.diagnostics 

import common._
import conf._
import model.diagnostics._
import play.api.mvc.{ Content => _, _ }

object Ads extends Logging {
  
  //  ads.gif?slot=seconds-in-view - Eg. sticky=23&top=12

  def report(queryString: Map[String, Seq[String]]) {
      
    val params = queryString.map { case (k,v) => k -> v.mkString }
    
    params.get("top").getOrElse(0) match {
      case Some(x:Int) =>
        Top.increment(x)
      case _ => {}
    }
  }
}
