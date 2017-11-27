package dfp

import com.google.api.ads.dfp.axis.utils.v201705.StatementBuilder
import com.google.api.ads.dfp.axis.v201705.{CustomFieldValue, LineItem, TextValue}
import common.dfp.GuCustomField
import concurrent.BlockingOperations

import scala.util.Try

class CustomFieldAgent(val blockingOperations: BlockingOperations) extends DataAgent[String, GuCustomField] {

  override def loadFreshData(): Try[Map[String, GuCustomField]] = Try {
    getAllCustomFields.map(f => f.name -> f).toMap
  }

  private def getAllCustomFields: Seq[GuCustomField] = {
    val stmtBuilder = new StatementBuilder()
    DfpApi.withDfpSession(_.customFields(stmtBuilder).map(DataMapper.toGuCustomField))
  }
}

class CustomFieldService(customFieldAgent: CustomFieldAgent) {

  def sponsor(lineItem: LineItem): Option[String] = for {
    sponsorField <- customFieldAgent.get.data.get("Sponsor")
    customFieldValues <- Option(lineItem.getCustomFieldValues)
    sponsor <- customFieldValues.collect {
      case fieldValue: CustomFieldValue if fieldValue.getCustomFieldId == sponsorField.id =>
        fieldValue.getValue.asInstanceOf[TextValue].getValue
    }.headOption
  } yield sponsor
}
