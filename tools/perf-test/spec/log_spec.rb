require 'lib/log.rb'

describe Log do
        
    it "Tokenize a httpd log entry" do
        entry = Log.new().parse '31.203.219.281 - - [21/Jun/2012:00:15:49 +0100] "GET /books/2012/jun/01/green-lantern-gay-dc-comics HTTP/1.1" 302 137 "http://www.google.com/search?q=green+lantern+gay&ie=UTF-8&oe=UTF-8&hl=en&client=safari" "Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3" "ip:31.203.219.204,country:KW" "-;-;-" "-"'
        entry.ip.should == '31.203.219.281'
        entry.method.should == 'GET'
        entry.resource.should == '/books/2012/jun/01/green-lantern-gay-dc-comics'
        entry.status.should == 302
        entry.ua.should == 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3'
        entry.time.should == '00:15:49'
    end

end
