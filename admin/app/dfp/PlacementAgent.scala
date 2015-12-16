package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder

import scala.util.Try

object PlacementAgent extends DataAgent[Long, Seq[String]] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val placements = session.placements(new StatementBuilder())
      placements.map { placement =>
        placement.getId.toLong -> placement.getTargetedAdUnitIds.toSeq
      }.toMap
    }
    maybeData getOrElse Map.empty
  }
}
