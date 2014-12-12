package dfp

import com.google.api.ads.dfp.axis.utils.v201411.StatementBuilder

object PlacementAgent extends DataAgent[Long, Seq[String]] {

  override def loadFreshData(): Map[Long, Seq[String]] = {
    DfpServiceRegistry().fold(Map[Long, Seq[String]]()) { serviceRegistry =>
      val placements = DfpApiWrapper.fetchPlacements(serviceRegistry, new StatementBuilder())
      placements.map { placement =>
        placement.getId.toLong -> placement.getTargetedAdUnitIds.toSeq
      }.toMap
    }
  }

}
