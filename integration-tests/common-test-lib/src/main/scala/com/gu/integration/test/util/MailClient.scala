package com.gu.integration.test.util

import java.util.{Calendar, Date}
import javax.mail._
import javax.mail.search.FlagTerm

import com.gu.automation.support.TestLogging
import com.sun.mail.imap.IMAPFolder

object MailClient extends TestLogging {

  val props = System.getProperties
  props.setProperty("mail.store.protocol", "imaps")

  private val FlaggedUnread: FlagTerm = new FlagTerm(new Flags(Flags.Flag.SEEN), false)

  def findRecentEmailsBySubjectSortedDescByReceivedDate(email: String, emailPwd: String, subject: String): List[MailMsg] = {
    //synchronized to avoid checking the same account simultaneously for tests running in parallel
    synchronized {
      var folder: IMAPFolder = null
      var store: Store = null
      try {
        connect(email, emailPwd)
        openFolder("inbox")

        val messages = folder.search(FlaggedUnread).filter(msg => msg.getSubject.equals(subject) && isRecent(msg))
          .sortWith(_.getReceivedDate.getTime > _.getReceivedDate.getTime)
          .map(msg => MailMsg(msg.getSubject, getBodyAsString(msg), msg.getReceivedDate))

        logger.debug(s"No of retrieved messages ${messages.size}")

        return messages.toList
      }
      catch {
        case e: Exception => throw new RuntimeException("Error when checking for email", e)
      }
      finally {
        if (folder != null && folder.isOpen) {
          folder.close(true)
        }
        if (store != null) {
          store.close()
        }
      }

      def connect(email: String, emailPwd: String) {
        val session = Session.getDefaultInstance(props, null)
        store = session.getStore("imaps")
        store.connect("imap.googlemail.com", email, emailPwd)
      }

      def openFolder(folderName: String) {
        folder = store.getFolder(folderName).asInstanceOf[IMAPFolder]
        if (!folder.isOpen) {
          folder.open(Folder.READ_WRITE)
        }
      }
      List.empty[MailMsg]
    }
  }

  def isRecent(message: Message): Boolean = {
    val recentCalendar = Calendar.getInstance()
    recentCalendar.add(Calendar.SECOND, -30)

    message.getReceivedDate.after(recentCalendar.getTime)
  }

  def getBodyAsString(msg: Message): String = {
    msg.getContent.asInstanceOf[java.lang.String]
  }

}

case class MailMsg(subject: String, content: String, receivedDate: Date) {

  def getResetPasswordLink(): Option[String] = {
    val resetPasswordLinkStartString: String = "http"
    if (content == null || content.indexOf(resetPasswordLinkStartString) == -1) {
      return None
    }

    val linkStartIndex = content.indexOf(resetPasswordLinkStartString)
    val linkEndIndex = content.indexOf("\n", linkStartIndex)

    Option(content.substring(linkStartIndex, linkEndIndex))
  }
}