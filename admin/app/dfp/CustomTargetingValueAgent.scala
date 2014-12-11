package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder

object CustomTargetingValueAgent extends DataAgent[Long, String] {

  override def loadFreshData() = {
    DfpServiceRegistry().fold(Map[Long, String]()) { serviceRegistry =>
      val values = DfpApiWrapper.fetchCustomTargetingValues(serviceRegistry, new StatementBuilder())
      values.map { v => v.getId.longValue() -> v.getName}.toMap
    }
  }

}
