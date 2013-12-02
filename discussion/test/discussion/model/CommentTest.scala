package discussion.model

import org.scalatest.{ShouldMatchers, FreeSpec}
import play.api.libs.json._

class CommentTest extends FreeSpec with ShouldMatchers {


  "A comment with Json" in {
    val json: JsValue = Json.parse(aCommentJson)
    val aComment = Comment.apply(json)

    aComment.body should include("<p>Morning,</p><p>In")
    aComment.id should be(12495317)
    aComment.profile.userId should be("4505957")
    aComment.responseCount should be(1)
    //    aComment.responses.head.id should be(27475612) . Will implement this soon - Ikenna
  }

  val aCommentJson: String =
    """
      |
      |{
      | "id": 12495317,
      | "body": "<p>Morning,</p><p>In our meeting we discussed:</p><p><br>Greece</p><p>Michael Gove emails</p><p>Amelia Hill and the offical secrets act</p><p>The Philip Gould interview in G2 today - <a href=\"http://www.guardian.co.uk/politics/2011/sep/20/philip-gould-cancer\" rel=\"nofollow\">http://www.guardian.co.uk/politics/2011/sep/20/philip-gould-cancer</a></p><p>The change in leadership at Al Jazeera</p><p>The assassination in Afghanistan of Rabbani - <a href=\"http://www.bbc.co.uk/news/world-south-asia-14998478\" rel=\"nofollow\">http://www.bbc.co.uk/news/world-south-asia-14998478</a></p><p>Nick Clegg speech</p><p>Palestinian developments - <a href=\"http://www.guardian.co.uk/world/2011/sep/21/palestinian-statehood-plan-un-showdown\" rel=\"nofollow\">http://www.guardian.co.uk/world/2011/sep/21/palestinian-statehood-plan-un-showdown</a></p>",
      | "date": "21 September 2011 10:21am",
      | "isoDateTime": "2011-09-21T09:21:04Z",
      | "status": "visible",
      | "webUrl": "http://discussion.code.dev-theguardian.com/comment-permalink/12495317",
      | "apiUrl": "http://discussion.code.dev-guardianapis.com/discussion-api/comment/12495317",
      | "numResponses": 1,
      | "numRecommends": 0,
      | "isHighlighted": false,
      | "userProfile": {
      |   "userId": "4505957",
      |   "displayName": "IsabellaMackie",
      |   "webUrl": "http://www.code.dev-theguardian.com/discussion/user/id/4505957",
      |   "apiUrl": "http://discussion.code.dev-guardianapis.com/discussion-api/profile/4505957",
      |   "avatar": "http://static.guimcode.co.uk/sys-images/discussion/avatars/2011/03/21/IsabellaMackie/ba1d7847-4140-4ffd-833d-82ce63163f1f/60x60.png",
      |   "secureAvatarUrl": "https://static-secure.guimcode.co.uk/sys-images/discussion/avatars/2011/03/21/IsabellaMackie/ba1d7847-4140-4ffd-833d-82ce63163f1f/60x60.png",
      |   "badge": [
      |     {"name": "Staff"}
      |   ]
      | },
      |"responses": [
      | {
      |   "id": 27475612,
      |   "body": "<p>Here is a reply.</p>",
      |   "date": "29 November 2013 2:09pm",
      |   "isoDateTime": "2013-11-29T14:09:22Z",
      |   "status": "visible",
      |   "webUrl": "http://discussion.code.dev-theguardian.com/comment-permalink/27475612",
      |   "apiUrl": "http://discussion.code.dev-guardianapis.com/discussion-api/comment/27475612",
      |   "numRecommends": 0,
      |   "isHighlighted": false,
      |   "responseTo": {
      |     "displayName": "chrisfinchdev",
      |     "commentApiUrl": "http://discussion.code.dev-guardianapis.com/discussion-api/comment/27475610",
      |     "isoDateTime": "2013-11-29T13:59:38Z",
      |     "date": "29 November 2013 1:59pm",
      |     "commentId": "27475610",
      |     "commentWebUrl": "http://discussion.code.dev-theguardian.com/comment-permalink/27475610"
      |   },
      |   "userProfile": {
      |     "userId": "21800979",
      |     "displayName": "chrisfinchdev",
      |     "webUrl": "http://www.code.dev-theguardian.com/discussion/user/id/21800979",
      |     "apiUrl": "http://discussion.code.dev-guardianapis.com/discussion-api/profile/21800979",
      |     "avatar": "http://static.guimcode.co.uk/sys-images/Guardian/Pix/site_furniture/2010/09/01/no-user-image.gif",
      |     "secureAvatarUrl": "https://static-secure.guimcode.co.uk/sys-images/Guardian/Pix/site_furniture/2010/09/01/no-user-image.gif",
      |     "badge": [{"name": "Staff"}]
      |    }
      | }
      |],
      | "metaData": {
      |   "commentCount": 4,
      |   "commenterCount": 1,
      |   "staffCommenterCount": 1,
      |   "editorsPickCount": 0,
      |   "blockedCount": 0,
      |   "responseCount": 1
      | }
      |}
      |
    """.stripMargin


}
