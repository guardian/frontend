package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder

object CustomFieldAgent extends DataAgent[String, Long] {

  override def loadFreshData() = {
    DfpServiceRegistry() map { serviceRegistry =>
      val fields = DfpApiWrapper.fetchCustomFields(serviceRegistry, new StatementBuilder())
      fields.map(f => f.getName -> f.getId.toLong).toMap
    } getOrElse Map.empty
  }
}
