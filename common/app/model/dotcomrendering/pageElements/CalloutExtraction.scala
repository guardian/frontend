package model.dotcomrendering.pageElements

import org.jsoup.Jsoup
import play.api.libs.json._

import scala.collection.JavaConverters._
import scala.util.Try

case class CalloutFormField(id: String, name: String, description: String, required: Boolean, hideLabel: Boolean, label: String)
object CalloutFormField {
  implicit val CalloutFormFieldWrites: Writes[CalloutFormField] = Json.writes[CalloutFormField]
}

object CalloutExtraction {
  private def extractCampaignPerTagName(campaigns: JsValue, tagName: String): Option[JsObject] = {
    val campaigns2 = campaigns.asInstanceOf[JsArray].value
    campaigns2
      .filter(c => ( c \ "fields" \ "tagName" ).asOpt[String].getOrElse("") == tagName)
      .map(_.asInstanceOf[JsObject]).headOption
  }

  private def formFieldItemToCalloutFormField( item: JsValue ) : Option[CalloutFormField] = {
    for {
      id          <- (item \ "id").asOpt[String]
      name        <- (item \ "name").asOpt[String]
      description <- (item \ "name").asOpt[String]
      required    <- (item \ "required").asOpt[String]
      hideLabel   <- (item \ "hide_label").asOpt[String]
      label       <- (item \ "name").asOpt[String]
    } yield {
      CalloutFormField(id, name, description, required == "1", hideLabel == "1", label)
    }
  }

  private def campaignJsObjectToCalloutBlockElement(campaign: JsObject): Option[CalloutBlockElement] = {
    for {
      id                 <- (campaign \ "id").asOpt[String]
      activeFrom         <- (campaign \ "activeFrom").asOpt[Long]
      displayOnSensitive <- (campaign \ "displayOnSensitive").asOpt[Boolean]
      formId             <- (campaign \ "fields" \ "formId").asOpt[Int]
      title              <- (campaign \ "name").asOpt[String]
      description        <- (campaign \ "fields" \ "description").asOpt[String]
      tagName            <- (campaign \ "fields" \ "tagName").asOpt[String]
      formFields1        <- (campaign \ "fields" \ "formFields").asOpt[JsArray]
    } yield {
      val formFields2 = formFields1
        .value
        .flatMap(formFieldItemToCalloutFormField(_))
        .toList
      CalloutBlockElement(id, activeFrom, displayOnSensitive, formId, title, description, tagName, formFields2)
    }
  }

  def extractCallout(html: String, campaigns: Option[JsValue]): Option[CalloutBlockElement] = {
    val doc = Jsoup.parseBodyFragment(html)
    val tagName = doc.getElementsByTag("div").asScala.headOption.map(_.attr("data-callout-tagname"))
    for {
      name     <- tagName
      cpgs     <- campaigns
      campaign <- extractCampaignPerTagName(cpgs, name)
      element  <- campaignJsObjectToCalloutBlockElement(campaign)
    } yield {
      element
    }
  }
}
