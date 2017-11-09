package idapiclient

import com.gu.identity.model.{EmailList , Subscriber, User}

import scala.concurrent.{ExecutionContext, Future}
import idapiclient.responses.{AccountDeletionResult, CookiesResponse, Error, HttpResponse}
import conf.IdConfig
import idapiclient.parser.IdApiJsonBodyParser
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.Serialization.write
import utils.SafeLogging
import idapiclient.requests.{DeletionBody, PasswordUpdate, TokenPassword}
import play.api.libs.ws.WSClient

class IdApiClient(
    idJsonBodyParser: IdApiJsonBodyParser,
    conf: IdConfig,
    httpClient: HttpClient)
    (implicit val executionContext: ExecutionContext) extends SafeLogging {

  private val apiRootUrl: String = conf.apiRoot
  private val clientAuth: Auth = ClientAuth(conf.apiClientToken)

  import idJsonBodyParser.{extractUnit, extract, jsonField}

  private implicit val formats = idJsonBodyParser.formats

  private def extractUser: (Response[HttpResponse]) => Response[User] = extract(jsonField("user"))

  //   AUTH
  def authBrowser(userAuth: Auth, trackingData: TrackingData, persistent: Option[Boolean] = None): Future[Response[CookiesResponse]] = {
    val params = buildParams(None, Some(trackingData), Seq("format" -> "cookies") ++ persistent.map("persistent" -> _.toString))
    val headers = buildHeaders(Some(userAuth))
    val body = write(userAuth)
    val response = httpClient.POST(apiUrl("auth"), Some(body), params, headers)
    response map extract(jsonField("cookies"))
  }

  def unauth(auth: Auth, trackingData: TrackingData): Future[Response[CookiesResponse]] =
    post("unauth", Some(auth), Some(trackingData)) map extract[CookiesResponse](jsonField("cookies"))

  // USERS

  def user(userId: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", userId)
    val params = buildParams(Some(auth))
    val headers = buildHeaders(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, headers)
    response map extractUser
  }

  def userFromVanityUrl(vanityUrl: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", "vanityurl", vanityUrl)
    val params = buildParams(Some(auth))
    val headers = buildHeaders(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, headers)
    response map extractUser
  }

  def userFromQueryParam(param: String, field: String,auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = s"/user?${field}=${param}"
    println(apiPath)
    val params = buildParams(Some(auth))
    val headers = buildHeaders(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, headers)
    response map extractUser
  }

  def saveUser(userId: String, user: UserUpdateDTO, auth: Auth): Future[Response[User]] =
    post(urlJoin("user", userId), Some(auth), body = Some(write(user))) map extractUser

  def me(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user", "me")
    val params = buildParams(Some(auth))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders(Some(auth)))
    response map extractUser
  }

  /**
   * data to save to a subdocument in the user's record
   * The path param provides the subdocument to be saved to e.g. prefs.myApp
   */
  def updateUser(userId: String, auth: Auth, trackingData: TrackingData, path: String, data: JValue): Future[Response[User]] = {
    val pathParts = path.split('.').toList
    post(urlJoin("user" :: userId :: pathParts : _*), Some(auth), Some(trackingData), Some(write(data))) map extractUser
  }

  def updateUser(user: User, auth: Auth, trackingData: TrackingData): Future[Response[User]] =
    post("user", Some(auth), Some(trackingData), Some(write(user))) map extractUser

  def register(user: User, trackingParameters: TrackingData, returnUrl: Option[String] = None): Future[Response[User]] = {
    val userData = write(user)
    val params = buildParams(tracking = Some(trackingParameters), extra = returnUrl.map(url => Iterable("returnUrl" -> url)))
    val headers = buildHeaders(extra = trackingParameters.ipAddress.map(ip => Iterable("X-Forwarded-For" -> ip)))
    val response = httpClient.POST(apiUrl("user"), Some(userData), params, headers)
    response map extractUser
  }

  // PASSWORD RESET/UPDATE

  def passwordExists( auth: Auth ): Future[Response[Boolean]] = {
    val apiPath = urlJoin("user", "password-exists")
    val response = httpClient.GET(apiUrl(apiPath), None, buildParams(Some(auth)), buildHeaders(Some(auth)))
    response map extract[Boolean](jsonField("passwordExists"))
  }

  def updatePassword(pwdUpdate: PasswordUpdate, auth: Auth, trackingData: TrackingData ): Future[Response[Unit]] = {
    val apiPath = urlJoin("user", "password")
    val body = write(pwdUpdate)
    val response = post(apiPath, Some(auth), Some(trackingData), Some(body))
    response map extractUnit
  }

  def userForToken( token : String ): Future[Response[User]] = {
    val apiPath = urlJoin("pwd-reset", "user-for-token")
    val params = buildParams(extra = Iterable("token" -> token))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders())
    response map extractUser
  }

  def resetPassword( token : String, newPassword : String ): Future[Response[Unit]] = {
    val apiPath = urlJoin("pwd-reset", "reset-pwd-for-user")
    val postBody = write(TokenPassword(token, newPassword))
    val response = httpClient.POST(apiUrl(apiPath), Some(postBody), clientAuth.parameters, clientAuth.headers)
    response map extractUnit
  }

  def sendPasswordResetEmail(emailAddress : String, trackingParameters: TrackingData): Future[Response[Unit]] = {
    val apiPath = urlJoin("pwd-reset", "send-password-reset-email")
    val params = buildParams(tracking = Some(trackingParameters), extra = Iterable("email-address" -> emailAddress, "type" -> "reset"))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders())
    response map extractUnit
  }

  // EMAILS

  def userEmails(userId: String, trackingParameters: TrackingData): Future[Response[Subscriber]] = {
    val apiPath = urlJoin("useremails", userId)
    val params = buildParams(tracking = Some(trackingParameters))
    val response = httpClient.GET(apiUrl(apiPath), None, params, buildHeaders())
    response map extract(jsonField("result"))
  }

  def addSubscription(userId: String, emailList: EmailList, auth: Auth, trackingParameters: TrackingData): Future[Response[Unit]] = {
    post(urlJoin("useremails", userId, "subscriptions"), Some(auth), Some(trackingParameters), Some(write(emailList))) map extractUnit
  }

  def deleteSubscription(userId: String, emailList: EmailList, auth: Auth, trackingParameters: TrackingData): Future[Response[Unit]] = {
    delete(urlJoin("useremails", userId, "subscriptions"), Some(auth), Some(trackingParameters), Some(write(emailList))) map extractUnit
  }

  def updateUserEmails(userId: String, subscriber: Subscriber, auth: Auth, trackingParameters: TrackingData): Future[Response[Unit]] =
    post(urlJoin("useremails", userId), Some(auth), Some(trackingParameters), Some(write(subscriber))) map extractUnit

  def validateEmail(token: String, trackingParameters: TrackingData): Future[Response[Unit]] =
    post(urlJoin("user","validate-email", token), trackingParameters = Some(trackingParameters)) map extractUnit

  def resendEmailValidationEmail(auth: Auth, trackingParameters: TrackingData): Future[Response[Unit]] =
    post("user/send-validation-email", Some(auth), Some(trackingParameters)) map extractUnit

  def deleteTelephone(auth: Auth): Future[Response[Unit]] =
    delete("user/me/telephoneNumber", Some(auth)) map extractUnit


  // THIRD PARTY SIGN-IN
  def addUserToGroup(groupCode: String, auth: Auth): Future[Response[Unit]] = {
    post(urlJoin("user", "me", "group", groupCode), Some(auth)) map extractUnit
  }

  def executeAccountDeletionStepFunction(userId: String, email: String, reason: Option[String], auth: Auth): Future[Response[AccountDeletionResult]] = {
    httpClient.POST(
        s"${conf.accountDeletionApiRoot}/delete",
        Some(write(DeletionBody(userId, email, reason))),
        urlParameters = Nil,
        headers = buildHeaders(Some(auth), extra = Seq(("x-api-key", conf.accountDeletionApiKey)))
    ) map extract[AccountDeletionResult](identity)
  }

  def post(apiPath: String,
           auth: Option[Auth] = None,
           trackingParameters: Option[TrackingData] = None,
           body: Option[String] = None): Future[Response[HttpResponse]] =
    httpClient.POST(apiUrl(apiPath), body, buildParams(auth, trackingParameters), buildHeaders(auth))

  def delete(apiPath: String,
           auth: Option[Auth] = None,
           trackingParameters: Option[TrackingData] = None,
           body: Option[String] = None): Future[Response[HttpResponse]] =
    httpClient.DELETE(apiUrl(apiPath), body, buildParams(auth, trackingParameters), buildHeaders(auth))

  implicit object ParamsOpt2Params extends (Option[Parameters] => Parameters) {
    def apply(paramsOpt: Option[Parameters]): Parameters = paramsOpt.getOrElse(Iterable.empty)
   }

  private def buildParams(auth: Option[Auth] = None,
                            tracking: Option[TrackingData] = None,
                            extra: Parameters = Iterable.empty): Parameters = {
    extra ++ clientAuth.parameters ++
      auth.map(_.parameters) ++
      tracking.map({ trackingData =>
        trackingData.parameters ++ trackingData.ipAddress.map(ip => "ip" -> ip)
      })
  }

  private def buildHeaders(auth: Option[Auth] = None, extra: Parameters = Iterable.empty): Parameters = {
    extra ++ clientAuth.headers ++ auth.map(_.headers)
  }

  private def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  private def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {
      slug.stripPrefix("/").stripSuffix("/")
    }) mkString "/"
  }
}


