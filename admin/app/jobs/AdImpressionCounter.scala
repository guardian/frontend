package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.environment
import conf.Switches.MetricsSwitch
import model.commercial.{AdSlot, inline2}
import model.diagnostics.CloudWatch
import model.{ContentType, articleType}
import services.{BrowserFamily, OphanApi, mobileSafari}

import scala.util.control.NonFatal

object AdImpressionCounter extends ExecutionContexts with Logging {

  def count(): Unit = {

    def count(contentType: ContentType, adSlot: AdSlot, browserFamily: BrowserFamily): Unit = {
      val eventualCount = OphanApi.getAdImpressionCount(contentType, adSlot, browserFamily)
      eventualCount onFailure {
        case NonFatal(e) => log.error(
          s"Ad impression count of $contentType, $adSlot, $browserFamily failed: ${e.getMessage}"
        )
      }
      eventualCount map { count =>
        def normalize(s: String): String = s.replaceAll("\\s+", "")
        val cType = normalize(contentType.name)
        val slot = normalize(adSlot.name)
        val browser = normalize(browserFamily.name)
        val key = s"ad-slot-$cType-$slot-$browser-impressions"
        CloudWatch.put("Commercial", Map(s"$key" -> count.toDouble))
      }
    }

    if (environment.isProd || MetricsSwitch.isSwitchedOn) {
      count(articleType, inline2, mobileSafari)
    }
  }
}
