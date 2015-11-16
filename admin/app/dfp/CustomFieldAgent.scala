package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object CustomFieldAgent extends DataAgent[String, Long] {

  override def loadFreshData() = Try {
    DfpServiceRegistry() map { serviceRegistry =>
      val session = new SessionWrapper(serviceRegistry.session)
      val fields = session.customFields(new StatementBuilder())
      fields.map(f => f.getName -> f.getId.toLong).toMap
    } getOrElse Map.empty
  }

}
