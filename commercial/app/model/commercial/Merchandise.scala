package model.commercial

import common.JsonComponent
import model.ImageElement
import model.commercial.events.LiveEventMembershipInfo
import model.commercial.events.Eventbrite._
import model.commercial.jobs.Industries
import views.support.Item300

import org.apache.commons.lang.{StringUtils, StringEscapeUtils}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.data.validation.ValidationError
import play.api.libs.json._
import play.api.libs.functional.syntax._
import scala.util.Try
import scala.util.control.NonFatal
import scala.xml.Node

sealed trait Merchandise

case class Book(title: String,
                author: Option[String],
                isbn: String,
                price: Option[Double] = None,
                offerPrice: Option[Double] = None,
                description: Option[String] = None,
                jacketUrl: Option[String],
                buyUrl: Option[String] = None,
                position: Option[Int] = None,
                category: Option[String] = None,
                keywordIdSuffixes: Seq[String] = Nil) extends Merchandise

case class Masterclass(id: String,
                       name: String,
                       startDate: DateTime,
                       url: String,
                       description: String,
                       status: String,
                       venue: EBVenue,
                       tickets: Seq[EBTicket],
                       capacity: Int,
                       guardianUrl: String,
                       firstParagraph: String,
                       keywordIdSuffixes: Seq[String],
                       mainPicture: Option[ImageElement]) extends Merchandise with EBTicketHandler with EBEventHandler {

  lazy val readableDate = DateTimeFormat.forPattern("d MMMMM yyyy").print(startDate)

  lazy val truncatedFirstParagraph = StringUtils.abbreviate(firstParagraph, 250)
}

case class LiveEvent(eventId: String,
                     name: String,
                     date: DateTime,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     imageUrl: String) extends Merchandise with EBTicketHandler with EBEventHandler

case class TravelOffer(id: String,
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
                       position: Int) extends Merchandise {

  val durationInWords: String = duration match {
    case Some(1) => "1 night"
    case Some(x) => s"$x nights"
    case None => ""
  }

  def formattedPrice : Option[String] = fromPrice map { price =>
    if (price % 1 == 0)
      f"£$price%,.0f"
    else
      f"£$price%,.2f"
  }
}

sealed trait Gender {
  override def toString: String
}
case object Woman extends Gender {
  override def toString = "Woman"
}
case object Man extends Gender {
  override def toString = "Man"
}

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String, location: String) extends Merchandise {

  val profileId: Option[String] = profilePhoto match {
    case Member.IdPattern(id) => Some(id)
    case _ => None
  }

  val profileUrl: String = profileId.map(id => s"https://soulmates.theguardian.com/landing/$id")
    .getOrElse("http://soulmates.theguardian.com/")

}

case class MemberPair(member1: Member, member2: Member) extends Merchandise

case class Job(id: Int,
               title: String,
               shortDescription: String,
               locationDescription: Option[String],
               recruiterName: String,
               recruiterPageUrl: Option[String],
               recruiterLogoUrl: String,
               sectorIds: Seq[Int],
               salaryDescription: String,
               keywordIdSuffixes: Seq[String] = Nil) extends Merchandise {

  val shortSalaryDescription = StringUtils.abbreviate(salaryDescription, 25).replace("...", "…")

  def listingUrl = s"http://jobs.theguardian.com/job/$id"

  val industries: Seq[String] =
    Industries.sectorIdIndustryMap.filter { case (sectorId, name) => sectorIds.contains(sectorId)}.values.toSeq

  val mainIndustry: Option[String] = industries.headOption
}

object Merchandise {
  val writes: Writes[Merchandise] = new Writes[Merchandise] {
    def writes(m: Merchandise) = m match {
      case b: Book => Json.toJson(b)
      case j: Job  => Json.toJson(j)
      case m: Masterclass => Json.toJson(m)
      case m: Member => Json.toJson(m)
      case p: MemberPair => Json.obj(
        "member1" -> Json.toJson(p.member1),
        "member2" -> Json.toJson(p.member2)
      )
      case t: TravelOffer => Json.toJson(t)
      case l: LiveEvent => Json.toJson(l)
    }
  }
}

object Book {

  private val authorReads = {
    ((JsPath \ "author_firstname").readNullable[String] and
      (JsPath \ "author_lastname").readNullable[String])
      .tupled.map { case (optFirstName, optLastName) =>
      for {
        firstName <- optFirstName
        lastName <- optLastName
      } yield s"$firstName $lastName"
    }
  }

  private def stringOrDoubleAsDouble(value: String): Reads[Option[Double]] = {
    val path = JsPath \ value
    path.readNullable[Double] orElse path.readNullable[String].map(_.map(_.toDouble))
  }

  implicit val bookReads: Reads[Book] = (
    (JsPath \ "name").read[String] and
      authorReads and
      (JsPath \ "isbn").read[String] and
      stringOrDoubleAsDouble("regular_price_with_tax") and
      stringOrDoubleAsDouble("final_price_with_tax") and
      (JsPath \ "description").readNullable[String] and
      (JsPath \ "images")(0).readNullable[String] and
      (JsPath \ "product_url").readNullable[String] and
      (JsPath \ "guardian_bestseller_rank").readNullable[String].map(_.map(_.toDouble.toInt)) and
      ((JsPath \ "categories")(0) \ "name").readNullable[String] and
      (JsPath \ "keywordIds").readNullable[Seq[String]].map(_ getOrElse Nil)
    )(Book.apply _)

