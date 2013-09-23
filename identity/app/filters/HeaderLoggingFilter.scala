package filters

import play.api.mvc._
import utils.SafeLogging
import common.ExecutionContexts


object HeaderLoggingFilter extends Filter with SafeLogging with ExecutionContexts {
  def apply(next: (RequestHeader) => Result)(rh: RequestHeader) = {
    def logHeaders(result: PlainResult): Result = {
      if(logger.isDebugEnabled) {
        val headerStr = rh.headers.keys
          .filterNot(name => "Cookie" == name || "User-Agent" == name || "Authorization" == name)
          .flatMap(headerKey => {
            rh.headers.getAll(headerKey).map(value => s"$headerKey=$value")
          })
          .mkString("&")
        logger.debug(s"Request headers: $headerStr")
      }
      result
    }

    next(rh) match {
      case plain: PlainResult => logHeaders(plain)
      case async: AsyncResult => async.transform(logHeaders)
    }
  }
}
