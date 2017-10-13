## refs
## 1. cross table for pre-2010 puma codes: http://mcdc.missouri.edu/data/corrlst/puma2k_puma2010.csv
## 2. puma ftp site http://www2.census.gov/
## 3. data dictionary http://www2.census.gov/programs-surveys/acs/tech_docs/pums/data_dict/PUMSDataDict15.txt

## TODO
## 1. right click to hold info steady so you can copy/paste from info box
## 2. highlight on legend on mouseover
## 3. formula interface
## 4. change palette--want hue change for +/- but intensity change otherwise

require(maptools)
require(dplyr)
library(ggmap)
library(leaflet)
library(geojsonio)
require(RJSONIO)
require(stringr)
setwd('/gdrive/scripts/boston')

get.geojsons <- function(formula,years,level,puma2k=F) {
    variables <- str_extract_all(formula,'<([^>]+)>')[[1]]
    variables <- gsub('(^<)|(>$)','',variables) %>% unique
    formula <- str_replace_all(formula,'<([^>]+)>','\\1')
    puma <- readShapeSpatial(paste('shapefile',level))
    if(puma2k) {
        puma@data <- puma@data %>% rename(id=PUMA5) %>% mutate_if(is.factor,as.character)
        puma$id <- paste0('25',puma$id)
        puma <- puma[!duplicated(puma$id),]
    } else {
        puma@data <- puma@data %>% rename(id=GEOID10) %>% mutate_if(is.factor,as.character)
    }


    for (year in years) {
        data.file <- paste0(year,' ',level,'.csv')
        pums.year <- read.csv(data.file)
        pums.year <- pums.year %>% select_(.dots=c(variables,'ST','PUMA','PWGTP'))
        pums.year <- pums.year %>% group_by(PUMA) %>%
            summarize_each(funs(sum((.)*PWGTP)/sum(PWGTP))) %>%
            mutate(id=paste0(ST,sprintf('%05d',PUMA)))
        puma@data <- left_join(puma@data,pums.year,by='id')
        puma@data <- rename_(puma@data,.dots=setNames(variables,paste0(variables,'_',year)))
    }

    for(year in years) {
        formula.year <- formula
        repeat {
            match <- regexpr('\\$[^\\$]+\\$',formula.year)
            if(match==-1) break
            evaluated <- substr(formula.year,match,match+attr(match,'match.length')-1)
            evaluated <- gsub('\\$','',evaluated)
            evaluated <- eval(parse(text=gsub('YY',year,evaluated)))
            formula.year <- sub('\\$[^\\$]+\\$',evaluated,formula.year)
        }
        formula.year <- parse(text=formula.year)
        mutated <- tryCatch(
            mutate(puma@data,stat=eval(parse(text=formula.year),envir=puma@data)) %>% rename_(.dots=setNames('stat',paste0('stat_',year))),
            error=function(e) e
        )
        if(!inherits(mutated,"error")) puma@data <- mutated
    }


    data.full <- puma@data
    stat.cols <- grep('stat_',colnames(puma@data))
    stat.colnames <- colnames(puma@data)[stat.cols] %>% sort
    puma@data <- select(puma@data,c(stat.cols,which(colnames(puma@data)%in%c('id','NAME10'))))

    years <- gsub('[^0-9]','',colnames(puma@data)[grep('^stat',colnames(puma@data))]) %>% as.numeric()

    puma.features <- fromJSON(as.character(geojson_json(puma)))
    puma.features[[2]] <- lapply(puma.features[[2]],function(feature) {
        feature$properties <- as.list(feature$properties)
        feature$properties$stat <- as.numeric(feature$properties[stat.colnames])
        feature
        })

    ## pal <- colorBin(palette, unlist(data.full[,stat.cols]), palette.bins, pretty = FALSE)

    ## lapply(puma.features[[2]],function(feature) {
    ##     feature$properties <- as.list(feature$properties)

    ## geojsons <- list()
    ## for(n in 1:length(years)) {
    ##     ## for(m in 1:length(puma.features[[2]])) {
    ##     geojsons[[n]] <- lapply(puma.features[[2]], function(feature) {
    ##         feature$properties <- as.list(feature$properties)
    ##         feature$properties$start <- years[n]#as.numeric(as.POSIXct(paste0(years[n],'-01-01')))
    ##         feature$properties$end <- years[n]+1#as.numeric(as.POSIXct(paste0(years[n],'-01-01')))
    ##         feature$properties$stat <- data.full[data.full$id==feature$properties$id,paste0('stat_',years[n])]
    ##         ## feature$properties$fill <- pal(feature$properties$stat)
    ##         feature
    ##     })
    ## }
    ## do.call(c,geojsons)
    return(puma.features)
}

years <- c(2013,2014)#2008:2015
formula <- "100*<RACWHT>_$YY$-100*<RACWHT>_$YY-1$"
formula <- "<AGEP>_$YY$"

palette <- 'Blues'#'RdBu'


puma.features <- list(type="FeatureCollection",features=list())
geojsons.2k <- geojsons.2010 <- list()
years.2k <- years[years<=2011]
if(length(years.2k)>0)
    geojsons.2k <- get.geojsons(formula=formula,years=years.2k,level='puma2k',puma2k=T)
years.2010 <- years[years>=2012]
## if(length(years.2010)>0)
puma.features <- get.geojsons(formula=formula,years=years.2010,level='puma2010',puma2k=F)
## puma.features[[2]] <- c(geojsons.2k,geojsons.2010)
stats <- sapply(puma.features[[2]],function(feature)feature$properties$stat) %>% as.numeric()
## pal <- colorBin(palette,stats,pretty=F)
pal <- colorQuantile(palette,stats,n=6)
puma.features[[2]] <- lapply(puma.features[[2]],function(feature) {
    feature$properties$fill <- pal(feature$properties$stat)
    feature
})

## export.json <- list(bins=attr(pal,'colorArgs')$bins %>% round(),
                    ## fills=sapply(attr(pal,'colorArgs')$bins[-1],pal),
export.json <- list(bins=as.numeric(quantile(stats,attr(pal,'colorArgs')$probs)) %>% round(2),
                    fills=pal(quantile(stats,attr(pal,'colorArgs')$probs[-1])),
                    formula=as.character(formula),
                    times=years,
                    data=puma.features) %>% lapply(toJSON)
export.json <- lapply(1:length(export.json),function(n)paste0('var ',names(export.json)[n],' = ',export.json[[n]])) %>% paste0(collapse='\n')
write(export.json,'puma_data.js')
