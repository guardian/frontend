package dfp

import com.google.api.ads.dfp.axis.utils.v201705.StatementBuilder

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

object CustomTargetingKeyService {

  def targetingKey(session: SessionWrapper)(keyId: Long): String = {
    lazy val fallback = {
      val stmtBuilder = new StatementBuilder().where("id = :id").withBindVariableValue("id", keyId)
      session.customTargetingKeys(stmtBuilder).headOption.map(_.getName).getOrElse("unknown")
    }
    CustomTargetingKeyAgent.get.data getOrElse(keyId, fallback)
  }

}
