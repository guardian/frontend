package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.admanager.axis.utils.v202405.{ReportDownloader, StatementBuilder}
import com.google.api.ads.admanager.axis.v202405._
import com.google.api.ads.admanager.lib.client.AdManagerSession
import com.google.common.io.CharSource
import common.GuLogging
import conf.{AdminConfiguration, Configuration}
import dfp.Reader.read
import dfp.SessionLogger.{logAroundCreate, logAroundPerform, logAroundRead, logAroundReadSingle}
import scala.jdk.CollectionConverters._

import scala.util.control.NonFatal
import common.DfpApiMetrics.DfpSessionErrors

private[dfp] class SessionWrapper(dfpSession: AdManagerSession) {

  private val services = new ServicesWrapper(dfpSession)

  def lineItems(stmtBuilder: StatementBuilder): Seq[LineItem] = {
    logAroundRead("line items", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.lineItemService.getLineItemsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def orders(stmtBuilder: StatementBuilder): Seq[Order] = {
    logAroundRead("orders", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.orderService.getOrdersByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def companies(stmtBuilder: StatementBuilder): Seq[Company] = {
    logAroundRead("companies", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.companyService.getCompaniesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customFields(stmtBuilder: StatementBuilder): Seq[CustomField] = {
    logAroundRead("custom fields", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customFieldsService.getCustomFieldsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingKeys(stmtBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    logAroundRead("custom targeting keys", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingKeysByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def customTargetingValues(stmtBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    logAroundRead("custom targeting values", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.customTargetingService.getCustomTargetingValuesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def adUnits(stmtBuilder: StatementBuilder): Seq[AdUnit] = {
    logAroundRead("ad units", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.inventoryService.getAdUnitsByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def creativeTemplates(stmtBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    logAroundRead("creative templates", stmtBuilder) {
      read(stmtBuilder) { statement =>
        val page = services.creativeTemplateService.getCreativeTemplatesByStatement(statement)
        (page.getResults, page.getTotalResultSetSize)
      }
    }
  }

  def getRootAdUnitId: String = {
    services.networkService.getCurrentNetwork.getEffectiveRootAdUnitId
  }

  def getReportQuery(reportId: Long): Option[ReportQuery] = {
    // Retrieve the saved query.
    val stmtBuilder = new StatementBuilder()
      .where("id = :id")
      .limit(1)
      .withBindVariableValue("id", reportId)

    val page: SavedQueryPage = services.reportService.getSavedQueriesByStatement(stmtBuilder.toStatement)
    // page.getResults() may return null.
    val savedQuery: Option[SavedQuery] = Option(page.getResults()).flatMap(_.toList.headOption)

    /*
     * if this is null it means that the report is incompatible with the API version we're using.
     * Eg. check this for supported date-range types:
     * https://developers.google.com/doubleclick-publishers/docs/reference/v201711/ReportService.ReportQuery#daterangetype
     * And supported filter types:
     * https://developers.google.com/doubleclick-publishers/docs/reference/v201711/ReportService.ReportQuery#statement`
     * Also see https://developers.google.com/doubleclick-publishers/docs/reporting
     */
    savedQuery.flatMap(qry => Option(qry.getReportQuery))
  }

  def runReportJob(report: ReportQuery): Seq[String] = {

    val reportJob = new ReportJob()
    reportJob.setReportQuery(report)

    val runningJob = services.reportService.runReportJob(reportJob)

    val reportDownloader = new ReportDownloader(services.reportService, runningJob.getId)
    reportDownloader.waitForReportReady()

    // Download the report.
    val options: ReportDownloadOptions = new ReportDownloadOptions()
    options.setExportFormat(ExportFormat.CSV_DUMP)
    options.setUseGzipCompression(true)
    val charSource: CharSource = reportDownloader.getReportAsCharSource(options)
    charSource.readLines().asScala.toSeq
  }

  object lineItemCreativeAssociations {

    private val licaService = services.licaService
    private val typeName = "licas"

    def get(stmtBuilder: StatementBuilder): Seq[LineItemCreativeAssociation] = {
      logAroundRead(typeName, stmtBuilder) {
        read(stmtBuilder) { statement =>
          val page = licaService.getLineItemCreativeAssociationsByStatement(statement)
          (page.getResults, page.getTotalResultSetSize)
        }
      }
    }

    def getPreviewUrl(lineItemId: Long, creativeId: Long, url: String): Option[String] =
      logAroundReadSingle(typeName) {
        licaService.getPreviewUrl(lineItemId, creativeId, url)
      }

    def create(licas: Seq[LineItemCreativeAssociation]): Seq[LineItemCreativeAssociation] = {
      logAroundCreate(typeName) {
        licaService.createLineItemCreativeAssociations(licas.toArray).toIndexedSeq
      }
    }

    def deactivate(filterStatement: Statement): Int = {
      logAroundPerform(typeName, "deactivating", filterStatement) {
        val action = new DeactivateLineItemCreativeAssociations()
        val result = licaService.performLineItemCreativeAssociationAction(action, filterStatement)
        result.getNumChanges
      }
    }
  }

  object creatives {

    private val creativeService = services.creativeService
    private val typeName = "creatives"

    def get(stmtBuilder: StatementBuilder): Seq[Creative] = {
      logAroundRead(typeName, stmtBuilder) {
        read(stmtBuilder) { statement =>
          val page = creativeService.getCreativesByStatement(statement)
          (page.getResults, page.getTotalResultSetSize)
        }
      }
    }

    def create(creatives: Seq[Creative]): Seq[Creative] = {
      logAroundCreate(typeName) {
        creativeService.createCreatives(creatives.toArray).toIndexedSeq
      }
    }
  }
}

object SessionWrapper extends GuLogging {

  def apply(networkId: Option[String] = None): Option[SessionWrapper] = {
    val dfpSession =
      try {
        for {
          serviceAccountKeyFile <- AdminConfiguration.dfpApi.serviceAccountKeyFile
          appName <- AdminConfiguration.dfpApi.appName
        } yield {
          val credential = new OfflineCredentials.Builder()
            .forApi(Api.AD_MANAGER)
            .withJsonKeyFilePath(serviceAccountKeyFile.toString())
            .build()
            .generateCredential()
          new AdManagerSession.Builder()
            .withOAuth2Credential(credential)
            .withApplicationName(appName)
            .withNetworkCode(networkId.getOrElse(Configuration.commercial.dfpAccountId))
            .build()
        }
      } catch {
        case NonFatal(e) =>
          log.error(s"Building DFP session failed.", e)
          DfpSessionErrors.increment();
          None
      }

    dfpSession map (new SessionWrapper(_))
  }
}
