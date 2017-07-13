package dfp

import com.google.api.ads.dfp.axis.utils.v201608.StatementBuilder
import common.dfp.GuAdUnit
import conf.Configuration
import ApiHelper.toSeq

import scala.util.Try

object AdUnitAgent extends DataAgent[String, GuAdUnit] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {

      val statementBuilder = new StatementBuilder()

      val dfpAdUnits = session.adUnits(statementBuilder)

      val networkRootId = session.getRootAdUnitId
      lazy val guardianRootName = Configuration.commercial.dfpAdUnitGuRoot

      val runOfNetwork = dfpAdUnits.find(_.getId == networkRootId).map( networkAdUnit => {
        val id = networkAdUnit.getId
        id -> GuAdUnit(
          id = id,
          path = Nil,
          status = networkAdUnit.getStatus.getValue)
      }).toSeq

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
