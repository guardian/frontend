package metrics

import au.com.bytecode.opencsv.CSVParser
import com.gu.management.{ CountMetric, Metric }
import java.io.File
import net.sf.uadetector.UADetectorServiceFactory
import org.apache.commons.io.input.{ TailerListenerAdapter, Tailer }

object NginxLog {
  val csv = new CSVParser()
  val agent = UADetectorServiceFactory.getResourceModuleParser()

  object pxgif {
    val total = CountMetric("diagnostics", "px_gif", "px.gif accesses", "Accesses to /px.gif")

    val mobileSafari = CountMetric("diagnostics", "mobile_safari", "Mobile Safari", "Accesses to /px.gif from Mobile Safari agents")
    val safari = CountMetric("diagnostics", "safari", "Safari", "Accesses to /px.gif from Safari agents")
    val mobileFirefox = CountMetric("diagnostics", "mobile_firefox", "Mobile Firefox", "Accesses to /px.gif from Mobile Firefox agents")
    val firefox = CountMetric("diagnostics", "firefox", "Firefox", "Accesses to /px.gif from Firefox agents")
    val operaMobile = CountMetric("diagnostics", "opera_mobile", "Opera Mobile", "Accesses to /px.gif from Opera Mobile agents")
    val opera = CountMetric("diagnostics", "opera", "Opera", "Accesses to /px.gif from Opera agents")
    val chromeMobile = CountMetric("diagnostics", "chrome_mobile", "Chrome Mobile", "Accesses to /px.gif from Chrome Mobile agents")
    val chrome = CountMetric("diagnostics", "chrome", "Chrome", "Accesses to /px.gif from Chrome agents")
    val ieMobile = CountMetric("diagnostics", "ie_mobile", "IE Mobile", "Accesses to /px.gif from IE Mobile agents")
    val ie = CountMetric("diagnostics", "ie", "IE", "Accesses to /px.gif from IE agents")
    val androidWebkit = CountMetric("diagnostics", "android_webkit", "Android Webkit", "Accesses to /px.gif from Android Webkit agents")
    val nokia = CountMetric("diagnostics", "nokia", "Nokia Web Browser", "Accesses to /px.gif from Nokia Web Browser agents")
    val other = CountMetric("diagnostics", "other", "Other", "Accesses to /px.gif from other agents")

    val metrics: Seq[Metric] = Seq(total,
      mobileSafari, safari,
      mobileFirefox, firefox,
      operaMobile, opera,
      chromeMobile, chrome,
      ieMobile, ie,
      androidWebkit,
      nokia,
      other)

    def apply(userAgent: String) {
      total.recordCount(1)

      agent.parse(userAgent).getFamily match {
        case "Mobile Safari" => mobileSafari.recordCount(1)
        case "Safari" => safari.recordCount(1)
        case "Mobile Firefox" => mobileFirefox.recordCount(1)
        case "Firefox" => firefox.recordCount(1)
        case "Opera Mobile" => operaMobile.recordCount(1)
        case "Opera" => opera.recordCount(1)
        case "Chrome Mobile" => chromeMobile.recordCount(1)
        case "Chrome" => chrome.recordCount(1)
        case "IE Mobile" => ieMobile.recordCount(1)
        case "IE" => ie.recordCount(1)
        case "Android Webkit" => androidWebkit.recordCount(1)
        case "Nokia Web Browser" => nokia.recordCount(1)
        case _ => other.recordCount(1)
      }
    }
  }

  val metrics: Seq[Metric] = pxgif.metrics

  Tailer.create(new File(conf.Configuration.nginx.log), new TailerListenerAdapter() {
    override def handle(line: String) {
      val fields = csv.parseLine(line)

      val path = fields(2).trim.split(" ").toList.drop(1).headOption
      val userAgent = fields(6)

      // px.gif metrics
      path filter { _ startsWith "/px.gif" } foreach { _ =>
        pxgif(userAgent)
      }
    }
  })

}