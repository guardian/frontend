package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import play.api.Logger

object LoggingUtils {

  def getAndLog[A](item: Content, a: => Option[A], failureMsg: String)(implicit log: Logger): Option[A] = {
    val condition = a
    if (condition.isEmpty) log.error(s"Failed to build ${item.id} because $failureMsg")
    condition
  }
}
