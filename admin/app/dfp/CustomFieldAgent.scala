package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder
import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime

import scala.concurrent.Future

object CustomFieldAgent extends ExecutionContexts with Logging {

  private val initialCache = CustomFieldCache(DateTime.now, Map.empty)
  private lazy val cache = AkkaAgent(initialCache)

  def refresh(): Future[CustomFieldCache] = {
    log.info("Loading custom fields")
    val freshData = loadCustomFields()
    cache alterOff { oldCache =>
      if (freshData.nonEmpty) {
        log.info("Custom fields loaded")
        CustomFieldCache(DateTime.now, freshData)
      } else {
        log.error("No custom fields loaded so keeping old data")
        oldCache
      }
    }
  }

  private def loadCustomFields(): Map[String, Long] = {
    DfpServiceRegistry() map { serviceRegistry =>
      val fields = DfpApiWrapper.fetchCustomFields(serviceRegistry, new StatementBuilder())
      fields.map(f => f.getName -> f.getId.toLong).toMap
    } getOrElse Map.empty
  }

  def get: CustomFieldCache = cache.get()
}

case class CustomFieldCache(timestamp: DateTime, customFields: Map[String, Long])