  implicit val writesBook: Writes[Book] = Json.writes[Book]
}

object Masterclass {
  private val guardianUrlLinkText = "Full course and returns information on the Masterclasses website"

  def fromEvent(event: EBEvent): Option[Masterclass] = {

    val doc: Document = Jsoup.parse(event.description)

    def extractGuardianUrl: Option[String] = {
      val elements :Array[Element] = doc.select(s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)")
          .toArray(Array.empty[Element])

      elements.headOption match {
        case Some(e) => Some(e.attr("href"))
        case _ => None
      }
    }

    def extractFirstParagraph(html: String) = {
      val firstParagraph: Option[Element] = Some(doc.select("p").first())
      firstParagraph match {
        case Some(p) => p.text
        case _ => ""
      }
    }

    extractGuardianUrl map { extractedUrl =>

      new Masterclass(
        id = event.id,
        name = event.name,
        startDate = event.startDate,
        url = event.url,
        description = event.description,
        status = event.status,
        venue = event.venue,
        tickets = event.tickets,
        capacity = event.capacity,
        guardianUrl = extractedUrl,
        firstParagraph = extractFirstParagraph(event.description),
        keywordIdSuffixes = Nil,
        mainPicture = None
      )
    }
  }

  implicit val writesMasterclass: Writes[Masterclass] = new Writes[Masterclass] {
    def writes(m: Masterclass) = Json.obj(
      "id" -> m.id,
      "name" -> m.name,
      "startDate" -> m.startDate,
      "url" -> m.guardianUrl,
      "venue" -> m.venue,
      "tickets" -> m.tickets,
      "capacity" -> m.capacity,
      "pictureUrl" -> m.mainPicture.map(picture => Item300.bestFor(picture.images))
    )
  }
}

object TravelOffer {

  def fromXml(xml: Node): TravelOffer = {

    def text(nodeSelector: String): String = (xml \ nodeSelector).text.trim
    def tagText(group: String): Seq[String] = (xml \\ "tag").filter(hasGroupAttr(_, group)).map(_.text.trim)

    def parseInt(s: String) = Try(s.toInt).toOption

    def parseDouble(s: String) = try {
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
      countries = tagText("Country"),
      category = tagText("Holiday Type").headOption,
      tags = Nil,
      duration = parseInt(text("@duration")),
      position = -1
    )
  }

  implicit val writesTravelOffer: Writes[TravelOffer] = Json.writes[TravelOffer]
}


object Member {
  val IdPattern = """.*/([\da-f]+)/.*""".r

  implicit val readsGender: Reads[Gender] = JsPath.read[String].map (gender => if(gender == "Woman") Woman else Man)
  implicit val writesGender: Writes[Gender] = Writes[Gender](gender => JsString(gender.toString))

  implicit val readsMember: Reads[Member] =
    (
      (JsPath \ "username").read[String] and
        (JsPath \ "gender").read[Gender] and
        (JsPath \ "age").read[Int] and
        (JsPath \ "profile_photo").read[String] and
        (JsPath \ "location").read[String].map(locations => locations.split(",").head)
      ) (Member.apply _)

  implicit val writesMember: Writes[Member] = new Writes[Member] {
    def writes(member: Member): JsValue = {
      Json.obj(
        "username" -> member.username,
        "gender" -> member.gender,
        "age" -> member.age,
        "profile_photo" -> member.profilePhoto,
        "location" -> member.location,
        "profile_id" -> member.profileId,
        "profile_url" -> member.profileUrl
      )
    }
  }

  // based on play.api.libs.json.LowPriorityDefaultReads.traversableReads
  implicit val readsMembers: Reads[Seq[Member]] = new Reads[Seq[Member]] {
    override def reads(json: JsValue): JsResult[Seq[Member]] = {
      json match {
        case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[Member]))
        case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
      }
    }
  }
}

object Job {

  def apply(xml: Node): Job = Job(
    id = (xml \ "JobID").text.toInt,
    title = (xml \ "JobTitle").text,
    shortDescription = StringEscapeUtils.unescapeHtml((xml \ "ShortJobDescription").text),
    locationDescription = OptString((xml \ "LocationDescription").text),
    recruiterName = (xml \ "RecruiterName").text,
    recruiterPageUrl = OptString((xml \ "RecruiterPageUrl").text),
    recruiterLogoUrl = (xml \ "RecruiterLogoURL").text,
    sectorIds = (xml \ "Sectors" \ "Sector") map (_.text.toInt),
    salaryDescription = (xml \ "SalaryDescription").text
  )

  implicit val writesJob: Writes[Job] = new Writes[Job] {
      def writes(j: Job) = Json.obj(
          "id" -> j.id,
          "title" -> j.title,
          "listingUrl" -> j.listingUrl,
          "recruiterLogoUrl" -> j.recruiterLogoUrl,
          "recruiterName" -> j.recruiterName,
          "locationDescription" -> j.locationDescription,
          "shortSalaryDescription" -> j.shortSalaryDescription
        )
      }
}

object LiveEvent {

  def fromEvent(event: EBEvent, eventMembershipInformation: LiveEventMembershipInfo): LiveEvent =
    new LiveEvent(
      eventId = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = eventMembershipInformation.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      imageUrl = eventMembershipInformation.mainImageUrl
    )

  implicit val writesLiveEvent: Writes[LiveEvent] = Json.writes[LiveEvent]
}
