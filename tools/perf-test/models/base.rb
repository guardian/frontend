require 'open-uri'

module ContentApi 

    attr_accessor :params, :host
    
    def initialize
        @params = OpenStruct.new
        @params.format = 'json'
        @params.api_key = 'mattc'
        @params.edition = 'UK'
        @params.user_tier = 'internal'
        @host = 'http://test-mq-elb.content.guardianapis.com/api'
    end
    
    def to_querystring
        @params.marshal_dump.map{ |key|
           k = key.first.to_s.gsub('_', '-')
           v = URI::encode key[1]
           "%s=%s" % [k, v]
        }.join("&")
    end

end
