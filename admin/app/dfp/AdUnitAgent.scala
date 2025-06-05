package dfp

import com.google.api.ads.admanager.axis.utils.v202505.StatementBuilder
import common.dfp.GuAdUnit
import conf.Configuration
import ApiHelper.toSeq
import concurrent.BlockingOperations

import scala.util.Try

class AdUnitAgent(val blockingOperations: BlockingOperations) extends DataAgent[String, GuAdUnit] {

  override def loadFreshData(): Try[Map[String, GuAdUnit]] =
    Try {
      val maybeData = for (session <- SessionWrapper()) yield {

        val statementBuilder = new StatementBuilder()

        val dfpAdUnits = session.adUnits(statementBuilder)

        val networkRootId = session.getRootAdUnitId
        lazy val guardianRootName = Configuration.commercial.dfpAdUnitGuRoot

        val runOfNetwork = dfpAdUnits
          .find(_.getId == networkRootId)
          .map(networkAdUnit => {
            val id = networkAdUnit.getId
            id -> GuAdUnit(id = id, path = Nil, status = networkAdUnit.getStatus.getValue)
          })
          .toSeq

        val rootAndDescendantAdUnits = dfpAdUnits filter { adUnit =>
          Option(adUnit.getParentPath) exists { path =>
            val isGuRoot = path.length == 1 && adUnit.getName == guardianRootName
            val isDescendantOfRoot = path.length > 1 && path(1).getName == guardianRootName
            isGuRoot || isDescendantOfRoot
          }
        }

        val adUnits = rootAndDescendantAdUnits.map { adUnit =>
          val id = adUnit.getId
          val path = toSeq(adUnit.getParentPath).tail.map(_.getName) :+ adUnit.getName
          id -> GuAdUnit(id, path, adUnit.getStatus.getValue)
        }

        (adUnits ++ runOfNetwork).toMap
      }

      maybeData getOrElse Map.empty
    }

}

class AdUnitService(adUnitAgent: AdUnitAgent) {

  // Retrieves the ad unit object if the id matches and the ad unit is active.
  def activeAdUnit(adUnitId: String): Option[GuAdUnit] = {
    adUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isActive => adUnit
    }
  }

  def archivedAdUnit(adUnitId: String): Option[GuAdUnit] = {
    adUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isArchived => adUnit
    }
  }

  def isArchivedAdUnit(adUnitId: String): Boolean = archivedAdUnit(adUnitId).isDefined

  def inactiveAdUnit(adUnitId: String): Option[GuAdUnit] = {
    adUnitAgent.get.data.get(adUnitId).collect {
      case adUnit if adUnit.isInactive => adUnit
    }
  }

  def isInactiveAdUnit(adUnitId: String): Boolean = inactiveAdUnit(adUnitId).isDefined

}
