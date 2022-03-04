function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    console.log(samples);

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    //  5. Create a variable that holds the first sample in the array.
    var sampleId = samples.filter(data => data.id == sample)[0];
    console.log(sampleId);

    // G.1. Create a variable that filters the metadata array for the object with the desired sample number.
    // G.2. Create a variable that holds the first sample in the metadata array.
    var metadata = data.metadata.filter(data => data.id == sample)[0];
    console.log(metadata);

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = sampleId.otu_ids;
    console.log(otuIds);
    var otuLabels = sampleId.otu_labels;
    console.log(otuLabels);
    var sampleValues = sampleId.sample_values;
    console.log(sampleValues);

    // G.3. Create a variable that holds the washing frequency.
    var wfreq = metadata.wfreq;
    console.log(typeof wfreq);

    // Colors Palette
    var color = 'Jet'
    var colorscheme = ['#f7d5a1','#F6BD60','#bdca7f','#a1b88e','#a1d9e2','#a0abbb','#d4bcd7','#a885a6','#f39693','#F28482']


    // [Blackbody,Bluered,Blues,Earth,Electric,Greens,Greys,Hot,Jet,Picnic,
    // Portland,Rainbow,RdBu,Reds,Viridis,YlGnBu,YlOrRd]

    // --------BAR CHART--------
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var yticks = otuIds.slice(0,10).map(id =>"OTU "+id.toString()).reverse();
    var topTen = otuLabels.slice(0,10).reverse();
    var topTenBr = topTen.map(element => element.replaceAll(";","<br>"));

    // 8. Create the trace for the bar chart. 
    var barData = [{
      x:sampleValues.slice(0,10).reverse(),
      y:yticks,
      type:'bar',
      orientation:'h',
      text:topTenBr,
      marker:{color:colorscheme},
      hovertemplate:
            "<b>OTU Labels:</b> " +
            "OTU %{text}<br>" +
            "<extra></extra>"
    }];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title:"<b>Top 10 Bacteria</b><br>Cultures Found",
      paper_bgcolor:'#F7EDE2',
      plot_bgcolor:'#F7EDE2', 
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar",barData,barLayout);

    // --------BUBBLE CHART--------
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x:otuIds,
      y:sampleValues,
      text:otuLabels,
      mode:'markers',
      marker:{size:sampleValues,color:otuIds,colorscale:color},
      hovertemplate:
            "<b>Culture found:</b> " +
            "OTU %{x}<br>" + 
            "Samples Count: %{y:,.0f}<br>" + 
            "<extra></extra>"
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title:"<b>Bacteria Cultures</b><br>Per Sample",
      xaxis:{title:"OTU ID",autorange: true},
      yaxis: {rangemode: 'nonnegative',autoscale: true},
      hovermode:"closest",
      paper_bgcolor:'#F7EDE2',
      plot_bgcolor:'#F7EDE2',
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble",bubbleData,bubbleLayout);

    // --------GAUGE CHART--------
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      value:wfreq,
      type:"indicator",
      mode:"gauge+number",
      title:{text:"<b>Belly Button Washing Frequency</b><br>Scrubs per week"},
      gauge:{
        axis:{range:[null,10]},
        bar:{color:"#F7EDE2",line:{color:"white",width:.8},thickness:.5},
        steps:[
          {range:[0,2],color:colorscheme[1]},
          {range:[2,4],color:colorscheme[3]},
          {range:[4,6],color:colorscheme[4]},
          {range:[6,8],color:colorscheme[7]},
          {range:[8,10],color:colorscheme[9]}
        ]
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 457.5,
      height: 450,
      autosize:true,
      paper_bgcolor:'#F7EDE2',
      plot_bgcolor:'#F7EDE2',
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge",gaugeData,gaugeLayout);
  });
}