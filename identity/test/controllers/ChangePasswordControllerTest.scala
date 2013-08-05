package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import scala.concurrent.ExecutionContext
import client.connection.util.ExecutionContexts
import idapiclient.SynchronousIdApi

class ChangePasswordControllerTest extends path.FreeSpeck with ShouldMatchers with MockitoSugar {

  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext

  val idApi = mock[SynchronousIdApi]

  "the handle password request method" - {

     "given a valid user response from the api" - {

     }
  }

}
