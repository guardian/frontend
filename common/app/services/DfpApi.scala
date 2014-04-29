package services

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import com.google.api.client.auth.oauth2.Credential
import common.Logging
import conf.{Configuration => GuConf}

object DfpApi extends Logging {

  private lazy val oAuth2Credential: Option[Credential] = GuConf.dfpApi.configObject map {
    new OfflineCredentials.Builder()
      .forApi(Api.DFP)
      .from(_)
      .build()
      .generateCredential()
  }

  private lazy val session: Option[DfpSession] = for {
    conf <- GuConf.dfpApi.configObject
    auth <- oAuth2Credential
  } yield {
    new DfpSession.Builder()
      .from(conf)
      .withOAuth2Credential(auth)
      .build()
  }

  private lazy val dfpServices = new DfpServices()

  private lazy val lineItemServiceOption: Option[LineItemServiceInterface] =
    session.map(dfpServices.get(_, classOf[LineItemServiceInterface]))

  private lazy val customTargetingServiceOption: Option[CustomTargetingServiceInterface] =
    session.map(dfpServices.get(_, classOf[CustomTargetingServiceInterface]))

  // TODO don't store this
  private lazy val allKeywordValues = DfpApi.fetchKeywordTargetingValues()

  def fetchCurrentLineItems(): Seq[LineItem] = lineItemServiceOption map { lineItemService =>
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
  } getOrElse Nil

  def fetchKeywordTargetingValues(): Map[Long, String] = customTargetingServiceOption map {customTargetingService =>


    def getAllCustomTargetingKeyIds = {
      var customTargetingKeyIds: Seq[Long] = Nil

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
  }  getOrElse Map()

  def fetchCurrentKeywordTargetingValues(): Seq[String] = {
    val currentLineItems = DfpApi.fetchCurrentLineItems()

    val keywordValues = currentLineItems.foldLeft(Seq[String]()) { (soFar, lineItem) =>
      val customTargeting = DfpApi.getCustomTargeting(lineItem)
      if (!customTargeting.get("Keywords").get.isEmpty) {
        soFar ++ customTargeting.flatMap(_._2.map(_.toString)).toSeq
      } else {
        soFar
      }
    }

    keywordValues.distinct.sorted
  }

  def getCustomTargeting(lineItem: LineItem): Map[String, Seq[AnyRef]] = {

    def customCriteriaExtractor(c: CustomCriteriaNode): List[Long] = c match {
      case c: CustomCriteria if c.getOperator == CustomCriteriaComparisonOperator.IS => c.getValueIds.toList
      case s: CustomCriteriaSet => s.getChildren.map(customCriteriaExtractor).flatten.toList
      case other => Nil
    }

    val customTargeting = customCriteriaExtractor(lineItem.getTargeting.getCustomTargeting)

    val keywordValues = customTargeting.flatMap(allKeywordValues.get)

    Map("Keywords" -> keywordValues)
  }
}
