package common

import play.api.mvc.RequestHeader

class Browser extends Logging {
    
	def HTMLPreparser(request: RequestHeader): Boolean = {
		log.warn(request.headers.get("X-Gu-Feature-HTMLPreparser").getOrElse("nothing"))
		!request.headers.get("X-Gu-Feature-HTMLPreparser").isDefined
	}

}