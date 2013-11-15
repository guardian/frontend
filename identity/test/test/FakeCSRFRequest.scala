package test

import play.api.test.{FakeHeaders, FakeRequest}
import play.api.mvc.{Call, AnyContentAsEmpty}
import play.filters.csrf.CSRF
import javax.naming.ConfigurationException


object FakeCSRFRequest {
  def apply(): FakeRequest[AnyContentAsEmpty.type] = {
    addCsrf(FakeRequest("GET", "/", FakeHeaders(), AnyContentAsEmpty))
  }

  def apply(method: String, path: String): FakeRequest[AnyContentAsEmpty.type] = {
    addCsrf(FakeRequest(method, path, FakeHeaders(), AnyContentAsEmpty))
  }

  def apply(call: Call): FakeRequest[AnyContentAsEmpty.type] = {
    addCsrf(apply(call.method, call.url))
  }

  private def addCsrf(fakeRequest: FakeRequest[AnyContentAsEmpty.type]): FakeRequest[AnyContentAsEmpty.type] = {
    try {
      fakeRequest
        .withHeaders("Csrf-Token" -> "nocheck")
        .withSession("csrfToken" -> CSRF.SignedTokenProvider.generateToken)
    } catch {
      case e: play.api.PlayException => {
        val exception = new ConfigurationException(s"Failed to add CSRF token make sure the call is in a Fake block: ${e.getMessage}")
        exception.setRootCause(e)
        throw exception
      }
    }
  }
}
