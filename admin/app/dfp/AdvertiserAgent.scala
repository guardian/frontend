package dfp

import common.AkkaAgent
import common.dfp.GuAdvertiser

import scala.concurrent.Future

object AdvertiserAgent {

  private lazy val cache = AkkaAgent(Seq.empty[GuAdvertiser])

  def refresh(): Future[Seq[GuAdvertiser]] = {
    cache alterOff { oldData =>
      val freshData = DfpApi.getAllAdvertisers
      if (freshData.nonEmpty) freshData else oldData
    }
  }

  def get: Seq[GuAdvertiser] = cache.get()
}
