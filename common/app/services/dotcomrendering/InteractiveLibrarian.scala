package services.dotcomrendering

import common.GuLogging
import conf.Configuration
import play.api.libs.ws.WSClient

import scala.concurrent._
import ExecutionContext.Implicits.global

// This object was introduced in June 2021, to support the idea that we could possibly serve some
// interactives using a pressed version stored in S3.

object InteractiveLibrarian extends GuLogging {

  // ----------------------------------------------------------
  // Basic S3 I/O

  def commitToS3(s3path: String, document: String): (Boolean, String) = {
    try {
      // On local bucket is: aws-frontend-archive-code-originals
      services.S3ArchiveOriginals.putPublic(s3path, document, "text/html")
      (true, "")
    } catch {
      case e: Exception => (false, e.getMessage)
    }
  }

  def retrieveFromS3(path: String): Option[String] = {
    // Here we retrieve the cleaned version.
    Some(s"Retrived document at path ${path}")
  }

  // ----------------------------------------------------------
  // Archiving Process

  def getDocumentFromLiveSite(path: String): Future[String] = {
    Future.successful("Document retrieved from live URL")
  }

  def pressLiveSiteDocument(path: String): Future[Boolean] = {
    Future.successful(false)
  }

  // ----------------------------------------------------------
  // Serving

  def getDocumentFromS3(path: String): String = {
    "Document from S3"
  }

  def getServableDocument(path: String, wsClient: WSClient): Future[String] = {
    pressLiveContents(wsClient, path).map { message => s"${message} ; Serveable document from S3" }
  }

  def pressLiveContents(wsClient: WSClient, path: String): Future[String] = {
    log.info(s"Interactive Librarian. Pressing path: ${path}")
    val liveUrl = s"https://www.theguardian.com/${path}"
    val s3path = s"www.theguardian.com/${path}"
    val wsRequest = wsClient.url(liveUrl)
    wsRequest.get().map { response =>
      response.status match {
        case 200 => {
          val liveDocument = response.body
          val status = commitToS3(s3path, liveDocument)
          // services.S3ArchiveOriginals.get(s3path).getOrElse(s"[error retrieving from S3] (${status})")
          if (status._1) {
            s"Live Contents S3 Pressing. Operation successful. Path: ${path}. Length: ${liveDocument.length}"
          } else {
            s"Live Contents S3 Pressing. Operation not successful. Path: ${path}. Error: ${status._2}"
          }
        }
        case non200 => s"Unexpected response from ${wsRequest.uri}, status code: $non200"
      }
    }
  }
}
