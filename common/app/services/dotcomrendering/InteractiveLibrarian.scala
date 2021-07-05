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

  private def commitOriginalToS3(s3path: String, document: String): (Boolean, String) = {
    try {
      // On local bucket is: aws-frontend-archive-code-originals
      services.S3ArchiveOriginals.putPublic(s3path, document, "text/html")
      (true, "")
    } catch {
      case e: Exception => (false, e.getMessage)
    }
  }

  private def retrieveOriginalFromS3(s3path: String): Option[String] = {
    services.S3ArchiveOriginals.get(s3path)
  }

  // ----------------------------------------------------------
  // Cleaning

  def cleanOriginalDocument(document: String): String = {
    // For the moment this function is the identity
    document
  }

  def applyCleaning(s3path: String): Boolean = {
    // This function takes a s3 path pointing at an original document (meaning something pressed from live contents)
    // and writes the cleaned version.
    retrieveOriginalFromS3(s3path) match {
      case Some(document) => {
        val cleaned = cleanOriginalDocument(document)
        false // for the moment
      }
      case None => false
    }
  }

  // ----------------------------------------------------------
  // Operations

  def getDocumentFromS3(path: String): Option[String] = {
    val s3path = s"www.theguardian.com/${path}"
    services.S3ArchiveOriginals.get(s3path)
  }

  def pressLiveContents(wsClient: WSClient, path: String): Future[String] = {
    // 1. Takes a path ( books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more )
    // 2. Queries the live contents ( https://www.theguardian.com/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more )
    // 3. Stores the document at S3 path ( www.theguardian.com/books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more )
    log.info(s"Interactive Librarian. Pressing path: ${path}")
    val liveUrl = s"https://www.theguardian.com/${path}"
    val s3path = s"www.theguardian.com/${path}"
    val wsRequest = wsClient.url(liveUrl)
    wsRequest.get().map { response =>
      response.status match {
        case 200 => {
          val liveDocument = response.body
          val status = commitOriginalToS3(s3path, liveDocument)
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
