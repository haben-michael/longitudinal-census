require(maptools)
require(dplyr)
library(ggmap)
library(leaflet)
library(geojsonio)
require(RJSONIO)
require(stringr)
setwd('/gdrive/scripts/census')


years <- c(1980,1990,2000,2010)
## years <- 1980
formula <- "100*<RACWHT>_$YY$-100*<RACWHT>_$YY-1$"
formula <- "<AGEP>_$YY$"
formula <- 'HISPYY/POPYY'
palette <- 'Blues'#'RdBu'


states <- 'MA'
counties <- c('Suffolk County','Middlesex County','Norfolk County')
shapefile <- 'shapefiles/tl_2010_25_tract10'
states <- 'CA'
counties <- c('San Francisco County','San Mateo County','Santa Clara County')
shapefile <- 'shapefiles/tl_2010_06_tract10'


data <- read.csv(paste0('LTDB/LTDB_Std_',years[1],'_fullcount.csv'),stringsAsFactor=F)
data <- filter(data,state %in% states & county %in% counties)
fips.table <-
    subset(data,!duplicated(data$county),select=c('TRTID10','county')) %>% mutate(TRT_padded = str_pad(as.character(TRTID10),11,'left','0')) %>% mutate(county.fips=substr(TRT_padded,3,5))
for(year in years[-1]) {
    data.year <- read.csv(paste0('LTDB/LTDB_Std_',year,'_fullcount.csv'),stringsAsFactor=F)
    data.year <- filter(data.year,state %in% states & county %in% counties)
    data <- left_join(data,data.year)
}


geodata <- readShapeSpatial(shapefile)
geodata@data <- mutate_if(geodata@data,is.factor,as.character)
geodata <- geodata[geodata@data$COUNTYFP10 %in% fips.table$county.fips,]
geodata@data$GEOID10 <- as.numeric(geodata@data$GEOID10)
geodata@data <- left_join(geodata@data,data,by=c('GEOID10'='TRTID10'))

for(year in years) {
    formula.year <- gsub('YY',substr(year,3,4),formula)
    geodata@data <- mutate(geodata@data,stat=eval(parse(text=formula.year),envir=geodata@data)) %>% rename_(.dots=setNames('stat',paste0('stat_',year)))
}


stat.cols <- grep('stat_',colnames(geodata@data))
stat.colnames <- colnames(geodata@data)[stat.cols] %>% sort
## geodata@data <- select(geodata@data,c(stat.cols,which(colnames(geodata@data)%in%c('GEOID10'))))
## geodata@data[is.null(geodata@data)] <- NA

features <- fromJSON(as.character(geojson_json(geodata)))
features[[2]] <- lapply(features[[2]],function(feature) {
    feature$properties <- as.list(feature$properties)
    feature$properties <- lapply(feature$properties,function(p)if(is.null(p))NA else p)

    ## print(feature$properties$stat)
    ## if(sum(is.na(feature$properties$stat))>0)
    ##     print(as.numeric(unlist(feature$properties[stat.colnames])))
    feature$properties$stat <- feature$properties[stat.colnames] %>% as.numeric
    feature
})

## for(i in 1:length(features[[2]])) if(is.null(features[[2]][[i]]$properties[['stat']]))print(i)

stats <- sapply(features[[2]],function(feature)feature$properties$stat) %>% unlist %>% as.numeric
stats <- stats[!is.na(stats)]
pal <- colorQuantile(palette,stats,n=6)
features[[2]] <- lapply(features[[2]],function(feature) {
    feature$properties$NAME10 <- feature$properties$GEOID10
    feature$properties$fill <- pal(feature$properties$stat)
    feature
})

export.json <- list(startLatLng = geodata@polygons[sample(length(geodata@polygons),1)][[1]]@Polygons[[1]]@coords[1,],
                    bins=as.numeric(quantile(stats,attr(pal,'colorArgs')$probs)) %>% round(2),
                    fills=pal(quantile(stats,attr(pal,'colorArgs')$probs[-1])),
                    formula=as.character(formula),
                    times=years,
                    data=features) %>% lapply(toJSON)
export.json <- lapply(1:length(export.json),function(n)paste0('var ',names(export.json)[n],' = ',export.json[[n]])) %>% paste0(collapse='\n')
write(export.json,paste0(states[1],'_data.js'))



## yy <- read.csv('LTDB_Std_2010_fullcount.csv',stringsAsFactors=F)
## colnames(yy)[-(1:4)] <- toupper(colnames(yy)[-(1:4)])
## colnames(yy)[1] <- 'TRTID10'
## write.csv(yy,'LTDB_Std_2010_fullcount.csv',row.names=F,quote=F)
