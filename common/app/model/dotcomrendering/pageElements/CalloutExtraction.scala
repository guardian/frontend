package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.CalloutElementFields
import org.jsoup.Jsoup
import play.api.libs.json._

import scala.jdk.CollectionConverters._

sealed trait CalloutFormField
case class CalloutFormFieldBase(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    hidden: Boolean,
    label: String,
) extends CalloutFormField
case class CalloutFormFieldRadio(
    id: String,
    `type`: String,
    name: String,
    description: Option[String],
    required: Boolean,
    hideLabel: Boolean,
    hidden: Boolean,
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
    hidden: Boolean,
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
    hidden: Boolean,
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

case class Contact(name: String, value: String, urlPrefix: String, guidance: Option[String])

object Contact {
  implicit val ContactWrites: Writes[Contact] = Json.writes[Contact]
  implicit val ContactReads: Reads[Contact] = Json.reads[Contact]
}

object CalloutExtraction {
  private def extractCampaignPerTagName(campaigns: JsValue, tagName: String): Option[JsObject] = {
    val campaigns2 = campaigns.asInstanceOf[JsArray].value
    campaigns2
      .filter(c => (c \ "fields" \ "tagName").asOpt[String].getOrElse("") == tagName)
      .map(_.asInstanceOf[JsObject])
      .headOption
  }

  private def extractCampaignByCampaignId(campaignId: Option[String], campaigns: JsValue): Option[JsObject] = {
    val campaigns2 = campaigns.asInstanceOf[JsArray].value
    campaigns2.filter(c => (c \ "id").asOpt[String] == campaignId).map(_.asInstanceOf[JsObject]).headOption
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
      val hidden = (item \ "hidden").asOpt[String].getOrElse("0")
      CalloutFormFieldBase(id, type_, name, description, required == "1", hideLabel == "1", hidden == "1", label)
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
      val hidden = (item \ "hidden").asOpt[String].getOrElse("0")
      CalloutFormFieldRadio(
        id,
        type_,
        name,
        description,
        required == "1",
        hideLabel == "1",
        hidden == "1",
        label,
        options,
      )
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
      val hidden = (item \ "hidden").asOpt[String].getOrElse("0")
      CalloutFormFieldCheckbox(
        id,
        type_,
        name,
        description,
        required == "1",
        hideLabel == "1",
        hidden == "1",
        label,
        options,
      )
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
      val hidden = (item \ "hidden").asOpt[String].getOrElse("0")
      CalloutFormFieldSelect(
        id,
        type_,
        name,
        description,
        required == "1",
        hideLabel == "1",
        hidden == "1",
        label,
        options,
      )
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
      case Some("email")    => formFieldItemToCalloutFormFieldBase(item)
      case Some("phone")    => formFieldItemToCalloutFormFieldBase(item)
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
        .flatMap(formFieldItemToCalloutFormField)
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

  private sealed trait CalloutType {
    def name: String
  }
  private case object CommunityCallout extends CalloutType {
    val name = "community"
  }
  private case object ReporterCallout extends CalloutType {
    val name = "reporter"
  }
  private case object UnsupportedCallout extends CalloutType {
    val name = "unsupported"
  }

  private case class BaseCalloutFields(
      id: String,
      activeFrom: Option[Long],
      activeUntil: Option[Long],
      displayOnSensitive: Boolean,
      calloutType: CalloutType,
  )

  private def extractBaseCalloutFields(
      campaign: JsObject,
  ): Option[BaseCalloutFields] = {
    for {
      id <- (campaign \ "id").asOpt[String]
      displayOnSensitive <- (campaign \ "displayOnSensitive").asOpt[Boolean]
      campaignType <- (campaign \ "fields" \ "_type").asOpt[String]
    } yield {

      val calloutType = campaignType match {
        case "callout"          => CommunityCallout
        case "reporter-callout" => ReporterCallout
        case _                  => UnsupportedCallout
      }
      BaseCalloutFields(
        id,
        (campaign \ "activeFrom").asOpt[Long],
        (campaign \ "activeUntil").asOpt[Long],
        displayOnSensitive,
        calloutType,
      )
    }
  }

  private def campaignJsObjectToReporterCalloutBlockElement(
      campaign: JsObject,
      baseCalloutFields: BaseCalloutFields,
  ): Option[ReporterCalloutBlockElement] = {
    for {
      title <- (campaign \ "fields" \ "title").asOpt[String]
      subtitle <- (campaign \ "fields" \ "subtitle").asOpt[String]
      intro <- (campaign \ "fields" \ "intro").asOpt[String]
      mainTextHeading <- (campaign \ "fields" \ "mainTextHeading").asOpt[String]
      mainText <- (campaign \ "fields" \ "mainText").asOpt[String]
    } yield {
      val emailContact = (campaign \ "fields" \ "emailContact").asOpt[String]
      val messagingContact = (campaign \ "fields" \ "messagingContact").asOpt[String]
      val securedropContact = (campaign \ "fields" \ "securedropContact").asOpt[String]
      val endNote = (campaign \ "fields" \ "endNote").asOpt[String]

      ReporterCalloutBlockElement(
        baseCalloutFields.id,
        baseCalloutFields.activeFrom,
        baseCalloutFields.activeUntil,
        baseCalloutFields.displayOnSensitive,
        title,
        subtitle,
        intro,
        mainTextHeading,
        mainText,
        emailContact,
        messagingContact,
        securedropContact,
        endNote,
      )
    }
  }

  private def campaignJsObjectToCalloutBlockElementV2(
      campaign: JsObject,
      callout: CalloutElementFields,
      calloutsUrl: Option[String],
      baseCalloutFields: BaseCalloutFields,
  ): Option[CalloutBlockElementV2] = {
    for {
      formId <- (campaign \ "fields" \ "formId").asOpt[Int]
      prompt <- callout.overridePrompt.orElse(Some("Share your experience"))
      title <- callout.overrideTitle.orElse((campaign \ "fields" \ "callout").asOpt[String])
      description <- callout.overrideDescription.orElse((campaign \ "fields" \ "description").asOpt[String])
      tagName <- (campaign \ "fields" \ "tagName").asOpt[String]
      formFields1 <- (campaign \ "fields" \ "formFields").asOpt[JsArray]
      activeFrom <- baseCalloutFields.activeFrom
    } yield {
      val contacts = (campaign \ "fields" \ "contacts").asOpt[Seq[Contact]]
      val formFields2 = formFields1.value
        .flatMap(formFieldItemToCalloutFormField)
        .toList
      CalloutBlockElementV2(
        baseCalloutFields.id,
        calloutsUrl,
        activeFrom,
        baseCalloutFields.activeUntil,
        baseCalloutFields.displayOnSensitive,
        formId,
        prompt,
        title,
        description,
        tagName,
        formFields2,
        callout.isNonCollapsible.getOrElse(false),
        contacts,
      )
    }
  }

  def isCallout(html: String): Boolean = {
    val doc = Jsoup.parseBodyFragment(html)
    val maybeCalloutAttr =
      doc.getElementsByTag("div").asScala.headOption.map(_.attr("data-callout-tagname")).filter(_.trim.nonEmpty)

    maybeCalloutAttr match {
      case Some(_) => true
      case None    => false
    }
  }

  def extractCallout(
      html: String,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): Option[CalloutBlockElement] = {

    val campaignsX1: JsValue = Json.parse(
      """
  [
    {
      "id": "b06a08e0-ca5f-410c-a28b-95e7d7ca37b7",
      "name": "CALLOUT: Coronavirus",
      "rules": [

      ],
      "priority": 0,
      "activeFrom": 1579651200000,
      "displayOnSensitive": false,
      "fields": {
        "formId": 3730905,
        "callout": "Share your stories",
        "_type": "callout",
        "description": "<p>If you have been affected or have any information, we'd like to hear from you. You can get in touch by filling in the form below, anonymously if you \nwish or contact us&nbsp;<a href=\"https://www.theguardian.com/info/2015/aug/12/whatsapp-sharing-stories-with-the-guardian\">via WhatsApp</a>&nbsp;by&nbsp;<a href=\"https://api.whatsapp.com/send?phone=447867825056\">clicking here&nbsp;</a>or adding the contact +44(0)7867825056. Only the Guardian can see your contributions and one of our \njournalists may contact you to discuss further.&nbsp;<br></p>",
        "formFields": [
          {
            "name": "share_your_experiences_here",
            "description": "Please include as much detail as possible ",
            "hide_label": "0",
            "label": "Share your experiences here",
            "id": "87320974",
            "type": "textarea",
            "required": "1"
          },
          {
            "text_size": 50,
            "name": "name",
            "description": "You do not need to use your full name",
            "hide_label": "0",
            "label": "Name",
            "id": "87320975",
            "type": "text",
            "required": "1"
          },
          {
            "text_size": 50,
            "name": "where_do_you_live",
            "description": "Town or area is fine",
            "hide_label": "0",
            "label": "Where do you live?",
            "id": "87320976",
            "type": "text",
            "required": "1"
          },
          {
            "name": "can_we_publish_your_response",
            "options": [
              {
                "label": "Yes, entirely",
                "value": "Yes, entirely"
              },
              {
                "label": "Yes, but please keep me anonymous",
                "value": "Yes, but please keep me anonymous"
              },
              {
                "label": "Yes, but please contact me first",
                "value": "Yes, but please contact me first"
              },
              {
                "label": "No, this is information only",
                "value": "No, this is information only"
              }
            ],
            "hide_label": "0",
            "label": "Can we publish your response?",
            "id": "87320977",
            "type": "radio",
            "required": "1"
          },
          {
            "text_size": 50,
            "name": "email_address_",
            "description": "Your contact details are helpful so we can contact you for more information. They will only be seen by the Guardian.",
            "hide_label": "0",
            "label": "Email address ",
            "id": "87320978",
            "type": "text",
            "required": "1"
          },
          {
            "text_size": 50,
            "name": "phone_number",
            "description": "Your contact details are helpful so we can contact you for more information. They will only be seen by the Guardian.",
            "hide_label": "0",
            "label": "Phone number",
            "id": "87320979",
            "type": "text",
            "required": "0"
          },
          {
            "name": "you_can_add_any_extra_information_here",
            "hide_label": "0",
            "label": "You can add any extra information here",
            "id": "87320980",
            "type": "textarea",
            "required": "0"
          }
        ],
        "tagName": "callout-coronavirus"
      }
    }
  ]
       """,
    )

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

  def extractCalloutByCampaignId(
      callout: CalloutElementFields,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): Option[PageElement] = {
    for {
      cpgs <- campaigns
      campaign <- extractCampaignByCampaignId(callout.campaignId, cpgs)
      baseCalloutFields <- extractBaseCalloutFields(campaign)
      element <-
        if (baseCalloutFields.calloutType == ReporterCallout) {
          campaignJsObjectToReporterCalloutBlockElement(campaign, baseCalloutFields)
        } else if (baseCalloutFields.calloutType == CommunityCallout) {
          campaignJsObjectToCalloutBlockElementV2(campaign, callout, calloutsUrl, baseCalloutFields)
        } else None

    } yield {
      element
    }
  }
}
