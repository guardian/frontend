
require 'rubygems'
require 'lib/log.rb'
require 'lib/classifier.rb'

access_log = 'logs/guardian-access_log.20120622.guweb01'

File.open(access_log).each do |entry|

    begin    

        log = Log.new().parse entry
        classifier = Classifier.new()
        type = classifier.whatami log.resource

        puts [log.status, log.time, type, classifier.cleaned_resource].join("\t")

    rescue
        warn entry
    end

end

