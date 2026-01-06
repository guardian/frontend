package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.CalloutElementFields
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsArray, JsValue, Json}

class CalloutExtractionTest extends AnyFlatSpec with Matchers {
  "CalloutExtraction isCallout" should "return true when data-callout-tagname attribute exists in html and has value" in {
    val result = CalloutExtraction.isCallout("<div data-callout-tagname='someValue'>some stuff</div>")
    result should equal(true)
  }

  "CalloutExtraction isCallout" should "return false when data-callout-tagname attribute exists in html but doesn't have any value" in {
    val result = CalloutExtraction.isCallout("<div data-callout-tagname>some stuff</div>")
    result should equal(false)
  }

  it should "return false when data-callout-tagname attribute doesn't exist in html" in {
    val result = CalloutExtraction.isCallout("<div some-data='someValue'>some stuff</div>")
    result should equal(false)
  }

  "extractCampaignByCampaignId" should "return successfully given the callout campaign exist in the campaign list" in {
    val capiCallout = CalloutElementFields(Some("b06a08e0-ca5f-410c-a28b-95e7d7ca37b7"), Some(false))

    val result = CalloutExtraction.extractCalloutByCampaignId(
      capiCallout,
      existingCampaigns,
      Some("http://test.com"),
    )

    result.isDefined should be(true)
    result.map { callout =>
      callout should equal(expectedCalloutBlockElementV2)
    }
  }

  it should "return None given the relevant callout campaign doesn't exist in the campaign list" in {
    val capiCallout = CalloutElementFields(Some("some-random-id"), Some(false))

    val result = CalloutExtraction.extractCalloutByCampaignId(
      capiCallout,
      existingCampaigns,
      Some("http://test.com"),
    )

    result.isDefined should be(false)
  }

  def existingCampaigns: Option[JsValue] = {

    Some(
      Json.parse(
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
        "description": "<p>If you have been affected</p>",
        "contacts": [
        {
        "name": "whatsapp",
         "value": "+4488739383",
        "urlPrefix": "http://whatsapp.com",
        "guidance": "this is the guidance"
        },
        {
        "name": "signal",
         "value": "+4488736683",
        "urlPrefix": "http://signal.com",
        "guidance": "this is the guidance"

        }
        ],
        "formFields": [
          {
            "name": "share_your_experiences_here",
            "description": "Please include as much detail as possible",
            "hide_label": "0",
            "label": "Share your experiences here",
            "id": "87320974",
            "type": "textarea",
            "hidden": "1",
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
            "hidden": "0",
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
              }
            ],
            "hide_label": "0",
            "label": "Can we publish your response?",
            "id": "87320977",
            "type": "radio",
            "required": "1"
          }
        ],
        "tagName": "callout-coronavirus"
      }
    }
  ]
       """,
      ),
    )

  }

  def expectedCalloutBlockElementV2 = {
    CalloutBlockElementV2(
      "b06a08e0-ca5f-410c-a28b-95e7d7ca37b7",
      Some("http://test.com"),
      1579651200000L,
      None,
      false,
      3730905,
      "Share your experience",
      "Share your stories",
      "<p>If you have been affected</p>",
      "callout-coronavirus",
      expectedRadioFields,
      false,
      Some(
        List(
          Contact("whatsapp", "+4488739383", "http://whatsapp.com", Some("this is the guidance")),
          Contact("signal", "+4488736683", "http://signal.com", Some("this is the guidance")),
        ),
      ),
      CommunityCallout,
    )
  }

  def expectedRadioOptions =
    JsArray.apply(
      Seq(
        Json.parse("""
        {
                  "label": "Yes, entirely",
                  "value": "Yes, entirely"
                }
        """),
        Json.parse("""
        {
                  "label": "Yes, but please keep me anonymous",
                  "value": "Yes, but please keep me anonymous"
                }
        """),
      ),
    )

  def expectedRadioFields: List[CalloutFormField] =
    List(
      CalloutFormFieldBase(
        "87320974",
        "textarea",
        "share_your_experiences_here",
        Some("Please include as much detail as possible"),
        true,
        false,
        true,
        "Share your experiences here",
      ),
      CalloutFormFieldBase(
        "87320975",
        "text",
        "name",
        Some("You do not need to use your full name"),
        true,
        false,
        false,
        "Name",
      ),
      CalloutFormFieldRadio(
        "87320977",
        "radio",
        "can_we_publish_your_response",
        None,
        true,
        false,
        false,
        "Can we publish your response?",
        expectedRadioOptions,
      ),
    )

}
