package services

import concurrent.BlockingOperations
import conf.Configuration

import scala.concurrent.Future

class ParameterStoreService(blockingOperations: BlockingOperations) {
  lazy val parameterStore = new ParameterStore(Configuration.aws.region)

  def findParameterBySubstring(substring: String): Future[Map[String, String]] = blockingOperations.executeBlocking {
    parameterStore.getPath("/frontend", isRecursiveSearch = true).filter(_._1.contains(substring))
  }
}
