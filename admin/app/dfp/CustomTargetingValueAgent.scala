package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object CustomTargetingValueAgent extends DataAgent[Long, String] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val values = session.customTargetingValues(new StatementBuilder())
      values.map { v => v.getId.longValue() -> v.getName}.toMap
    }
    maybeData getOrElse Map.empty
  }
}

object CustomTargetingValueService {

  def targetingValue(session: SessionWrapper)(valueId: Long): String = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", valueId)
      session.customTargetingValues(stmtBuilder).head.getName
    }
    CustomTargetingValueAgent.get.data getOrElse(valueId, fallback)
  }

}
