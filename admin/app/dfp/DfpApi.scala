package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import conf.AdminConfiguration.dfpApi
import scala.collection.mutable

object DfpApi extends Logging {

  private lazy val session: Option[DfpSession] = for {
    conf <- dfpApi.configObject
  } yield {
    val auth = new OfflineCredentials.Builder()
      .forApi(Api.DFP)
      .from(conf)
      .build()
      .generateCredential()
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

  def fetchCurrentLineItems(): Seq[LineItem] = lineItemServiceOption.fold(Seq[LineItem]()) { lineItemService =>
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
      case e: Exception => log.error(s"Exception fetching current line items: $e")
    }

    val targetingKeys = mutable.Map[Long, String]()
    val targetingValues = mutable.Map[Long, String]()
    def buildTargetSet(crits: CustomCriteriaSet): TargetSet = {
      val targets = crits.getChildren.map { crit =>
        buildTarget(crit.asInstanceOf[CustomCriteria])
      }
      TargetSet(crits.getLogicalOperator.getValue, targets)
    }
    def buildTarget(crit: CustomCriteria): Target = {
      val keyName = targetingKeys.getOrElseUpdate(crit.getKeyId, fetchCustomTargetingKeyName(crit.getKeyId))
      Target(keyName, crit.getOperator.getValue, buildValueNames(crit.getValueIds))
    }
    def buildValueNames(valueIds: Array[Long]): Seq[String] = {
      valueIds map { id =>
        targetingValues.getOrElseUpdate(id, fetchCustomTargetingValueName(id))
      }
    }
    totalResults.take(100).foreach { r =>
      val targeting: Targeting = r.getTargeting
      if (targeting != null) {
        val customTargeting: CustomCriteriaSet = targeting.getCustomTargeting
        if (customTargeting != null) {
          println(r.getId)
          customTargeting.getChildren.foreach { critSet =>
            val ts = buildTargetSet(critSet.asInstanceOf[CustomCriteriaSet])
            println(ts.op)
            ts.targets.foreach(target => println(target))
          }
          println()
        }
      }
    }

    totalResults
  }

  def fetchAllKeywordTargetingValues(): Map[Long, String] =
    customTargetingServiceOption.fold(Map[Long, String]()) { customTargetingService =>

      def fetchKeywordTargetingKeyId(): Option[Long] = {
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
            log.error(s"Exception fetching custom targeting key IDs: $e")
            None
        }
      }

      val keywordTargetingKeyId = fetchKeywordTargetingKeyId()

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
        case e: Exception => log.error(s"Exception fetching custom targeting values: $e")
      }

      targetingValues
    }

  def fetchKeywordTargetingValues(lineItems: Seq[LineItem]): Seq[String] = {
    val allKeywordTargetingValues = fetchAllKeywordTargetingValues()
    val keywordValues = lineItems.foldLeft(Seq[String]()) { (soFar, lineItem) =>
      val customTargeting = DfpApi.getCustomTargeting(lineItem, allKeywordTargetingValues)
      if (!customTargeting.get("Keywords").get.isEmpty) {
        soFar ++ customTargeting.flatMap(_._2.map(_.toString)).toSeq
      } else {
        soFar
      }
    }

    keywordValues.distinct.sorted
  }

  def fetchSponsoredKeywordTargetingValues(lineItems: Seq[LineItem]): Seq[String] = Seq("b", "c")

  def fetchAdvertisedFeatureKeywordTargetingValues(lineItems: Seq[LineItem]): Seq[String] = Seq("a", "b")

  def fetchCustomTargetingKeyName(id: Long): String = {
    customTargetingServiceOption.fold("") { customTargetingService =>

      val statementBuilder = new StatementBuilder()
        .where("id = :id")
        .withBindVariableValue("id", id)

      try {
        val page = customTargetingService.getCustomTargetingKeysByStatement(statementBuilder.toStatement)
        page.getResults(0).getName
      } catch {
        case e: Exception =>
          log.error(s"Exception fetching custom targeting key name: $e")
          ""
      }
    }
  }

  def fetchCustomTargetingValueName(id: Long): String = {
    customTargetingServiceOption.fold("") { customTargetingService =>

      val statementBuilder = new StatementBuilder()
        .where("id = :id")
        .withBindVariableValue("id", id)

      try {
        val page = customTargetingService.getCustomTargetingValuesByStatement(statementBuilder.toStatement)
        page.getResults(0).getName
      } catch {
        case e: Exception =>
          log.error(s"Exception fetching custom targeting value name: $e")
          ""
      }
    }
  }

  def getCustomTargeting(lineItem: LineItem, allKeywordValues: Map[Long, String]): Map[String, Seq[AnyRef]] = {

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
