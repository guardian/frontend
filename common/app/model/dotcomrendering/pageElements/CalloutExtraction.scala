package model.dotcomrendering.pageElements

import org.jsoup.Jsoup
import play.api.libs.json._

import scala.collection.JavaConverters._

sealed trait CalloutFormField
case class CalloutFormFieldBase(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    label: String,
) extends CalloutFormField
case class CalloutFormFieldRadio(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    label: String,
    options: JsArray,
) extends CalloutFormField
case class CalloutFormFieldCheckbox(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    label: String,
    options: JsArray,
) extends CalloutFormField
case class CalloutFormFieldSelect(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    label: String,
    options: JsArray,
) extends CalloutFormField

object CalloutFormField {
  implicit val CalloutFormFieldBaseWrites: Writes[CalloutFormFieldBase] = Json.writes[CalloutFormFieldBase]
  implicit val CalloutFormFieldRadioWrites: Writes[CalloutFormFieldRadio] = Json.writes[CalloutFormFieldRadio]
  implicit val CalloutFormFieldCheckboxWrites: Writes[CalloutFormFieldCheckbox] = Json.writes[CalloutFormFieldCheckbox]
  implicit val CalloutFormFieldSelectWrites: Writes[CalloutFormFieldSelect] = Json.writes[CalloutFormFieldSelect]

  implicit val CalloutFormFieldWrites: Writes[CalloutFormField] = Json.writes[CalloutFormField]
}

object CalloutExtraction {
  private def extractCampaignPerTagName(campaigns: JsValue, tagName: String): Option[JsObject] = {
    val campaigns2 = campaigns.asInstanceOf[JsArray].value
    campaigns2
      .filter(c => (c \ "fields" \ "tagName").asOpt[String].getOrElse("") == tagName)
      .map(_.asInstanceOf[JsObject])
      .headOption
  }

  private def formFieldItemToCalloutFormFieldBase(item: JsValue): Option[CalloutFormFieldBase] = {
    val description = (item \ "description").asOpt[String]
    for {
      id <- (item \ "id").asOpt[String]
      type_ <- (item \ "type").asOpt[String]
      name <- (item \ "name").asOpt[String]
      required <- (item \ "required").asOpt[String]
      hideLabel <- (item \ "hide_label").asOpt[String]
      label <- (item \ "label").asOpt[String]
    } yield {
      CalloutFormFieldBase(id, type_, name, description, required == "1", hideLabel == "1", label)
    }
  }

  private def formFieldItemToCalloutFormFieldRadio(item: JsValue): Option[CalloutFormFieldRadio] = {
    val description = (item \ "description").asOpt[String]
    for {
      id <- (item \ "id").asOpt[String]
      type_ <- (item \ "type").asOpt[String]
      name <- (item \ "name").asOpt[String]
      required <- (item \ "required").asOpt[String]
      hideLabel <- (item \ "hide_label").asOpt[String]
      label <- (item \ "label").asOpt[String]
      options <- (item \ "options").asOpt[JsArray]
    } yield {
      CalloutFormFieldRadio(id, type_, name, description, required == "1", hideLabel == "1", label, options)
    }
  }

  private def formFieldItemToCalloutFormFieldCheckbox(item: JsValue): Option[CalloutFormFieldCheckbox] = {
    val description = (item \ "description").asOpt[String]
    for {
      id <- (item \ "id").asOpt[String]
      type_ <- (item \ "type").asOpt[String]
      name <- (item \ "name").asOpt[String]
      required <- (item \ "required").asOpt[String]
      hideLabel <- (item \ "hide_label").asOpt[String]
      label <- (item \ "label").asOpt[String]
      options <- (item \ "options").asOpt[JsArray]
    } yield {
      CalloutFormFieldCheckbox(id, type_, name, description, required == "1", hideLabel == "1", label, options)
    }
  }

  private def formFieldItemToCalloutFormFieldSelect(item: JsValue): Option[CalloutFormFieldSelect] = {
    val description = (item \ "description").asOpt[String]
    for {
      id <- (item \ "id").asOpt[String]
      type_ <- (item \ "type").asOpt[String]
      name <- (item \ "name").asOpt[String]
      required <- (item \ "required").asOpt[String]
      hideLabel <- (item \ "hide_label").asOpt[String]
      label <- (item \ "label").asOpt[String]
      options <- (item \ "options").asOpt[JsArray]
    } yield {
      CalloutFormFieldSelect(id, type_, name, description, required == "1", hideLabel == "1", label, options)
    }
  }

  private def formFieldItemToCalloutFormField(item: JsValue): Option[CalloutFormField] = {
    (item \ "type").asOpt[String] match {
      case None             => None
      case Some("textarea") => formFieldItemToCalloutFormFieldBase(item)
      case Some("text")     => formFieldItemToCalloutFormFieldBase(item)
      case Some("file")     => formFieldItemToCalloutFormFieldBase(item)
      case Some("radio")    => formFieldItemToCalloutFormFieldRadio(item: JsValue)
      case Some("checkbox") => formFieldItemToCalloutFormFieldCheckbox(item: JsValue)
      case Some("select")   => formFieldItemToCalloutFormFieldSelect(item: JsValue)
      case _                => None
    }
  }

  private def campaignJsObjectToCalloutBlockElement(
      campaign: JsObject,
      calloutsUrl: Option[String],
  ): Option[CalloutBlockElement] = {
    for {
      id <- (campaign \ "id").asOpt[String]
      activeFrom <- (campaign \ "activeFrom").asOpt[Long]
      displayOnSensitive <- (campaign \ "displayOnSensitive").asOpt[Boolean]
      formId <- (campaign \ "fields" \ "formId").asOpt[Int]
      title <- (campaign \ "fields" \ "callout").asOpt[String]
      description <- (campaign \ "fields" \ "description").asOpt[String]
      tagName <- (campaign \ "fields" \ "tagName").asOpt[String]
      formFields1 <- (campaign \ "fields" \ "formFields").asOpt[JsArray]
    } yield {
      val formFields2 = formFields1.value
        .flatMap(formFieldItemToCalloutFormField(_))
        .toList
      CalloutBlockElement(
        id,
        calloutsUrl,
        activeFrom,
        displayOnSensitive,
        formId,
        title,
        description,
        tagName,
        formFields2,
      )
    }
  }

  def extractCallout(
      html: String,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): Option[CalloutBlockElement] = {
    val doc = Jsoup.parseBodyFragment(html)
    val tagName = doc.getElementsByTag("div").asScala.headOption.map(_.attr("data-callout-tagname"))
    for {
      name <- tagName
      cpgs <- campaigns
      campaign <- extractCampaignPerTagName(cpgs, name)
      element <- campaignJsObjectToCalloutBlockElement(campaign, calloutsUrl)
    } yield {
      element
    }
  }
}
