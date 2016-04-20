package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object CustomFieldAgent extends DataAgent[String, Long] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val fields = session.customFields(new StatementBuilder())
      fields.map(f => f.getName -> f.getId.toLong).toMap
    }
    maybeData getOrElse Map.empty
  }
}
