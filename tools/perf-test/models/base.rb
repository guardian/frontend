require 'open-uri'

module ContentApi 

    attr_accessor :params, :host, :path
    
    def initialize(path="/", params=nil)
        @path = path
        @params = OpenStruct.new
        @params.format = 'json'
        @params.api_key = 'frontend-perf-test'
        @params.edition = 'UK'
        @params.user_tier = 'internal'
        @host = 'http://test-mq-elb.content.guardianapis.com/api'
    end
    
    # serialise the object as a content api call
    def to_api
        params_as_querystring = @params.marshal_dump.map{ |key|
           k = key.first.to_s.gsub('_', '-')
           v = URI::encode key[1]
           "%s=%s" % [k, v]
        }.join("&")
        "%s?%s" % ['api/' + @path, params_as_querystring]
    end

    # serialise the object as a frontend (ie. user) request 
    def to_www
        @path 
    end

end
