package dfp

import common.AkkaAgent
import common.dfp.GuAdvertiser
import tools.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class AdvertiserAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = AkkaAgent(Seq.empty[GuAdvertiser])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuAdvertiser]] = {
    blockingOperations.executeBlocking(dfpApi.getAllAdvertisers).map { freshData =>
      if (freshData.nonEmpty) freshData else cache.get
    }
  }

  def get: Seq[GuAdvertiser] = cache.get()
}
