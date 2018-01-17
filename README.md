# longitudinal-census

A visualization of the longitudinal census data accompanying the paper:

Logan, John R., Zengwang Xu, and Brian J. Stults. 2014. "Interpolating US Decennial Census Tract Data from as Early as 1970 to 2010: A Longitudinal Tract Database" The Professional Geographer 66(3): 412–420.

[Live version](https://htmlpreview.github.io/?https://github.com/haben-michael/longitudinal-census/blob/master/census.html)

## USAGE
A statistic using census variable names may be input in the upper right form. The left/right arrow keys advance the map through the decades. Left clicking on a tract plots the statistic over the 4 decennial census data periods included (1970-2010).

## TODO
  * choice of color gradient--need diverging for neg/pos values
  * show some examples
  * maybe change shift-drag outline style
  * drop down list of available cities/regions to cycle through

## EXAMPLES (TODO)
*Basic choropleth.* A *choropleth* map color codes areas on the map, e.g., census tracts, according to the value of a statistic, e.g., the number of individuals under age 18 as measured in the 2010 census. Enter the corresponding census variable, "A18UND10" in this case, in the formula box at the upper right to generate a choropleth for this variable.

![](./img/ex2.png)

Clicking the `list` icon calls up a full list of available census variables.

*Longitudinal measurement.* To get a longitudinal view of the number of individuals under 18, enter "A18UNDYY" in the formula box, replacing the year indicator with "YY." Doing so loads  "A18UND80," "A18UND90," "A18UND00," and "A18UND10," i.e., the variable as measured in the 1980, 1990, 2000, or 2010 censuses. The left and right arrow keys cycle through the years, with a timeline at the bottom of map indicating the current view.

![](./img/ex3.png)

Clicking on a census tract generates a plot of the variable over the available time period.

![](./img/ex4.png)

*Derived expressions.* For some purposes, not the number but proportional of individuals under 18 in each census tract may be the relevant measure. The proportion is the ratio of two census variables, "A18UNDYY" and "POPYY." The formula box accepts simple expressions of this type:

![](./img/ex5.png)

In fact, the formula box will execute the expression as javascript in an environment with the census variables available. So to generate a choropleth on the log scale, use:

![](./img/ex6.png)

*Multiple regions.* In order to select several tracts, hold shift while clicking on each. Select all tracts within a square region by holding down shift while dragging with the mouse.

![](./img/ex8.png)

The figure plotted is obtained by summing the census statistics for each of the select tracts. As a result, the plot is usually only meaningful for census count variables.

![](./img/ex7.png)

