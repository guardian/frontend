package dfp

import common.AkkaAgent
import common.dfp.GuCreativeTemplate
import tools.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}

class CreativeTemplateAgent(blockingOperations: BlockingOperations, dfpApi: DfpApi) {

  private lazy val cache = AkkaAgent(Seq.empty[GuCreativeTemplate])

  def refresh()(implicit executionContext: ExecutionContext): Future[Seq[GuCreativeTemplate]] = {
    blockingOperations.executeBlocking(dfpApi.readActiveCreativeTemplates()).map { freshData =>
      if (freshData.nonEmpty) {
        cache.send(freshData)
        freshData
      } else cache.get()
    }
  }

  def get: Seq[GuCreativeTemplate] = cache.get()
}
