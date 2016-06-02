package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._

import scala.util.Try

object CustomFieldAgent extends DataAgent[String, Long] {

  override def loadFreshData() = Try {
    val maybeData = for (session <- SessionWrapper()) yield {
      val fields = session.customFields(new StatementBuilder())
      fields.map(f => f.getName -> f.getId.toLong).toMap
    }
    maybeData getOrElse Map.empty
  }
}

object CustomFieldService {

  def sponsor(lineItem: LineItem) = for {
    sponsorFieldId <- CustomFieldAgent.get.data.get("Sponsor")
    customFieldValues <- Option(lineItem.getCustomFieldValues)
    sponsor <- customFieldValues.collect {
      case fieldValue: CustomFieldValue if fieldValue.getCustomFieldId == sponsorFieldId =>
        fieldValue.getValue.asInstanceOf[TextValue].getValue
    }.headOption
  } yield sponsor

}
