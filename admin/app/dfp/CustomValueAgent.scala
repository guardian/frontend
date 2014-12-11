package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder

object CustomValueAgent extends DataAgent[Long, String] {

   override def loadFreshData() = {
     DfpServiceRegistry().fold(Map[Long, String]()) { serviceRegistry =>
       val keys = DfpApiWrapper.fetchCustomTargetingKeys(serviceRegistry, new StatementBuilder())
       keys.map { k => k.getId.longValue() -> k.getName}.toMap
     }
   }
 }
