package common

import play.api.mvc.RequestHeader

class Browser extends Logging {
    
	def HTMLPreparser(request: RequestHeader): Boolean = {
		request.headers.get("X-Gu-Feature-HTMLPreparser").isDefined
	}

}