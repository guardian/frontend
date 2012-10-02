
require 'rubygems'
require 'erb'
require 'slop'

opts = Slop.parse do
    banner "ruby #{__FILE__} [options]\n"
    on :h, :host=, 'host name of system under test'
    on :d, :duration=, 'duration of the test in minutes', :as => :int
    on :r, :rate=, 'arrival rate', :as => :int
    on :u, :url=, 'file with urls to test'
end

template = IO.read('tsung/tsung.xml.erb')

conf = opts

puts conf.inspect

puts ERB.new(template).result(binding)

