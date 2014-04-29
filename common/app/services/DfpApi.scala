package services

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.{Configuration => GuConf}

object DfpApi extends Logging {

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

    try {
      do {
        val page = lineItemService.getLineItemsByStatement(statementBuilder.toStatement)
        val results = page.getResults
        if (results != null) {
          totalResultSetSize = page.getTotalResultSetSize
          totalResults ++= results
        }
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      } while (statementBuilder.getOffset < totalResultSetSize)
    } catch {
      case e: Exception => println(s"Exception fetching current line items: ${e.getMessage}")
    }

    totalResults
  }

  def fetchKeywordTargetingValues(): Map[Long, String] = {


    def getAllCustomTargetingKeyIds = {
      var customTargetingKeyIds: Seq[Long] = Nil

      val customTargetingService = dfpServices.get(session, classOf[CustomTargetingServiceInterface])

      val statementBuilder = new StatementBuilder()
        .orderBy("id ASC")
        .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

      var totalResultSetSize = 0

      try {
        do {
          val page = customTargetingService.getCustomTargetingKeysByStatement(statementBuilder.toStatement)

          if (page.getResults != null) {
            totalResultSetSize = page.getTotalResultSetSize
            customTargetingKeyIds ++= page.getResults.map(_.getId.toLong)
          }

          statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        } while (statementBuilder.getOffset < totalResultSetSize)
      } catch {
        case e: Exception => println(s"Exception fetching custom targeting key IDs: ${e.getMessage}")
      }

      customTargetingKeyIds
    }

    def getKeywordTargetingKeyId: Option[Long] = {
      val customTargetingService = dfpServices.get(session, classOf[CustomTargetingServiceInterface])

      val statementBuilder = new StatementBuilder()
        .where("displayName = :displayName")
        .withBindVariableValue("displayName", "Keywords")

      try {
        val page = customTargetingService.getCustomTargetingKeysByStatement(statementBuilder.toStatement)

        if (page.getResults != null) {
          Some(page.getResults(0).getId)
        } else {
          None
        }

      } catch {
        case e: Exception =>
          println(s"Exception fetching custom targeting key IDs: ${e.getMessage}")
          None
      }
    }


    val customTargetingService = dfpServices.get(session, classOf[CustomTargetingServiceInterface])

    val keywordTargetingKeyId = getKeywordTargetingKeyId

    val statementBuilder = new StatementBuilder()
      .where("customTargetingKeyId = :targetingKeyId")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    statementBuilder.withBindVariableValue("targetingKeyId", keywordTargetingKeyId.get)

    var totalResultSetSize = 0
    statementBuilder.offset(0)

    var targetingValues: Map[Long, String] = Map()

    try {
      do {
        val page = customTargetingService.getCustomTargetingValuesByStatement(statementBuilder.toStatement)

        val results = page.getResults
        if (results != null) {
          totalResultSetSize = page.getTotalResultSetSize
          targetingValues ++= results.map(result => (result.getId.toLong, result.getName))
        }

        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      } while (statementBuilder.getOffset < totalResultSetSize)
    } catch {
      case e: Exception => println(s"Exception fetching custom targeting values: $e")
    }

    targetingValues
  }

  def getCustomTargeting(lineItem: LineItem): Map[String, Seq[AnyRef]] = {

    def customCriteriaExtractor(c: CustomCriteriaNode): List[Long] = c match {
      case c: CustomCriteria if c.getOperator == CustomCriteriaComparisonOperator.IS => c.getValueIds.toList
      case c: CustomCriteria => Nil
      case s: CustomCriteriaSet => s.getChildren.map(customCriteriaExtractor).flatten.toList
    }

    val customTargeting = customCriteriaExtractor(lineItem.getTargeting.getCustomTargeting)

    val allKeywordValues = DfpApi.fetchKeywordTargetingValues()

    val keywordValues = customTargeting.flatMap(allKeywordValues.get)

    Map("Keywords" -> keywordValues)
  }
}
