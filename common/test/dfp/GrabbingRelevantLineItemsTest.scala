package dfp

import com.google.api.ads.common.lib.auth.OfflineCredentials
import com.google.api.ads.common.lib.auth.OfflineCredentials.Api
import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import org.scalatest._

import scala.language.reflectiveCalls
import org.apache.commons.configuration.MapConfiguration
import conf.{Configuration => GuConf}


class GrabbingRelevantLineItemsTest extends FlatSpec with Matchers {
  def fixture = new {

    val oAuth2Credential = new OfflineCredentials.Builder()
      .forApi(Api.DFP)
      .from(GuConf.dfpApi.configObject.get)
      .build()
      .generateCredential()

    // Construct a DfpSession.
    val session = new DfpSession.Builder()
      .from(GuConf.dfpApi.configObject.get)
      .withOAuth2Credential(oAuth2Credential)
      .build()

    val dfpServices = new DfpServices()
  }

  "DFP Api" should "return the list of line items that will be displayed today" in {
    val f = fixture
    val lineItemService = f.dfpServices.get(f.session, classOf[LineItemServiceInterface])

    val statementBuilder = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString())
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString());

    val resultPage = lineItemService.getLineItemsByStatement(statementBuilder.toStatement)

    val results: Array[LineItem] = resultPage.getResults()

    // Page size is 500
    resultPage.getTotalResultSetSize should equal (36)
    results.size should equal (1685)
  }

  "DFP Api" should "allow us to get the keywords associated" in {
    val f = fixture
    val lineItemService = f.dfpServices.get(f.session, classOf[LineItemServiceInterface])

    val statementBuilder = new StatementBuilder()
      .where("status = :readyStatus OR status = :deliveringStatus")
      .orderBy("id ASC")
      .limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)
      .withBindVariableValue("readyStatus", ComputedStatus.READY.toString())
      .withBindVariableValue("deliveringStatus", ComputedStatus.DELIVERING.toString());

    val resultPage = lineItemService.getLineItemsByStatement(statementBuilder.toStatement)

    val results: Array[LineItem] = resultPage.getResults()


    // everything should have some sort of targetting, but not everything has custom targetting.
    val stuffWithTargeting: Array[LineItem] = results
      .filter(_.getTargeting != null)
      .filter (_.getTargeting.getCustomTargeting != null)

    stuffWithTargeting.size should be (319)

    val lineItem: LineItem = stuffWithTargeting(0)
    lineItem.getTargeting.getCustomTargeting

  }



}
