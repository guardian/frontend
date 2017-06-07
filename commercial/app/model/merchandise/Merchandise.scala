package commercial.model.merchandise

import commercial.model.OptString
import commercial.model.capi.{CapiImages, ImageInfo}
import model.ImageElement
import events.Eventbrite._
import events.LiveEventMembershipInfo
import jobs.Industries
import org.apache.commons.lang.{StringEscapeUtils, StringUtils}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import views.support.Item300

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
                       venue: Venue,
                       tickets: Seq[Ticket],
                       capacity: Int,
                       guardianUrl: String,
                       keywordIdSuffixes: Seq[String],
                       mainPicture: Option[ImageElement]) extends Merchandise with TicketHandler with EventHandler {

  lazy val readableDate: String = DateTimeFormat.forPattern("d MMMMM yyyy").print(startDate)
}

case class LiveEvent(eventId: String,
                     name: String,
                     date: DateTime,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: Venue,
                     tickets: Seq[Ticket],
                     image: ImageInfo) extends Merchandise with TicketHandler with EventHandler

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

  val durationInWords: String = duration map {
    case 1 => "1 night"
    case multiple => s"$multiple nights"
  } getOrElse ""

  def formattedPrice : Option[String] = fromPrice map { price =>
    if (price % 1 == 0)
      f"£$price%,.0f"
    else
      f"£$price%,.2f"
  }
}

case class Member(username: String,
                  gender: Gender,
                  age: Int,
                  profilePhoto: String,
                  location: String) extends Merchandise {

  val profileId: Option[String] = profilePhoto match {
    case Member.IdPattern(id) => Some(id)
    case _ => None
  }

  val profileUrl: String = s"https://soulmates.theguardian.com/${profileId.map(id => s"landing/$id") getOrElse "" }"
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

sealed trait Gender {
  val name: String
}

object Gender {

  def fromName(name: String) = name match {
    case Woman.name => Woman
    case _ => Man
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

  private val authorReads = (
    (JsPath \ "author_firstname").readNullable[String] and
    (JsPath \ "author_lastname").readNullable[String]).tupled.map {
    case (optFirstName, optLastName) =>
      for {
        firstName <- optFirstName
        lastName <- optLastName
      } yield s"$firstName $lastName"
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

  implicit val bookWrites: Writes[Book] = Json.writes[Book]
}

object Masterclass {

  def fromEvent(event: Event): Option[Masterclass] = {

    def extractGuardianUrl: Option[String] = {
      val guardianUrlLinkText: String = "Full course and returns information on the Masterclasses website"

      val doc: Document = Jsoup.parse(event.description)

      val elements :Array[Element] = doc.select(s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)")
          .toArray(Array.empty[Element])

      elements.headOption match {
        case Some(e) => Some(e.attr("href"))
        case _ => None
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
        keywordIdSuffixes = Nil,
        mainPicture = None
      )
    }
  }

  implicit val masterclassWrites: Writes[Masterclass] = new Writes[Masterclass] {

    def writes(m: Masterclass) = Json.obj(
      "id" -> m.id,
      "name" -> m.name,
      "startDate" -> m.readableDate,
      "url" -> m.guardianUrl,
      "venue" -> m.venue,
      "ticketPrice" -> m.tickets.headOption.map(_.price),
      "capacity" -> m.capacity,
      "pictureUrl" -> m.mainPicture.map(picture => Item300.bestFor(picture.images)),
      "ratioTicketsLeft" -> m.ratioTicketsLeft
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
      countries = tagText("Country").distinct,
      category = tagText("Holiday Type").headOption,
      tags = Nil,
      duration = parseInt(text("@duration")),
      position = -1
    )
  }

  implicit val travelOfferWrites: Writes[TravelOffer] = Json.writes[TravelOffer]
}


object Member {
  val IdPattern = """.*/([\da-f]+)/.*""".r

  implicit val genderReads: Reads[Gender] = JsPath.read[String].map (Gender.fromName)
  implicit val genderWrites: Writes[Gender] = Writes[Gender](gender => JsString(gender.name))

  implicit val memberReads: Reads[Member] =
    (
      (JsPath \ "username").read[String] and
        (JsPath \ "gender").read[Gender] and
        (JsPath \ "age").read[Int] and
        (JsPath \ "profile_photo").read[String] and
        (JsPath \ "location").read[String].map(locations => locations.split(",").head)
      ) (Member.apply _)

  implicit val memberWrites: Writes[Member] = new Writes[Member] {

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
}

object Job {

  def fromXml(xml: Node): Job = Job(
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

  implicit val jobWrites: Writes[Job] = new Writes[Job] {
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

  def fromEvent(event: Event, eventMembershipInformation: LiveEventMembershipInfo): LiveEvent =
    new LiveEvent(
      eventId = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = eventMembershipInformation.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      image = CapiImages.buildImageDataFromUrl(eventMembershipInformation.mainImageUrl)
    )

  implicit val liveEventWrites: Writes[LiveEvent] = Json.writes[LiveEvent]
}
