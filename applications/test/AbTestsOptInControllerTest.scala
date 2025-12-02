package test

import controllers.AbTestsOptInController
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test.Helpers._
import play.api.test.{FakeRequest, Helpers}
import play.api.mvc.Cookie

@DoNotDiscover class AbTestsOptInControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestApplicationContext {

  lazy val abTestsOptInController =
    new AbTestsOptInController(Helpers.stubControllerComponents())

  "AbTestsOptInController" should "opt in to a server test group with empty cookie" in {
    val request = FakeRequest("GET", "/ab-tests/server/opt-in/test-group:variant")
    val result = abTestsOptInController.handle("in", "server", "test-group:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    cookies.get("gu_force_server_test_groups") should not be None
    cookies.get("gu_force_server_test_groups").get.value should be("test-group:variant")
  }

  it should "opt in to a client test group with empty cookie" in {
    val request = FakeRequest("GET", "/ab-tests/client/opt-in/test-group:control")
    val result = abTestsOptInController.handle("in", "client", "test-group:control")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    cookies.get("gu_force_client_test_groups") should not be None
    cookies.get("gu_force_client_test_groups").get.value should be("test-group:control")
  }

  it should "opt in to a server test group with existing cookie" in {
    val request = FakeRequest("GET", "/ab-tests/server/opt-in/test-group-2:variant")
      .withCookies(Cookie("gu_force_server_test_groups", "test-group-1:control"))
    val result = abTestsOptInController.handle("in", "server", "test-group-2:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_server_test_groups").get.value

    // Cookie should contain both test groups
    cookieValue should include("test-group-1:control")
    cookieValue should include("test-group-2:variant")
  }

  it should "opt in to a client test group with existing cookie" in {
    val request = FakeRequest("GET", "/ab-tests/client/opt-in/test-group-2:variant")
      .withCookies(Cookie("gu_force_client_test_groups", "test-group-1:control"))
    val result = abTestsOptInController.handle("in", "client", "test-group-2:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_client_test_groups").get.value

    // Cookie should contain both test groups
    cookieValue should include("test-group-1:control")
    cookieValue should include("test-group-2:variant")
  }

  it should "update existing test group when opting in again" in {
    val request = FakeRequest("GET", "/ab-tests/server/opt-in/test-group:variant")
      .withCookies(Cookie("gu_force_server_test_groups", "test-group:control,other-group:variant"))
    val result = abTestsOptInController.handle("in", "server", "test-group:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_server_test_groups").get.value

    // test-group should be updated to variant
    cookieValue should include("test-group:variant")
    cookieValue should include("other-group:variant")
  }

  it should "opt out of a server test group when it's the only one" in {
    val request = FakeRequest("GET", "/ab-tests/oserver/pt-out/test-group:variant")
      .withCookies(Cookie("gu_force_server_test_groups", "test-group:variant"))
    val result = abTestsOptInController.handle("out", "server", "test-group:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    // Cookie should be discarded when no test groups remain
    cookies.get("gu_force_server_test_groups").map(_.maxAge) should be(Some(Some(-86400)))
  }

  it should "opt out of a client test group when it's the only one" in {
    val request = FakeRequest("GET", "/ab-tests/oclient/pt-out/test-group:control")
      .withCookies(Cookie("gu_force_client_test_groups", "test-group:control"))
    val result = abTestsOptInController.handle("out", "client", "test-group:control")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    // Cookie should be discarded when no test groups remain
    cookies.get("gu_force_client_test_groups").map(_.maxAge) should be(Some(Some(-86400)))
  }

  it should "opt out of a server test group and keep other groups" in {
    val request = FakeRequest("GET", "/ab-tests/oserver/pt-out/test-group-2:variant")
      .withCookies(
        Cookie("gu_force_server_test_groups", "test-group-1:control,test-group-2:variant,test-group-3:control"),
      )
    val result = abTestsOptInController.handle("out", "server", "test-group-2:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_server_test_groups").get.value

    // test-group-2 should be removed but others should remain
    cookieValue should include("test-group-1:control")
    cookieValue should not include "test-group-2"
    cookieValue should include("test-group-3:control")
  }

  it should "opt out of a client test group and keep other groups" in {
    val request = FakeRequest("GET", "/ab-tests/oclient/pt-out/test-group-2:variant")
      .withCookies(
        Cookie("gu_force_client_test_groups", "test-group-1:control,test-group-2:variant,test-group-3:control"),
      )
    val result = abTestsOptInController.handle("out", "client", "test-group-2:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_client_test_groups").get.value

    // test-group-2 should be removed but others should remain
    cookieValue should include("test-group-1:control")
    cookieValue should not include "test-group-2"
    cookieValue should include("test-group-3:control")
  }

  it should "handle opting out when the group is not in the cookie" in {
    val request = FakeRequest("GET", "/ab-tests/oserver/pt-out/non-existent-group:variant")
      .withCookies(Cookie("gu_force_server_test_groups", "test-group:control"))
    val result = abTestsOptInController.handle("out", "server", "non-existent-group:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    val cookieValue = cookies.get("gu_force_server_test_groups").get.value

    // Original cookie should remain unchanged
    cookieValue should be("test-group:control")
  }

  it should "handle opting out when there is no cookie" in {
    val request = FakeRequest("GET", "/ab-tests/oserver/pt-out/test-group:variant")
    val result = abTestsOptInController.handle("out", "server", "test-group:variant")(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    // Cookie should be discarded (even though it didn't exist)
    cookies.get("gu_force_server_test_groups").map(_.maxAge) should be(Some(Some(-86400)))
  }

  it should "reset all AB test cookies" in {
    val request = FakeRequest("GET", "/ab-tests/opt/reset")
      .withCookies(
        Cookie("gu_force_server_test_groups", "test-group-1:control"),
        Cookie("gu_force_client_test_groups", "test-group-2:variant"),
      )
    val result = abTestsOptInController.reset()(request)

    status(result) should be(303)
    redirectLocation(result) should be(Some("/"))

    val cookies = Helpers.cookies(result)
    // Both cookies should be discarded
    cookies.get("gu_force_server_test_groups").map(_.maxAge) should be(Some(Some(-86400)))
    cookies.get("gu_force_client_test_groups").map(_.maxAge) should be(Some(Some(-86400)))
  }

  it should "have correct cookie lifetime for opt in" in {
    val request = FakeRequest("GET", "/ab-tests/server/opt-in/test-group:variant")
    val result = abTestsOptInController.handle("in", "server", "test-group:variant")(request)

    val cookies = Helpers.cookies(result)
    val cookie = cookies.get("gu_force_server_test_groups").get

    // 90 days in seconds
    cookie.maxAge should be(Some(7776000))
  }
}
