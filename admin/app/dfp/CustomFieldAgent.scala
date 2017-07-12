package dfp

import com.google.api.ads.dfp.axis.v201705.{CustomFieldValue, LineItem, TextValue}
import common.dfp.GuCustomField
import dfp.DfpApi.getAllCustomFields

import scala.util.Try

object CustomFieldAgent extends DataAgent[String, GuCustomField] {

  override def loadFreshData() = Try { getAllCustomFields.map(f => f.name -> f).toMap }
}

object CustomFieldService {

  def sponsor(lineItem: LineItem) = for {
    sponsorField <- CustomFieldAgent.get.data.get("Sponsor")
    customFieldValues <- Option(lineItem.getCustomFieldValues)
    sponsor <- customFieldValues.collect {
      case fieldValue: CustomFieldValue if fieldValue.getCustomFieldId == sponsorField.id =>
        fieldValue.getValue.asInstanceOf[TextValue].getValue
    }.headOption
  } yield sponsor
}
