package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object CustomTargetingKeyAgent extends DataAgent[Long, String] {

  override def loadFreshData() = Try {
    DfpServiceRegistry().fold(Map[Long, String]()) { serviceRegistry =>
      val keys = DfpApiWrapper.fetchCustomTargetingKeys(serviceRegistry, new StatementBuilder())
      keys.map { k => k.getId.longValue() -> k.getName}.toMap
    }
  }

}
