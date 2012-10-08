class Related 
    
    include ContentApi

    def initialize(path)
        super
        @params.show_related = 'true'
    end

    def to_www
        "%s/%s%s?%s" %  ['related', @params.edition, path, 'callback=showRelated']
    end

end
