package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import common.dfp.GuAdUnit
import conf.Configuration

import scala.util.Try

object AdUnitAgent extends DataAgent[String, GuAdUnit] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {

      val statementBuilder = new StatementBuilder()

      val dfpAdUnits = session.adUnits(statementBuilder)

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
        id -> GuAdUnit(id, path, adUnit.getStatus.getValue)
      }.toMap
    }

    maybeData getOrElse Map.empty
  }

}

object AdUnitService {

  // Retrieves the ad unit object if the id matches and the ad unit is active.
  def activeAdUnit(adUnitId: String): Option[GuAdUnit] = {
    AdUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isActive => adUnit
    }
  }

  def archivedAdUnit(adUnitId: String): Option[GuAdUnit] = {
    AdUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isArchived => adUnit
    }
  }

  def isArchivedAdUnit(adUnitId: String) = archivedAdUnit(adUnitId).isDefined

  def inactiveAdUnit(adUnitId: String): Option[GuAdUnit] = {
    AdUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isInactive => adUnit
    }
  }

  def isInactiveAdUnit(adUnitId: String) = inactiveAdUnit(adUnitId).isDefined

}
