package controllers

import experiments.ParticipationGroups
import model.Cached
import model.Cached.WithoutRevalidationResult
import play.api.mvc._

import scala.concurrent.duration._
import ab.ABTests

class AbTestsOptInController(val controllerComponents: ControllerComponents) extends BaseController {

  private val lifetime: Int = 90.days.toSeconds.toInt

  private val serverForceTestCookie = "gu_force_server_test_groups"
  private val clientForceTestCookie = "gu_force_client_test_groups"

  private def getTestsFromParam(groups: String): Map[String, String] = groups
    .split(",")
    .collect {
      case test if test.split(":").length == 2 =>
        val parts = test.split(":")
        parts(0).trim -> parts(1).trim
    }
    .toMap

  private def readCookie(implicit request: RequestHeader, typeStr: String): Map[String, String] = {
    val cookieName = typeStr match {
      case "server" => serverForceTestCookie
      case "client" => clientForceTestCookie
    }

    request.cookies.get(cookieName) match {
      case Some(cookie) =>
        cookie.value
          .split(",")
          .collect {
            case test if test.split(":").length == 2 =>
              val parts = test.split(":")
              parts(0).trim -> parts(1).trim
          }
          .toMap
      case None => Map.empty[String, String]
    }
  }
  private def opt(choice: String, testType: String, testName: String, testGroup: String)(implicit
      request: RequestHeader,
  ): Result = {
    val cookieName = testType match {
      case "server" => serverForceTestCookie
      case "client" => clientForceTestCookie
    }

    choice match {
      case "in"  => optIn(testName, testGroup, cookieName)
      case "out" => optOut(testName, testGroup, cookieName)
    }
  }

  private def optIn(
      testName: String,
      testGroup: String,
      cookieName: String,
  )(implicit request: RequestHeader): Result = {
    val currentTests = readCookie(request, if (cookieName == serverForceTestCookie) "server" else "client")
    val updatedTests = currentTests + (testName -> testGroup)
    val cookieValue = updatedTests.map { case (k, v) => s"$k:$v" }.mkString(",")

    SeeOther("/").withCookies(Cookie(cookieName, cookieValue, maxAge = Some(lifetime)))
  }

  private def optOut(
      testName: String,
      testGroup: String,
      cookieName: String,
  )(implicit request: RequestHeader): Result = {
    val currentTests = readCookie(request, if (cookieName == serverForceTestCookie) "server" else "client")
    val updatedTests = currentTests.filter({ case (k, v) => !(k == testName && v == testGroup) })

    if (updatedTests.isEmpty) {
      SeeOther("/").discardingCookies(DiscardingCookie(cookieName))
    } else {
      val cookieValue = updatedTests.map { case (k, v) => s"$k:$v" }.mkString(",")
      SeeOther("/").withCookies(Cookie(cookieName, cookieValue, maxAge = Some(lifetime)))
    }
  }

  def reset(): Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(
        WithoutRevalidationResult(
          SeeOther("/")
            .discardingCookies(
              DiscardingCookie(serverForceTestCookie),
              DiscardingCookie(clientForceTestCookie),
            ),
        ),
      )
    }

  def handle(choice: String, testType: String, test: String, group: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(
        WithoutRevalidationResult(
          opt(choice, testType, test, group),
        ),
      )
    }
}
