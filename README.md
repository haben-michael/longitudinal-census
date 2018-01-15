# longitudinal-census

A visualization of the longitudinal census data accompanying the paper:

Logan, John R., Zengwang Xu, and Brian J. Stults. 2014. "Interpolating US Decennial Census Tract Data from as Early as 1970 to 2010: A Longitudinal Tract Database" The Professional Geographer 66(3): 412–420.

[Live version](https://htmlpreview.github.io/?https://github.com/haben-michael/longitudinal-census/blob/master/census.html)

The current build is in javascript (leaflet and D3) but an R/shiny implementation is among the older files.

## USAGE
A statistic using census variable names may be input in the upper right form. The left/right arrow keys advance the map through the decades. Left clicking on a tract plots the statistic over the decennial census data included (1970-2010).

## TODO
  * choice of color gradient--need diverging for neg/pos values
  * show some examples
  * maybe change shift-drag outline style

## EXAMPLES (TODO)
    * basic example -- pop of each tract. variable years, cycling
      through time (anim gif); list of available stats
      * should be normalized by area -- formulas
      * should be log normalized -- Math.log
    * shift selection, shift drag; method of combining stats

