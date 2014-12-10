package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder
import com.google.api.ads.dfp.axis.v201411.InventoryStatus
import common.{AkkaAgent, Logging}
import conf.Configuration
import org.joda.time.DateTime

object AdUnitAgent extends Logging {

  private val initialCache = AdUnitCache(DateTime.now, Map.empty)
  private lazy val cache = AkkaAgent[AdUnitCache](initialCache)

  def refresh(): Unit = {
    refresh(loadActiveCoreSiteAdUnits())
  }

  private def loadActiveCoreSiteAdUnits(): Map[String, GuAdUnit] = {

    DfpServiceRegistry().fold(Map[String, GuAdUnit]()) { serviceRegistry =>

      val statementBuilder = new StatementBuilder()
        .where("status = :status")
        .withBindVariableValue("status", InventoryStatus._ACTIVE)

      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(serviceRegistry, statementBuilder)

      val rootName = Configuration.commercial.dfpAdUnitRoot
      val rootAndDescendantAdUnits = dfpAdUnits filter { adUnit =>
        Option(adUnit.getParentPath) exists { path =>
          (path.length == 1 && adUnit.getName == rootName) || (path.length > 1 && path(1).getName
            == rootName)
        }
      }

      rootAndDescendantAdUnits.map { adUnit =>
        val path = adUnit.getParentPath.tail.map(_.getName).toSeq :+ adUnit.getName
        (adUnit.getId, GuAdUnit(adUnit.getId, path))
      }.toMap
    }
  }

  private def refresh(freshAdUnits: Map[String, GuAdUnit]): Unit = {
    cache send { oldCache =>
      if (freshAdUnits.nonEmpty) {
        AdUnitCache(DateTime.now, freshAdUnits)
      } else {
        log.warn("Keeping old ad units as there is no fresh data")
        oldCache
      }
    }
  }

  def get: AdUnitCache = cache.get()
}

case class AdUnitCache(timestamp: DateTime, adUnits: Map[String, GuAdUnit])
