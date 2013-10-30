package metrics

import java.io.File
import au.com.bytecode.opencsv.CSVParser
import com.gu.management.{ CountMetric, Metric }
import net.sf.uadetector.service.UADetectorServiceFactory
import org.apache.commons.io.input.{ TailerListenerAdapter, Tailer }
import model.diagnostics._
import play.api.libs.concurrent.Execution.Implicits._
import java.net._

object NginxLog {

  val csv = new CSVParser()
  val agent = UADetectorServiceFactory.getResourceModuleParser()

  def isHealthCheck(userAgent: String): Boolean = {
    userAgent startsWith "ELB-HealthChecker"
  }

  def isMetric(path: String): Boolean = {
    path startsWith "/px.gif"
  }

  // all errors
  object entry {

    val total = new CountMetric("diagnostics", "px_gif", "Accesses to px.gif", "")
    val metrics: Seq[Metric] = Seq(total)

    def apply() {
      total.recordCount(1)
    }
  }

  // handle feature healthchecks
  object canary {
    
    val navigation = new CountMetric("diagnostics", "canary_navigation", "Interactions with navigation bar", "")
    val other = new CountMetric("diagnostics", "canary_other", "Uncaught interactions", "")
    
    val metrics: Seq[Metric] = Seq(navigation)

    def apply(path: Option[String]) {
      
      val measure = path.getOrElse("").split("[?\\/]").toList.drop(3).headOption
      
      measure.getOrElse("unknown") match {
        case "navigation" => navigation.recordCount(1)  
        case _ => other.recordCount(1) 
      }
    }
  }

  // handle _ads_ namespaced errors
  object ads {

    val total = new CountMetric("diagnostics", "ads", "Total Javascript advert errors", "")
    val metrics: Seq[Metric] = Seq(total)

    def apply() {
      total.recordCount(1)
    }
  }

  // handle _js_ namespaced errors
  object js {

    val total = new CountMetric("diagnostics", "js", "Total JavaScript non-advert errors", "", None)
    val js_ios = new CountMetric("diagnostics", "js_ios", "iOS JS errors", "")
    val js_android = new CountMetric("diagnostics", "js_android", "Android JS errors", "")
    val js_windows = new CountMetric("diagnostics", "js_windows", "Windows JS errors", "")
    val js_osx = new CountMetric("diagnostics", "js_osx", "OSX JS errors", "")
    val js_rimos = new CountMetric("diagnostics", "js_rimos", "RIMOS JS errors", "")
    val js_linux = new CountMetric("diagnostics", "js_linux", "Linux JS errors", "")
    val js_symbianos = new CountMetric("diagnostics", "js_symbianos", "SymbianOS JS errors", "")
    val js_other = new CountMetric("diagnostics", "js_other", "JS errors other agents", "")

    val metrics: Seq[Metric] = Seq(total, js_ios, js_android, js_windows, js_osx, js_rimos, js_linux, js_symbianos, js_other)

    def apply(userAgent: String) {

      total.recordCount(1)

      val ua = agent.parse(userAgent)
      val os = ua.getOperatingSystem
      val osFamily = os.getFamilyName.replaceAll(" ", "")

      osFamily.toLowerCase match {

        case "ios" => js_ios.recordCount(1)
        case "android" => js_android.recordCount(1)
        case "windows" => js_windows.recordCount(1)
        case "rimos" => js_rimos.recordCount(1)
        case "osx" => js_osx.recordCount(1)
        case "symbianos" => js_symbianos.recordCount(1)
        case "linux" => js_linux.recordCount(1)
        case _ => js_other.recordCount(1)
      }
    }
  }

  // combine all the metrics
  val metrics: Seq[Metric] = entry.metrics ++ js.metrics ++ ads.metrics ++ canary.metrics

  Tailer.create(new File("/var/log/nginx/access.log"), new TailerListenerAdapter() {

    override def handle(line: String) {
      var fields = Array("")
      var path = Option("")
      var userAgent = ""
      var queryString: Map[String, String] = Map()

      try {
        fields = csv.parseLine(line)
        path = fields(2).trim.split(" ").toList.drop(1).headOption
        userAgent = fields(6)
        queryString = fields(2).trim.split(" ").toList(1).split("\\?").toList.last.split("&").map { str => 
            val pair = str.split('=')
            (pair(0) -> URLDecoder.decode(pair(1), "UTF-8"))
          }.toMap
      } catch {
        case _: Throwable => return
      }
      
      path filter { path => isMetric(path) && (!isHealthCheck(userAgent)) } foreach { _ =>

        val namespace = path.getOrElse("").split("[?\\/]").toList.drop(2).headOption

        // log all errors
        entry()
        
        // handle individual errors
        namespace.getOrElse("unknown") match {
          case "js" => {
            js(userAgent)
            val lineno = if (queryString("lineno") matches """\d+""") queryString("lineno").toInt else 0
            AirBrake.send(namespace.getOrElse("unknown"), queryString("js/message"), queryString("filename"), lineno).map {
              response => println("ok!")
              }
          }
          case "ads" => ads()
          case "canary" => canary(path)
          case _ => null
        }

      }
    }
  })

}
