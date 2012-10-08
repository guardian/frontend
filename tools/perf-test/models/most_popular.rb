class MostPopular
    
    include ContentApi

    def initialize(path)
        super
        @params.show_most_viewed = 'true'
    end

    def to_www
        "%s/%s/%s?%s" %  ['most-popular', @params.edition, path, 'callback=showMostPopular']
    end

end
