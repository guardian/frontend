package idapiclient


import client.connection.dispatch.DispatchAsyncHttpClient
import utils.SafeLogging

import scala.concurrent.ExecutionContext

class IdDispatchAsyncHttpClient(implicit val executionContext: ExecutionContext) extends DispatchAsyncHttpClient with SafeLogging
