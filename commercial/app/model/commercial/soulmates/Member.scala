package model.commercial.soulmates

import play.api.data.validation.ValidationError
import play.api.libs.functional.syntax._
import play.api.libs.json._

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String, location: String) {

  val profileId: Option[String] = profilePhoto match {
    case Member.IdPattern(id) => Some(id)
    case _ => None
  }

  val profileUrl: String = profileId.map(id => s"https://soulmates.theguardian.com/landing/$id")
    .getOrElse("http://soulmates.theguardian.com/")

}

object Member {
  val IdPattern = """.*/([\da-f]+)/.*""".r

  implicit val readsGender: Reads[Gender] = JsPath.read[String].map (gender => if(gender == "Woman") Woman else Man)

  implicit val readsMember: Reads[Member] =
    (
      (JsPath \ "username").read[String] and
        (JsPath \ "gender").read[Gender] and
        (JsPath \ "age").read[Int] and
        (JsPath \ "profile_photo").read[String] and
        (JsPath \ "location").read[String].map(locations => locations.split(",").head)
      ) (Member.apply _)

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


sealed case class Gender(name: String) {
  override def toString = name
}

object Woman extends Gender("Woman")

object Man extends Gender("Man")
