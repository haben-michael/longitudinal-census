require(dplyr)
setwd('/gdrive/scripts/census')
headers <- scan('STF1CRDD.ASC',what='',sep='\n')
g1s <- grep('^G1',headers)
g1.split <- strsplit(headers[g1s],' +')
g1s <- sapply(g1.split,function(fields)c(name=fields[2],length=fields[3],first=fields[5]))
## g2s <- grep('^G2',headers)
## headers[g2s]
t1s <- grep('^T1',headers)
t1s <- sapply(strsplit(headers[t1s],' +'),function(fields)c(name=fields[2],length=as.numeric(fields[5])*as.numeric(fields[7]),first=fields[3]))


fields <- cbind(g1s,t1s) %>% t() %>% as.data.frame(stringsAsFactors=F)%>% mutate_at(vars(length,first),as.numeric) %>% mutate(last=first+length-1)
rownames(fields) <- fields$name
desc <- sapply(strsplit(headers[grep('^(G|T)2',headers)],' +'),function(fields)c(start=fields[2],desc=paste(fields[-c(1:2)],collapse=' '))) %>% t() %>% as.data.frame(stringsAsFactors=F)
desc$desc[which(duplicated(desc$start))-1] <- paste0(desc$desc[which(duplicated(desc$start))-1],desc$desc[which(duplicated(desc$start))])
desc <- desc[!duplicated(desc$start),]
fields$desc <- desc$desc



filenames <- dir()[grep('.F..$',dir())]
## filename <- filenames[8]
## strsplit(filenames,'\\.')
for(filename in filenames) {
    data <- scan(filename,what='',sep='\n')
    data <- paste0(data[(1:length(data))%%2==1], data[(1:length(data))%%2==0])
    data <- sapply(data,function(str)
        substring(str,first=fields$first,last=fields$last) %>% trimws()
        %>%   paste(collapse=',')) %>% as.character(data)
    data <- c(paste(fields$name,collapse=','),data)
    attributes(data) <- NULL
    writeLines(data,paste0(filename,'.csv'))
    ## test <- read.csv(paste0(filename,'.csv'),header=T,colClasses='character')
    ## print(unique(test$CNTY))
}


## > > > + . + Read 28824 items
## [1] ""    "001" "003" "005"
## Read 28824 items
## [1] "005" "007" "009"
## Read 28824 items
## [1] "009" "011" "013" "015" "017"
## Read 28824 items
## [1] "017"
## Read 28824 items
## [1] "017" "019" "021" "023"
## Read 28824 items
## [1] "023" "025" "027"
## Read 28824 items
##  [1] "027" "001" "003" "005" "007" "009" "011" "013" "015" "017" "019" "021"
## [13] "023" "025"
## Read 4870 items
##  [1] "023" "025" "027" "005" "003" "009" "015" "017" "001" "021" "013" "011"
## [13] "019" "007" ""

test <- read.csv(paste0(filenames[8],'.csv'),colClasses='character')
nchar(test[1,'P11'])

