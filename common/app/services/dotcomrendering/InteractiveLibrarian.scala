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

  def commitToS3(s3path: String, document: String): String = {
    // we store the document at this path on S3, we should put both the "original/full" version and a cleaned version

    log.info(s"Nx100-03: commitToS3: ${s3path}")
    try {
      // On local bucket is: aws-frontend-archive-code-originals
      services.S3ArchiveOriginals.putPublic(s3path, document, "text/html")
      s"Document stored to S3 archive path: ${s3path}, length: ${document.length}"
    } catch {
      case e: Exception => e.getMessage
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
    log.info(s"Nx100-02: getServableDocument: ${path}")
    pressFromLive(wsClient).map { message => s"${message} ; Serveable document from S3" }
  }

  def pressFromLive(wsClient: WSClient): Future[String] = {
    val urlIn =
      "https://www.theguardian.com/us-news/2017/may/01/michelle-obama-school-lunch-let-girls-learn-scrapped-trump"
    val wsRequest = wsClient.url(urlIn)
    // println(s"Calling ${wsRequest.uri}")
    wsRequest.get().map { response =>
      response.status match {
        case 200 => {
          val livedocument = response.body
          val status = commitToS3("testing-1152", livedocument)
          services.S3ArchiveOriginals.get("testing-1152").getOrElse(s"Default String 15:16 - (${status})")
        }
        case non200 => s"Unexpected response from ${wsRequest.uri}, status code: $non200"
      }
    }
  }
}
