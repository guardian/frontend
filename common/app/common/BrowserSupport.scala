package common

import play.api.mvc.RequestHeader


case class BrowserSupport(request: RequestHeader) {

	private def headerContains(header: String): Boolean = {
		request.headers.get("X-Gu-Feature").map(_.split(",").contains(header)).getOrElse(false)
	}

    lazy val AsyncScript = headerContains("AsyncScript")
    lazy val HTMLPreparser = headerContains("HTMLPreparser")

}