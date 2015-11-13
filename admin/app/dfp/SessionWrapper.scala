package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.{AdminConfiguration, Configuration}
import dfp.ApiHelper.fetch
import dfp.DfpServiceRegistry._

import scala.util.control.NonFatal

// This will replace DfpApiWrapper
private[dfp] class SessionWrapper(dfpSession: DfpSession) extends Logging {

  private val dfpServices = new DfpServices

  private lazy val creativeTemplateService =
    dfpServices.get(dfpSession, classOf[CreativeTemplateServiceInterface])

  private lazy val creativeService =
    dfpServices.get(dfpSession, classOf[CreativeServiceInterface])

  def logFailure(e: Throwable, loadedType: String, stmtBuilder: StatementBuilder): Nil.type = {
    val qry = stmtBuilder.buildQuery()
    log.error(s"Loading $loadedType with statement '$qry' failed: ${e.getMessage}")
    Nil
  }

  def logAround[T](loadingType: String, stmtBuilder: StatementBuilder)
                  (doLoad: => Seq[T]): Seq[T] = {
    try {
      log.info(s"Loading $loadingType with statement '${stmtBuilder.buildQuery()}' ...")
      val start = System.currentTimeMillis()
      val loaded = doLoad
      val duration = System.currentTimeMillis() - start
      log.info(s"Successfully loaded ${loaded.size} $loadingType in $duration ms")
      loaded
    } catch {
      case NonFatal(e) =>
        val qry = stmtBuilder.buildQuery()
        log.error(s"Loading $loadingType with statement $qry failed: ${e.getMessage}")
        Nil
    }
  }

  def creativeTemplates(stmtBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    logAround("creative templates", stmtBuilder) {
      fetch(stmtBuilder) { statement =>
        val page = creativeTemplateService.getCreativeTemplatesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def creatives(stmtBuilder: StatementBuilder): Seq[Creative] = {
    logAround("creatives", stmtBuilder) {
      fetch(stmtBuilder) { statement =>
        val page = creativeService.getCreativesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }
}

object SessionWrapper {

  def apply(): Option[SessionWrapper] = {
    val dfpSession = try {
      for {
        clientId <- AdminConfiguration.dfpApi.clientId
        clientSecret <- AdminConfiguration.dfpApi.clientSecret
        refreshToken <- AdminConfiguration.dfpApi.refreshToken
        appName <- AdminConfiguration.dfpApi.appName
      } yield {
        val credential = new OfflineCredentials.Builder()
          .forApi(Api.DFP)
          .withClientSecrets(clientId, clientSecret)
          .withRefreshToken(refreshToken)
          .build().generateCredential()
        new DfpSession.Builder()
          .withOAuth2Credential(credential)
          .withApplicationName(appName)
          .withNetworkCode(Configuration.commercial.dfpAccountId)
          .build()
      }
    } catch {
      case NonFatal(e) =>
        log.error(s"Building DFP session failed: ${e.getMessage}")
        None
    }

    dfpSession map (new SessionWrapper(_))
  }
}
