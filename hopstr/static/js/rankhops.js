	var n = 7,
		m = 62;

	var grouped = true;

	var margin = {top:30, right:10, bottom:30, left:50},
		legendwidth = 25;
		textpadding = 4*margin.left ;
		width = 800,
		height = 600 - margin.top - margin.bottom;

	var format = d3.format(".1%"),
		hops,
		characteristic;

	var x = d3.scale.linear()
		.range([textpadding, width-legendwidth]);

	var y = d3.scale.ordinal()
		.rangeRoundBands([0,height], .1);

	var color = d3.scale.ordinal()
		.domain(["alpha","beta","myrcene","humulene","cohumulone","caryophyllene"])
		.range(["#d8b365","#f6e8c3","#5ab4ac","#8c510a","#01665e","#c7eae5"]);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right + textpadding + legendwidth)
		.attr("height", height + margin.top + margin.bottom)
		.style("margin-left",margin.left/2 + "px")
	  .append("g")
	    .attr("transform","translate(" + margin.left/2 + "," + margin.top + ")");

	svg.append("g")
		.attr("class","x axis");
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform","translate(" + textpadding + ",0)")
		.call(yAxis)

	var menu = d3.select("#menu select")
		.on("change", change);

	d3.csv("../static/hops.csv", function(data) {
		hops = data;

		var chars = d3.keys(hops[0]).filter(function(key) {
			return (key != "name" && key != "id");
		});
		console.log(chars)

		menu.selectAll("option")
			.data(chars)
			.enter().append("option")
			.text(function(d) {return d; });

		menu.property("value","alpha");
		characteristic = "alpha";
		initdraw();
		redraw();

	});
	
	function initdraw() {
		var characteristic1 = menu.property("value"),
		top = hops.sort(function(a,b) {return b[characteristic1] - a[characteristic1]; }).slice(0,20);

		// get the array of characteristics, ignoring the indices and the selected characteristic
		var chars = d3.keys(top[0]).filter(function(key) {
			return (key != "name" && key != "id" && key!= characteristic1);
		});

		// add the selected characteristic to the first element of the chars array
		chars.unshift(characteristic1);

		var stack = d3.layout.stack()(chars.map(function(characteristic) {
			return top.map(function(d) {
				return {x: d.name, y: +d[characteristic]};
			});
		}));
		console.log(stack)
		stack = stack.slice(0,10);

		//set domain for x, y 
		y.domain(stack[0].map(function(d) { return d.x;}));

		var xStackMax = d3.max(stack[stack.length -1 ],function(d) {return d.y0 + d.y;});
		var xGroupMax = d3.max(stack[stack.length -1 ],function(d) {return d.y;});
		x.domain([0,xStackMax]);

		// add labels to y-axis
		d3.transition(svg).select(".y.axis")
			.call(yAxis);

		// Add a group for each hop characteristic
		var layer = svg.selectAll("g.layer")
			.data(stack)
		  .enter().append("svg:g")
		    .attr("class", "layer")
		    .style("fill", function(d,i) {return color(i);})
		    .style("stroke", function(d,i) { return d3.rgb(color(i)).darker(); });

		// Add a rect for each value
		var rect = layer.selectAll("rect")
			.data(function(d) {return d;})
		  .enter().append("rect")
		    .attr("y", 0) //function(d) {return y(d.x); })
		    .attr("x",0) //function(d) {return x(d.y0); })
		    .attr("width", 0) //function(d) {return x(d.y);})
		    .attr("height",y.rangeBand());

		// add a legend for each group
		var legend = svg.selectAll(".legend")
			.data(chars.slice())
		  .enter().append("g")
			.attr("class","legend")
			.attr("transform", function(d,i) { return "translate(" + (i*160 + margin.left) +"," + (-margin.top)+ ")"; });

		legend.append("rect")
			.attr("x", 0)
			.attr("width", 25)
			.attr("height", 25)
			.style("fill", function(d,i) {return color(i);});

		legend.append("text")
			.attr("x", 30)
			.attr("y", 10)
			.attr("dy",".35em")
			.style("text-anchor", "start")
			.text( function(d) { return d; });
		
	}

	function redraw() {
		var characteristic1 = menu.property("value"),
		top = hops.sort(function(a,b) {return b[characteristic1] - a[characteristic1]; }).slice(0,20);

		// get the array of characteristics, ignoring the indices and the selected characteristic
		var chars = d3.keys(top[0]).filter(function(key) {
			return (key != "name" && key != "id" && key!= characteristic1);
		});

		// add the selected characteristic to the first element of the chars array
		chars.unshift(characteristic1);

		var stack = d3.layout.stack()(chars.map(function(characteristic) {
			return top.map(function(d) {
				return {x: d.name, y: +d[characteristic]};
			});
		}));

		//set domain for x, y 
		y.domain(stack[0].map(function(d) { return d.x;}));

		var xStackMax = d3.max(stack[stack.length -1 ],function(d) {return d.y0 + d.y;});
		var xGroupMax = d3.max(stack[stack.length -1 ],function(d) {return d.y;});
		x.domain([0,xStackMax]);

		// add labels to y-axis
		d3.transition(svg).select(".y.axis")
			.call(yAxis);

		// Add a group for each hop characteristic
		var layer = svg.selectAll("g.layer")
			.data(stack)
		    .attr("class", "layer")
		    .style("fill", function(d,i) { return color(chars[i]); })
		    .style("stroke", function(d,i) { return d3.rgb(color(chars[i])).darker(); });

		// Add a rect for each value
		var rect = layer.selectAll("rect")
			.data(function(d) {return d;})

		rect.exit().transition()
			.delay(function(d,i) { return i*10; })
			.attr("width",0)
			.remove();

		rect.enter().append("rect")
			.attr("height",y.rangeBand());

		rect
			.transition()
    		.delay(function(d, i) { return i * 10; })
    		.attr("x", function(d) { return x(d.y0); })
    		.attr("y", function(d) {return y(d.x); })
    		.attr("width", function(d) { return x(d.y); });

		// add a legend for each group
		var legend = svg.selectAll(".legend")
			.data(chars.slice())

		legend.selectAll("rect")
			.style("fill", function(d) { return color(d); });

		legend.selectAll("text")
			.text( function(d) { return d; });
			console.log(chars)
	}
		
		function transitionGrouped() {
			  /*x.domain([0, xGroupMax]);
			  rect.transition()
			      .duration(500)
			      .delay(function(d, i) { return i * 10; })
			      .attr("y", function(d,i,j) { return y(d.x) + y.rangeBand()/n ; })
			      .attr("height", y.rangeBand()/n)
			    .transition()
			      .attr("x", function(d) { return x(d.y); })
			      .attr("width", function(d) { return width - x(d.y); });
			      */
		} 
		function transitionStacked() {
		  /*
		  x.domain([0, xStackMax]);
		  rect.transition()
		      .duration(500)
		      .delay(function(d, i) { return i * 10; })
		      .attr("x", function(d) { return x(d.y0); })
		      .attr("width", function(d) { return x(d.y); })
		    .transition()
		      .attr("y", function(d) { return y(d.x); })
		      .attr("height", y.rangeBand());
		      */
		}


	/*y.domain(top.map(function(d) {return d.hopname; }));
	x.domain([0, top[0][characteristic = characteristic1]]);

	
	var bar = svg.selectAll(".bar")
		.data(top, function(d) { return d.hopname; });
	
	var barEnter = bar.enter().insert("g", ".axis")
		.attr("class", "bar")
		.attr("transform", function(d) { return "translate(" + margin.left + "," + (y(d.hopname) + height) + ")"})
		.style("fill-opacity", 0);

	barEnter.append("rect")
		.attr("x", 0)
		.attr("width", characteristic && function(d) {return x(d[characteristic]); })
		.attr("height", y.rangeBand());

	barEnter.append("text")
		.attr("class", "label")
		.attr("x", -10)
		.attr("y", y.rangeBand() / 2)
		.attr("dy", ".5em")
		.attr("text-anchor", "end")
		.text(function(d) {return d.hopname} );

	barEnter.append("text")
		.attr("class","value")
		.attr("x", characteristic && function(d) { return x(d[characteristic]); })
		.attr("y", y.rangeBand() / 2)
		.attr("dy", ".5em")
		.attr("text-anchor", "end");
	
	var barUpdate = d3.transition(bar)
		.attr("transform", function(d) { return "translate("+ 0 + "," + (d.y0 = y(d.hopname)) + ")"; })
		.style("fill-opacity",1);

	barUpdate.select("rect")
		.attr("width", function(d) { return x(d[characteristic]); });

	barUpdate.select(".value")
		.attr("x", function(d) { return x(d[characteristic]) - 3; })
		.text( function(d) { return format(d[characteristic]); });

	var barExit = d3.transition(bar.exit())
		.attr("transform", function(d) {return "translate("+ 0 + "," + (d.y0 + height) + ")";})
		.style("fill-opacity", 0)
		.remove();

	barExit.select("rect")
		.attr("width", function(d) { return x(d[characteristic]); });

	barExit.select(".value")
		.attr("x", function(d) {return x(d[characteristic]) - 3; })
		.text(function(d) {return format(d[characteristic]); });
	*/

var altKey;

	d3.select(window)
	    .on("keydown", function() { altKey = d3.event.altKey; })
	    .on("keyup", function() { altKey = false; });

	d3.selectAll("input").on("change", change);

	/*var timeout = setTimeout(function() {
		d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
	}, 2000);
*/

	function change() {
	  clearTimeout(timeout);
	  if (this.value === "grouped") { 
	  	transitionGrouped();
	  }
	  else {
	  	transitionStacked();
	  }

	  d3.transition()
	      .duration(altKey ? 7500 : 750)
	      .each(redraw); 
	}




var timeout = setTimeout(function() {
	menu.property("value", "alpha").node().focus();
	change();
}, 5000);