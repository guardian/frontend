require 'lib/classifier.rb'

class Classifier

    attr_accessor :cleaned_resource

    def clean(resource)
        resource.split('?').first
    end
    
    def hasFileExtension?(resource)
        /\./.match(resource);
    end

    def isRss?(resource)
        /rss$/.match(resource)
    end
    
    def isExcluded?(resource)
        /\/discussion|\/gallery|\/video/.match(resource)
    end

    def whatami(resource)

        @cleaned_resource = self.clean(resource)
        
        return if hasFileExtension? @cleaned_resource
        return if isRss? @cleaned_resource
        return if isExcluded? @cleaned_resource

        return "FRO" if /^\/$/.match(@cleaned_resource)
        return "ART" if /^(\/[\/\w\d\.-]{2,})\/(\d\d\d\d\/\w\w\w\/\d\d)\/([\w\d\.-]+)$/.match(@cleaned_resource)
        return "TAG" if /^(\/[\w\d\.-]{2,})(\/[\/\w\d\.-]+)$/.match(@cleaned_resource)
        return "SEC" if /^\/([\w\d\.-]{2,})$/.match(@cleaned_resource)

    end

end

