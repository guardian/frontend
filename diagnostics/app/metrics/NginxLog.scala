package metrics

import au.com.bytecode.opencsv.CSVParser
import com.gu.management.{ CountMetric, Metric }
import java.io.File
import net.sf.uadetector.UADetectorServiceFactory
import org.apache.commons.io.input.{ TailerListenerAdapter, Tailer }

object NginxLog {

  val csv = new CSVParser()
  val agent = UADetectorServiceFactory.getResourceModuleParser()

  def isHealthCheck(userAgent: String): Boolean = {
    userAgent startsWith "ELB-HealthChecker"
  }

  def isPxGif(path: String): Boolean = {
    path.startsWith("/px.gif")
  }

  // all errors
  object entry {

    val total = CountMetric("diagnostics", "px_gif", "Accesses to px.gif", "")
    val metrics: Seq[Metric] = Seq(total)

    def apply() {
      total.recordCount(1)
    }
  }

  // handle _fonts_ namespaced errors
  object fonts {

    val total = CountMetric("diagnostics", "fonts", "Font render time warnings", "")
    val metrics: Seq[Metric] = Seq(total)

    def apply() {
      total.recordCount(1)
    }
  }

  // handle _js_ namespaced errors
  object js {

    val total = CountMetric("diagnostics", "js", "Total JavaScript errors", "")

    /*  iOS */
    val js_ios_6_mobilesafari = CountMetric("diagnostics", "js_ios_6_safari", "iOS 6 Safari JS errors", "")
    val js_ios_5_mobilesafari = CountMetric("diagnostics", "js_ios_5_safari", "iOS 5 Safari JS errors", "")
    val js_ios_4_and_lower_mobilesafari = CountMetric("diagnostics", "js_ios_4_and_lower_safari", "iOS 4 and lower Safari JS errors", "")
    val js_ios_x_chrome = CountMetric("diagnostics", "js_ios_x_chrome", "iOS Chrome JS errors", "")
    val js_ios_other = CountMetric("diagnostics", "js_ios_other", "iOS 6 other JS errors", "")

    /*  Android */
    val js_android_4_safari = CountMetric("diagnostics", "js_android_4_safari", "Android 4 Safari JS errors", "")
    val js_android_3_and_lower_safari = CountMetric("diagnostics", "js_android_3_and_lower_safari", "Android 3 and lower Safari JS errors", "")
    val js_android_other = CountMetric("diagnostics", "js_android_other", "Android other errors", "")

    /* Windows */
    val js_windows_7_iemobile = CountMetric("diagnostics", "js_windows_7_iemobile", "Windows 7 IE JS errors", "")
    val js_windows_other = CountMetric("diagnostics", "js_windows_other", "Windows other JS errors", "")

    /* OSX */
    val js_osx_safari = CountMetric("diagnostics", "js_osx_safari", "OSX Safari JS errors", "")
    val js_osx_other = CountMetric("diagnostics", "js_osx_other", "OSX other JS errors", "")

    /* RIM, Symbian, Linux, Other */
    val js_rimos = CountMetric("diagnostics", "js_rimos", "RIMOS JS errors", "")
    val js_linux = CountMetric("diagnostics", "js_linux", "Linux JS errors", "")
    val js_symbianos = CountMetric("diagnostics", "js_symbianos", "SymbianOS JS errors", "")
    val js_other = CountMetric("diagnostics", "js_other", "JS errors other agents", "")

    val metrics: Seq[Metric] = Seq(total,
      js_ios_6_mobilesafari, js_ios_5_mobilesafari, js_ios_4_and_lower_mobilesafari, js_ios_x_chrome, js_ios_other,
      js_android_4_safari, js_android_3_and_lower_safari, js_android_other,
      js_windows_7_iemobile, js_windows_other,
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

      //System.out.println(key)
      //System.out.println(userAgent)

      osFamily.toLowerCase match {

        case "ios" => key match {
          case "ios_6_mobilesafari" => js_ios_6_mobilesafari.recordCount(1)
          case "ios_5_mobilesafari" => js_ios_5_mobilesafari.recordCount(1)
          case "ios_4_mobilesafari" | "js_ios_3_mobilesafari" => js_ios_4_and_lower_mobilesafari.recordCount(1)
          case "ios_5_chromemobile" | "js_ios_6_chromemobile" => js_ios_x_chrome.recordCount(1)
          case _ => js_ios_other.recordCount(1)
        }

        case "android" => key match {
          case "android_4_safari" | "android_4_androidwebkit" => js_android_4_safari.recordCount(1)
          case "android_3_safari" | "js_android_2_safari" | "js_android_2_androidwebkit" => js_android_3_and_lower_safari.recordCount(1)
          case _ => js_android_other.recordCount(1)
        }

        case "windows" => key match {
          case "windows_7_iemobile" => js_windows_7_iemobile.recordCount(1)
          case _ => js_windows_other.recordCount(1)
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

  Tailer.create(new File(conf.Configuration.nginx.log), new TailerListenerAdapter() {
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

      path filter { path => isPxGif(path) && (!isHealthCheck(userAgent)) } foreach { _ =>

        val namespace = path.getOrElse("").split("[?\\/]").toList.drop(2).headOption

        entry()

        namespace.getOrElse("unknown") match {
          case "fonts" => fonts()
          case "js" => js(userAgent)
          case _ => null
        }

      }
    }
  })

}
