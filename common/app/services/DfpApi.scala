package services

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.lib.client.DfpSession
import conf.{Configuration => GuConf}

object DfpApi {

  private lazy val oAuth2Credential = new OfflineCredentials.Builder()
    .forApi(Api.DFP)
    .from(GuConf.dfpApi.configObject.get)
    .build()
    .generateCredential()

  private lazy val session = new DfpSession.Builder()
    .from(GuConf.dfpApi.configObject.get)
    .withOAuth2Credential(oAuth2Credential)
    .build()

  private lazy val dfpServices = new DfpServices()

  def fetchCurrentLineItems(): Seq[LineItem] = {
    val lineItemService = dfpServices.get(session, classOf[LineItemServiceInterface])

    val statementBuilder = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString)
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString)

    var totalResultSetSize = 0
    var totalResults: Seq[LineItem] = Nil

    do {
      val page = lineItemService.getLineItemsByStatement(statementBuilder.toStatement)
      val results = page.getResults
      if (results != null) {
        totalResultSetSize = page.getTotalResultSetSize
        totalResults ++= results
      }
      statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
    } while (statementBuilder.getOffset < totalResultSetSize)

    totalResults
  }
}
