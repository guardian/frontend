package model.diagnostics 

import common._
import conf._
import model.diagnostics._
import play.api.mvc.{ Content => _, _ }

object Ads extends Logging {

  def safeStringToInt(str: Option[String]): Option[Int] = {
      import scala.util.control.Exception._
          catching(classOf[NumberFormatException]) opt str.getOrElse("0").toInt
  }

  def report(queryString: Map[String, Seq[String]]) {
      
    val params = queryString.map { case (k,v) => k -> v.mkString }
    
    safeStringToInt(params.get("Top")) match {
      case Some(x:Int) =>
        Top.increment(x)
      case _ => {}
    }

    safeStringToInt(params.get("Bottom")) match {
      case Some(x:Int) =>
        Bottom.increment(x)
      case _ => {}
    }

  }
}
