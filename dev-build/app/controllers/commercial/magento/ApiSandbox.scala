package controllers.commercial.magento

import common.ExecutionContexts
import conf.Configuration.commercial.magento
import model.NoCache
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}

/**
 * This allows us to check the content of protected Magento endpoints.
 *
 * See:
 * http://www.magentocommerce.com/api/rest/Resources/resources.html
 * http://www.magentocommerce.com/api/rest/get_filters.html
 */
class ApiSandbox(wsClient: WSClient) extends Controller with ExecutionContexts {

  private val domain = magento.domain.getOrElse(throw new RuntimeException("Unable to get [magento.domain] property. Is it set in the configuration?"))
  private val oauth = {
    val key = ConsumerKey(magento.consumerKey.get, magento.consumerSecret.get)
    val accessToken = RequestToken(magento.accessToken.getOrElse(throw new RuntimeException("update frontend.properties in your .gu folder - change \"magento.access.token\" to \"magento.access.token.key\"")), magento.accessTokenSecret.get)
    OAuthCalculator(key, accessToken)
  }

  def getResource(path: String) = Action.async { implicit request =>
    wsClient.url(s"http://$domain/$path")
      .sign(oauth)
      .get()
      .map(result => NoCache(Ok(result.body)))
  }

  def getBooks(csvIsbns: String) = {
    val isbns = csvIsbns split ","
    val path = isbns.zipWithIndex.foldLeft("api/rest/products?filter[1][attribute]=isbn") {
      case (soFar, (isbn, i)) => s"$soFar&filter[1][in][${i + 1}]=$isbn"
    }
    getResource(path)
  }

}
