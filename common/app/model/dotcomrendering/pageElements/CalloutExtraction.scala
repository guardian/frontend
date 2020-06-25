package model.dotcomrendering.pageElements

import org.jsoup.Jsoup
import play.api.libs.json._
import scala.collection.JavaConverters._

case class CalloutFormField(id: String, name: String, description: String, required: Boolean, hideLabel: Boolean, label: String)
object CalloutFormField {
  implicit val CalloutFormFieldWrites: Writes[CalloutFormField] = Json.writes[CalloutFormField]
}

object CalloutExtraction {
  private def extractCampaignPerTagName(campaigns: JsValue, tagName: String): Option[JsObject] = {
    val campaigns2 = campaigns.asInstanceOf[JsArray].value
    campaigns2
      .filter(c => ( c \ "fields" \ "tagName" ).as[String] == tagName)
      .map(_.asInstanceOf[JsObject]).headOption
  }

  private def formFieldItemToCalloutFormField( item: JsValue ) : CalloutFormField = {
    val id = (item \ "id").as[String]
    val name = (item \ "name").as[String]
    val description = (item \ "name").as[String]
    val required: Boolean = (item \ "required").as[String] == "1"
    val hideLabel: Boolean = (item \ "hide_label").as[String] == "1"
    val label = (item \ "name").as[String]
    CalloutFormField(id, name, description, required, hideLabel, label)
  }

  private def campaignJsObjectToCalloutBlockElement(campaign: JsObject): Option[CalloutBlockElement] = {
    val id = (campaign \ "id").as[String]
    val activeFrom = (campaign \ "activeFrom").as[Long]
    val displayOnSensitive = (campaign \ "displayOnSensitive").as[Boolean]
    val formId = (campaign \ "fields" \ "formId").as[Int]
    val title = (campaign \ "name").as[String]
    val description = (campaign \ "fields" \ "description").as[String]
    val tagName = (campaign \ "fields" \ "tagName").as[String]
    val formFields1 = (campaign \ "fields" \ "formFields").get.as[JsArray]
    val formFields2 = formFields1
      .value
      .map(formFieldItemToCalloutFormField(_))
      .toList
    val element = CalloutBlockElement(id, activeFrom, displayOnSensitive, formId, title, description, tagName, formFields2)
    Some(element)
  }

  def extractCallout(html: String, campaigns: Option[JsValue]): Option[CalloutBlockElement] = {
    val doc = Jsoup.parseBodyFragment(html)
    val tagName = doc.getElementsByTag("div").asScala.headOption.map(_.attr("data-callout-tagname"))
    for {
      name <- tagName
      cpgs <- campaigns
      campaign <- extractCampaignPerTagName(cpgs, name)
      element <- campaignJsObjectToCalloutBlockElement(campaign)
    } yield {
      element
    }
  }
}
