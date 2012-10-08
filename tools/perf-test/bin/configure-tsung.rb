
require 'rubygems'
require 'erb'
require 'slop'

conf = Slop.parse do
    banner "ruby #{__FILE__} [options]\n"
    on :h, :host=, 'host name of system under test', :default => 'test-mq-elb.content.guardianapis.com'
    on :p, :port=, 'port of system under test', :as => :int, :default => 20
    on :d, :duration=, 'duration of the test in minutes', :as => :int, :default => 3
    on :r, :rate=, 'arrival rate', :as => :int, :default => 20
    on :u, :url=, 'file with urls to test', :required => true
    on :c, :cache, :default => false
    on :z, :gzip, :default => false
end

template = IO.read('tsung/tsung.xml.erb')
puts ERB.new(template).result(binding)

