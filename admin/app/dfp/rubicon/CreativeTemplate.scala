package dfp.rubicon

import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import conf.Configuration
import play.api.libs.json.{JsValue, Json}

object CreativeTemplate extends Logging with implicits.Collections {

  private val ukOrder = 171545367
  private val ukMobileOrder = 170179047
  private val rowOrder = 171110367
  private val rowMobileOrder = 172731927

  def generate(): JsValue = {
    val params = findParameters()
    Json.parse(
      Skeleton()
      .replace("{rp_site_choices}", Json.stringify(params("rp_site")))
      .replace("{rp_zone_choices}", Json.stringify(params("rp_zone")))
      .replace("{rp_size_choices}", Json.stringify(params("rp_size")))
    )
  }

  private[rubicon] def relabel(params: Seq[(String, String)]): Seq[(String, String)] = {
    val (unique, duplicate) = params.groupBy {
      case (label, _) => label
    }.partition {
      case (_, labelParams) => labelParams.size == 1
    }

    val relabelledDuplicates = duplicate.flatMap {
      case (label, labelParams) =>
        val tail = labelParams.tail.zipWithIndex.map {
          case ((lbl, value), index) => s"$lbl.${index + 1}" -> value
        }
        labelParams.head +: tail
    }.toSeq

    (unique.values.flatten ++ relabelledDuplicates).toSeq.sortBy {
      case (_, value) => value
    }
  }

  private def findParameters(): Map[String, JsValue] = {

    def findParameters(
      creatives: Seq[ThirdPartyCreative],
      getLabel: ThirdPartyCreative => Option[String],
      getValue: ThirdPartyCreative => Option[String]
    ): JsValue = {

      val labelValuePairs = for {
        creative <- creatives
        label <- getLabel(creative)
        value <- getValue(creative)
      } yield label -> value

      val dedupedLabels = labelValuePairs.distinctBy { case (_, value) => value }

      Json.toJson(
        relabel(dedupedLabels).map {
          case (label, value) => Map("label" -> label, "value" -> value)
        }
      )
    }

    def siteLabel(creative: ThirdPartyCreative): Option[String] = {
      value(creative, "Site:\\s+(.+?)\\s+Zone:".r.unanchored)
    }

    def zoneLabel(creative: ThirdPartyCreative): Option[String] = {
      value(creative, "Zone:\\s+(.+?)\\s+Size:".r.unanchored)
    }

    def sizeLabel(creative: ThirdPartyCreative): Option[String] = {
      value(creative, "Size:\\s+(.+?)\\s+\\-".r.unanchored)
    }

    val creatives = creativesForAllOrders
    Map(
      "rp_site" -> findParameters(creatives, siteLabel, siteValue),
      "rp_zone" -> findParameters(creatives, zoneLabel, zoneValue),
      "rp_size" -> findParameters(creatives, sizeLabel, sizeValue)
    )
  }

  private def creativesForAllOrders: Seq[ThirdPartyCreative] = {
    Seq(ukOrder, ukMobileOrder, rowOrder, rowMobileOrder) flatMap {
      creativesByOrder(Configuration.commercial.dfpAccountId, _)
    }
  }
}


object Skeleton {

  def apply(): String =
    """{
      |    "name": "Rubicon Tag",
      |    "description": "",
      |    "variables": [
      |        {
      |            "choices": {rp_site_choices},
      |            "allowOtherChoice": false,
      |            "label": "rp_site",
      |            "uniqueName": "rp_site",
      |            "isRequired": true,
      |            "variableType": "LIST"
      |        },
      |        {
      |            "choices": {rp_zone_choices},
      |            "allowOtherChoice": false,
      |            "label": "rp_zone",
      |            "uniqueName": "rp_zone",
      |            "isRequired": true,
      |            "variableType": "LIST"
      |        },
      |        {
      |            "choices": {rp_size_choices},
      |            "allowOtherChoice": false,
      |            "label": "rp_size",
      |            "uniqueName": "rp_size",
      |            "isRequired": true,
      |            "variableType": "LIST"
      |        }
      |    ],
      |    "formatter": "\u003c!--  Begin Rubicon Project Tag --\u003e\n\u003cscript type\u003d\"text/javascript\"\u003e\nrp_account \u003d \u00277845\u0027;\nrp_site \u003d \u0027[%rp_site%]\u0027;\nrp_zonesize \u003d \u0027[%rp_zone%]-[%rp_size%]\u0027;\nrp_adtype \u003d \u0027js\u0027;\nrp_smartfile \u003d \u0027[SMART FILE URL]\u0027;\nrp_kw \u003d \u0027[INSERT KEYWORD HERE]\u0027;\n\u003c/script\u003e\n\u003cscript type\u003d\"text/javascript\" src\u003d\"https://ads.rubiconproject.com/ad/7845.js\"\u003e\u003c/script\u003e\n\u003c!--  End Rubicon Project Tag --\u003e\n",
      |    "type": "USER_DEFINED",
      |    "isInterstitial": false,
      |    "isNativeEligible": false,
      |    "isSafeFrameCompatible": false
      |}""".stripMargin
}
