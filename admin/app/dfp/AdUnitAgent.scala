package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508.InventoryStatus
import common.dfp.GuAdUnit
import conf.Configuration

import scala.util.Try

object AdUnitAgent extends DataAgent[String, GuAdUnit] {

  override def loadFreshData() = Try {
    DfpServiceRegistry().fold(Map[String, GuAdUnit]()) { serviceRegistry =>

      val statementBuilder = new StatementBuilder()
        .where("status = :status")
        .withBindVariableValue("status", InventoryStatus._ACTIVE)

      val dfpAdUnits = DfpApiWrapper.fetchAdUnits(serviceRegistry, statementBuilder)

      val rootName = Configuration.commercial.dfpAdUnitRoot
      val rootAndDescendantAdUnits = dfpAdUnits filter { adUnit =>
        Option(adUnit.getParentPath) exists { path =>
          val isRoot = path.length == 1 && adUnit.getName == rootName
          val isDescendantOfRoot = path.length > 1 && path(1).getName == rootName
          isRoot || isDescendantOfRoot
        }
      }

      rootAndDescendantAdUnits.map { adUnit =>
        val id = adUnit.getId
        val path = adUnit.getParentPath.tail.map(_.getName).toSeq :+ adUnit.getName
        id -> GuAdUnit(id, path)
      }.toMap
    }
  }

}
