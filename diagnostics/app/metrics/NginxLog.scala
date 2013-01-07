package metrics

import java.io.File
import au.com.bytecode.opencsv.CSVParser
import com.gu.management.{ CountMetric, Metric }
import net.sf.uadetector.UADetectorServiceFactory
import org.apache.commons.io.input.{ TailerListenerAdapter, Tailer }
import conf.Configuration

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

  // handle _fonts_ namespaced errors
  object fonts {

    val total = new CountMetric("diagnostics", "fonts", "Font render time warnings", "")
    val metrics: Seq[Metric] = Seq(total)

    def apply() {
      total.recordCount(1)
    }
  }

  // handle _js_ namespaced errors
  object js {

    val total = new CountMetric("diagnostics", "js", "Total JavaScript errors", "", None)

    /*  iOS */
    val js_ios_6_mobilesafari = new CountMetric("diagnostics", "js_ios_6_safari", "iOS 6 Safari JS errors", "")
    val js_ios_5_mobilesafari = new CountMetric("diagnostics", "js_ios_5_safari", "iOS 5 Safari JS errors", "")
    val js_ios_4_and_lower_mobilesafari = new CountMetric("diagnostics", "js_ios_4_and_lower_safari", "iOS 4 and lower Safari JS errors", "")
    val js_ios_x_chrome = new CountMetric("diagnostics", "js_ios_x_chrome", "iOS Chrome JS errors", "")
    val js_ios_other = new CountMetric("diagnostics", "js_ios_other", "iOS other JS errors", "")

    /*  Android */
    val js_android_4_safari = new CountMetric("diagnostics", "js_android_4_safari", "Android 4 Safari JS errors", "")
    val js_android_3_and_lower_safari = new CountMetric("diagnostics", "js_android_3_and_lower_safari", "Android 3 and lower Safari JS errors", "")
    val js_android_other = new CountMetric("diagnostics", "js_android_other", "Android other errors", "")

    /* Windows */
    val js_windows_8_ie10 = new CountMetric("diagnostics", "js_windows_8_ie10", "Windows 8 IE 10 JS errors", "")
    val js_windows_7_iemobile = new CountMetric("diagnostics", "js_windows_7_iemobile", "Windows 7 IE JS errors", "")
    val js_windows_other = new CountMetric("diagnostics", "js_windows_other", "Windows other JS errors", "")

    /* OSX */
    val js_osx_safari = new CountMetric("diagnostics", "js_osx_safari", "OSX Safari JS errors", "")
    val js_osx_other = new CountMetric("diagnostics", "js_osx_other", "OSX other JS errors", "")

    /* RIM, Symbian, Linux, Other */
    val js_rimos = new CountMetric("diagnostics", "js_rimos", "RIMOS JS errors", "")
    val js_linux = new CountMetric("diagnostics", "js_linux", "Linux JS errors", "")
    val js_symbianos = new CountMetric("diagnostics", "js_symbianos", "SymbianOS JS errors", "")
    val js_other = new CountMetric("diagnostics", "js_other", "JS errors other agents", "")

    val metrics: Seq[Metric] = Seq(total,
      js_ios_6_mobilesafari, js_ios_5_mobilesafari, js_ios_4_and_lower_mobilesafari, js_ios_x_chrome, js_ios_other,
      js_android_4_safari, js_android_3_and_lower_safari, js_android_other,
      js_windows_7_iemobile, js_windows_other, js_windows_8_ie10,
      js_osx_safari, js_osx_other,
      js_rimos, js_linux, js_symbianos, js_other
    )

    def apply(userAgent: String) {

      total.recordCount(1)

      val ua = agent.parse(userAgent)
      val os = ua.getOperatingSystem

      val uaFamily = ua.getFamily.replaceAll(" ", "")
      val osFamily = os.getFamilyName.replaceAll(" ", "")
      val osVersion = os.getVersionNumber.getMajor

      val key = Array(osFamily.toLowerCase, osVersion, uaFamily.toLowerCase).mkString("_")

      osFamily.toLowerCase match {

        case "ios" => key match {
          case "ios_6_mobilesafari" => js_ios_6_mobilesafari.recordCount(1)
          case "ios_5_mobilesafari" => js_ios_5_mobilesafari.recordCount(1)
          case "ios_4_mobilesafari" | "ios_3_mobilesafari" => js_ios_4_and_lower_mobilesafari.recordCount(1)
          case "ios_5_chromemobile" | "ios_6_chromemobile" => js_ios_x_chrome.recordCount(1)
          case _ => js_ios_other.recordCount(1)

        }

        case "android" => key match {
          case "android_4_safari" | "android_4_androidwebkit" => js_android_4_safari.recordCount(1)
          case "android_3_safari" | "android_2_safari" | "android_2_androidwebkit" => js_android_3_and_lower_safari.recordCount(1)
          case _ => js_android_other.recordCount(1)
        }

        case "windows" => key match {
          case "windows_7_iemobile" => js_windows_7_iemobile.recordCount(1)
          case _ => {
            if (userAgent contains "MSIE 10.0; Windows Phone 8.0") {
              js_windows_8_ie10.recordCount(1)
            } else {
              js_windows_other.recordCount(1)
            }
          }
        }

        case "osx" => key match {
          case "osx_10_safari" => js_osx_safari.recordCount(1)
          case _ => js_osx_other.recordCount(1)
        }

        case "rimos" => js_rimos.recordCount(1)
        case "symbianos" => js_symbianos.recordCount(1)
        case "linux" => js_linux.recordCount(1)
        case _ => js_other.recordCount(1)

      }
    }
  }

  // combine all the metrics
  val metrics: Seq[Metric] = entry.metrics ++ js.metrics ++ fonts.metrics

  Tailer.create(new File(Configuration.nginx.log), new TailerListenerAdapter() {
    override def handle(line: String) {
      var fields = Array("")
      var path = Option("")
      var userAgent = ""

      try {
        fields = csv.parseLine(line)
        path = fields(2).trim.split(" ").toList.drop(1).headOption
        userAgent = fields(6)
      } catch {
        case _ => return
      }

      path filter { path => isMetric(path) && (!isHealthCheck(userAgent)) } foreach { _ =>

        val namespace = path.getOrElse("").split("[?\\/]").toList.drop(2).headOption

        // log all errors
        entry()

        // handle individual errors
        namespace.getOrElse("unknown") match {
          case "fonts" => fonts()
          case "js" => js(userAgent)
          case _ => null
        }

      }
    }
  })

}
