package test

import play.api.test.{FakeHeaders, FakeRequest}
import play.api.mvc.{Call, AnyContentAsEmpty}
import play.filters.csrf.CSRFAddToken
import javax.naming.ConfigurationException


object FakeCSRFRequest {
  def apply(csrfAddToken: CSRFAddToken, method: String = "GET", path: String = "/"): FakeRequest[AnyContentAsEmpty.type] = {
    addCsrf(csrfAddToken, FakeRequest(method, path, FakeHeaders(), AnyContentAsEmpty))
  }

  def apply(csrfAddToken: CSRFAddToken, call: Call): FakeRequest[AnyContentAsEmpty.type] = {
    apply(csrfAddToken, call.method, call.url)
  }

  private def addCsrf(csrfAddToken: CSRFAddToken, fakeRequest: FakeRequest[AnyContentAsEmpty.type]): FakeRequest[AnyContentAsEmpty.type] = {
    try {
      val token = csrfAddToken.crypto.generateSignedToken
      fakeRequest
        .withHeaders("Csrf-Token" -> token)
        .withSession("csrfToken" -> token)
    } catch {
      case e: play.api.PlayException => {
        val exception = new ConfigurationException(s"Failed to add CSRF token make sure the call is in a Fake block: ${e.getMessage}")
        exception.setRootCause(e)
        throw exception
      }
    }
  }
}
