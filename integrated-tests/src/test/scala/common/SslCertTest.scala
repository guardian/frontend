package common

import org.scalatest.tags.Retryable
import org.scalatest.FlatSpec
import javax.net.ssl._
import org.openqa.selenium.lift.Matchers
import java.security.{Principal, SecureRandom}
import java.net.{Socket, URL}
import javax.security.cert.X509Certificate


/**
 * Created by nbennett on 09/01/15.
 */


@Retryable class SslCertTest extends FlatSpec with Matchers {

  val ctx = SSLContext.getInstance("TLS")
  ctx.init(new KeyManager[0], new TrustManager[] { new DefaultTrustManager()}, new SecureRandom())
  SSLContext.setDefault(ctx)


  "SSL Certs" should "Be more than 30 days outside of their expiry time"  in {

    val host = "https://frontend.gutools.co.uk"

    val url = new URL(host)
    val conn = url.openConnection().asInstanceOf[HttpsURLConnection]
    conn.setHostnameVerifier( new HostnameVerifier {
        override def verify(arg1: String, arg2: SSLSession) = true
      }
    )

    val certs = conn.getServerCertificates
    certs.headOption.map {
        cert => val x = cert.asInstanceOf[X509Certificate]
        val expires = x.getNotAfter
        expires.
    }


    conn.disconnect()




    fail("This test is failing muthafucka!")
  }
}

class DefaultTrustManager extends X509KeyManager {
  override def getClientAliases(p1: String, p2: Array[Principal]) = {}

  override def getPrivateKey(p1: String) = ???

  override def getCertificateChain(p1: String) = ???

  override def getServerAliases(p1: String, p2: Array[Principal]) = ???

  override def chooseClientAlias(p1: Array[String], p2: Array[Principal], p3: Socket) = ???

  override def chooseServerAlias(p1: String, p2: Array[Principal], p3: Socket) = ???
}