class HttpClient(
    wsClient: WSClient)
    (implicit val executionContext: ExecutionContext) extends SafeLogging {

  def GET(uri: String, body: Option[String] = None, urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    makeRequest("GET", uri, body, urlParameters, headers)
  }

  def POST(uri: String, body: Option[String], urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    makeRequest("POST", uri, body, urlParameters, headers)
  }

  def DELETE(uri: String, body: Option[String], urlParameters: Parameters = Nil, headers: Parameters): Future[Response[HttpResponse]] = {
    makeRequest("DELETE", uri, body, urlParameters, headers)
  }

  def makeRequest(
      method: String,
      uri: String,
      body: Option[String],
      urlParameters: Parameters = Nil,
      headers: Parameters): Future[Response[HttpResponse]] = {

    wsClient
      .url(uri)
      .withBody(body.getOrElse("")) // FIXME: DELETE should not have a body
      .withQueryStringParameters(urlParameters.toList: _*)
      .withHttpHeaders(headers.toList: _*)
      .withMethod(method)
      .execute()
      .map { resp => Right(HttpResponse(resp.body, resp.status, resp.statusText)) }
      .recover {
        case e: Throwable =>
          logger.error(s"Network error while communicating with $uri:", e)
          Left(List(Error(e.getClass.getName, e.toString)))
      }
  }
}

