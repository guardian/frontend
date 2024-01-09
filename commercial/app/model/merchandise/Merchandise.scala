package commercial.model.merchandise

import commercial.model.OptString
import commercial.model.capi.{CapiImages, ImageInfo}
import model.ImageElement
import jobs.Industries
import org.apache.commons.lang.{StringEscapeUtils, StringUtils}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.json.JodaWrites._
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import views.support.Item300

import scala.util.Try
import scala.util.control.NonFatal
import scala.xml.Node
import scala.util.matching.Regex

sealed trait Merchandise

case class TravelOffer(
    id: String,
    title: String,
    offerUrl: String,
    imageUrl: String,
    fromPrice: Option[Double],
    earliestDeparture: DateTime,
    keywordIdSuffixes: Seq[String],
    countries: Seq[String],
    category: Option[String],
    tags: Seq[String],
    duration: Option[Int],
    position: Int,
) extends Merchandise {

  val durationInWords: String = duration map {
    case 1        => "1 night"
    case multiple => s"$multiple nights"
  } getOrElse ""

  def formattedPrice: Option[String] =
    fromPrice map { price =>
      if (price % 1 == 0)
        f"£$price%,.0f"
      else
        f"£$price%,.2f"
    }
}

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String, location: String)
    extends Merchandise {

  val profileId: Option[String] = profilePhoto match {
    case Member.IdPattern(id) => Some(id)
    case _                    => None
  }

  val profileUrl: String = s"https://soulmates.theguardian.com/${profileId.map(id => s"landing/$id") getOrElse ""}"
}

case class MemberPair(member1: Member, member2: Member) extends Merchandise

case class Job(
    id: Int,
    title: String,
    shortDescription: String,
    locationDescription: Option[String],
    recruiterName: String,
    recruiterPageUrl: Option[String],
    recruiterLogoUrl: String,
    sectorIds: Seq[Int],
    salaryDescription: String,
    keywordIdSuffixes: Seq[String] = Nil,
) extends Merchandise {

  val shortSalaryDescription: String = StringUtils.abbreviate(salaryDescription, 25).replace("...", "…")

  def listingUrl: String = s"https://jobs.theguardian.com/job/$id"

  val industries: Seq[String] =
    Industries.sectorIdIndustryMap.filter { case (sectorId, name) => sectorIds.contains(sectorId) }.values.toSeq

  val mainIndustry: Option[String] = industries.headOption
}

sealed trait Gender {
  val name: String
}

object Gender {

  def fromName(name: String): Gender =
    name match {
      case Woman.name => Woman
      case _          => Man
    }
}

case object Woman extends Gender {
  val name: String = "Woman"
}

case object Man extends Gender {
  val name: String = "Man"
}

object Merchandise {

  val merchandiseWrites: Writes[Merchandise] = new Writes[Merchandise] {
    def writes(m: Merchandise) =
      m match {
        case j: Job    => Json.toJson(j)
        case m: Member => Json.toJson(m)
        case p: MemberPair =>
          Json.obj(
            "member1" -> Json.toJson(p.member1),
            "member2" -> Json.toJson(p.member2),
          )
        case t: TravelOffer => Json.toJson(t)
      }
  }
}

object TravelOffer {

  def fromXml(xml: Node): TravelOffer = {

    def text(nodeSelector: String): String = (xml \ nodeSelector).text.trim
    def tagText(group: String): Seq[String] = (xml \\ "tag").filter(hasGroupAttr(_, group)).map(_.text.trim)

    def parseInt(s: String) = Try(s.toInt).toOption

    def parseDouble(s: String) =
      try {
        Some(s.toDouble)
      } catch {
        case NonFatal(_) => None
      }

    def hasGroupAttr(elem: Node, value: String) = elem.attribute("group") exists (_.text == value)

    TravelOffer(
      id = text("@vibeid"),
      title = text("name"),
      offerUrl = text("url"),
      imageUrl = text("image"),
      fromPrice = parseDouble(text("@fromprice")),
      earliestDeparture = DateTime.parse(text("@earliestdeparture")),
      keywordIdSuffixes = Nil,
      countries = tagText("Country").distinct,
      category = tagText("Holiday Type").headOption,
      tags = Nil,
      duration = parseInt(text("@duration")),
      position = -1,
    )
  }

  implicit val travelOfferWrites: Writes[TravelOffer] = Json.writes[TravelOffer]
}

object Member {
  val IdPattern: Regex = """.*/([\da-f]+)/.*""".r

  implicit val genderReads: Reads[Gender] = JsPath.read[String].map(Gender.fromName)
  implicit val genderWrites: Writes[Gender] = Writes[Gender](gender => JsString(gender.name))

  implicit val memberReads: Reads[Member] =
    (
      (JsPath \ "username").read[String] and
        (JsPath \ "gender").read[Gender] and
        (JsPath \ "age").read[Int] and
        (JsPath \ "profile_photo").read[String] and
        (JsPath \ "location").read[String].map(locations => locations.split(",").head)
    )(Member.apply _)

  implicit val memberWrites: Writes[Member] = new Writes[Member] {

    def writes(member: Member): JsValue = {
      Json.obj(
        "username" -> member.username,
        "gender" -> member.gender,
        "age" -> member.age,
        "profile_photo" -> member.profilePhoto,
        "location" -> member.location,
        "profile_id" -> member.profileId,
        "profile_url" -> member.profileUrl,
      )
    }
  }
}

object Job {

  def fromXml(xml: Node): Job =
    Job(
      id = (xml \ "JobID").text.toInt,
      title = (xml \ "JobTitle").text,
      shortDescription = StringEscapeUtils.unescapeHtml((xml \ "ShortJobDescription").text),
      locationDescription = OptString((xml \ "LocationDescription").text),
      recruiterName = (xml \ "RecruiterName").text,
      recruiterPageUrl = OptString((xml \ "RecruiterPageUrl").text),
      recruiterLogoUrl = (xml \ "RecruiterLogoURL").text,
      sectorIds = (xml \ "Sectors" \ "Sector") map (_.text.toInt),
      salaryDescription = (xml \ "SalaryDescription").text,
    )

  implicit val jobWrites: Writes[Job] = new Writes[Job] {
    def writes(j: Job) =
      Json.obj(
        "id" -> j.id,
        "title" -> j.title,
        "listingUrl" -> j.listingUrl,
        "recruiterLogoUrl" -> j.recruiterLogoUrl,
        "recruiterName" -> j.recruiterName,
        "locationDescription" -> j.locationDescription,
        "shortSalaryDescription" -> j.shortSalaryDescription,
      )
  }
}
