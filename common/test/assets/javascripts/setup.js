// adding the 'withCredentials' property, so reqwest thinks it can do cors
sinon.FakeXMLHttpRequest.prototype.withCredentials = false;