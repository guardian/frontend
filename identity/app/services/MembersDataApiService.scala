package services

import common.{HttpStatusException, Logging}
import play.api.libs.ws.{DefaultWSCookie, WSClient, WSCookie, WSResponse}
import play.api.mvc.{Cookie, Cookies}

import scala.concurrent.{ExecutionContext, Future}

// TODO model member data
case class MemberData()

class MembersDataApiService(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit executionContext: ExecutionContext) extends Logging with implicits.WSRequests {

  private def toWSCookie(c: Cookie): WSCookie = {
    DefaultWSCookie(
      name = c.name,
      value = c.value,
      domain = c.domain,
      path = Option(c.path),
      maxAge = c.maxAge.map[Long](i => i.toLong),
      secure = c.secure,
      httpOnly = c.httpOnly
    )
  }

  def getMembersData(cookies: Cookies): Future[WSResponse] = {
    val root = config.membersDataApiUrl
    val path = "/user-attributes/me"
    wsClient.url(s"$root$path").withCookies(cookies.map(c => toWSCookie(c)).toSeq: _*).get() flatMap { response =>
      response.status match {
        case 200 =>
          println("200")
          println(response.body)
          Future.successful(response)
        case _ =>
          println(response.status)
          println(response.statusText)
          Future.failed(HttpStatusException(response.status, response.statusText))
      }
    }
  }
}
