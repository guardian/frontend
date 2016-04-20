package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object CustomTargetingKeyAgent extends DataAgent[Long, String] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val keys = session.customTargetingKeys(new StatementBuilder())
      keys.map { k => k.getId.longValue() -> k.getName}.toMap
    }
    maybeData getOrElse Map.empty
  }
}
