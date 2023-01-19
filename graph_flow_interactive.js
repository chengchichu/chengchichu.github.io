
        
 
// function 

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
 
String.format = function() {
     var s = arguments[0];
     for (var i = 0; i < arguments.length - 1; i += 1) {
         var reg = new RegExp('\\{' + i + '\\}', 'gm');
         s = s.replace(reg, arguments[i + 1]);
     }
     return s;
};
 
// main 

readTextFile("./sample0116.json", function(text){
    var data = JSON.parse(text);
    console.log(data);
 
    // 
    function source_to_dot(data) {
 
         var node_default = String.format(`    node [ shape="{0}", style="{1}", fontname="{2}", margin="{3}", color="{4}"]`,"box","rounded","Lato","0.2","black")
         collected_node = []
         paresed_node = []
         for (const key of Object.keys(data.nodes)) {     
             var node_i = String.format(`    {0} [ label="{1}", id="{2}", frontcolor="black", color="black" ]`,key,data.nodes[key].id,"node_"+data.nodes[key].id)
             paresed_node.push(node_i)
             collected_node.push(key)
             //  console.log(node_i)
         };
         //    console.log(paresed_node);
         collected_edge = []
         paresed_edge = []
         for (const key of Object.keys(data.links)) {
             var edge_i = String.format(`    {0} [ label="{1}", id="{2}"]`,data.links[key].source+' -> '+ data.links[key].target, data.links[key].source+'to'+ data.links[key].target ,'E_'+data.links[key].source+data.links[key].target)
             paresed_edge.push(edge_i)
             collected_edge.push(' '+data.links[key].source+' -> '+ data.links[key].target)  // for case like 10 -> to be distinguished with 0 ->
             //   console.log(edge_i)
         };
         //    console.log(paresed_edge);
         D = ["digraph {"].concat(node_default).concat(paresed_node).concat(paresed_edge).concat("}")
         var dotSrc = D.join('\n')
         console.log(dotSrc)
 
         return dotSrc
    };  
 
    // determine boundary node in jobj
 //   console.log(data.links)
 // var trg_i = 3
    var in_source = []
    var in_target = []
    for (const key of Object.keys(data.links)) {
        in_source.push(data.links[key].source)
        in_target.push(data.links[key].target)
    }; 
  
    for (const key of Object.keys(data.nodes)) {
        var cnt = in_source.filter(x => x === data.nodes[key].id).length
        var cnt2 = in_target.filter(x => x === data.nodes[key].id).length
      //    console.log(cnt)
      //    console.log(cnt2)
      //    console.log(data.nodes[key])
        data.nodes[key]['inBound'] = (cnt==0)||(cnt2==0)
    }; 
 
    //
    function return_new_graph(data, trg_i){
 
    var trg = [trg_i]
    console.log(trg)
    var I = data 
    console.log(I)
    var ukeys = []
    // finding upstream node     
    do {
         var new_key = []
         var node_matched = []
         for (const key of Object.keys(I.links)) {     
             var newarr = trg.filter(item=>item===I.links[key].target)
             if (newarr.length>0) {
                 node_matched.push(I.links[key].source)
                 new_key.push(key)
             }
         }; 
        
         // console.log(node_matched)
         // remove if bound
         for (j=0; j<node_matched.length; j++) {
             //  console.log(node_matched[j])
             if (I.nodes[node_matched[j]]['inBound']){
                 node_matched.splice(j,1)
             };
         };
         console.log(node_matched)
         ukeys = ukeys.concat(new_key) 
         // console.log(node_matched)
         // console.log(data_cp.nodes)
         trg = node_matched
     } 
     while (!new_key.length==0)
 
     console.log(node_matched)
     // console.log(allkeys)
     var trg = [trg_i]
     var dkeys = []
     do {
          var new_key = []
          var node_matched = []
          for (const key of Object.keys(I.links)) {     
              var newarr = trg.filter(item=>item===I.links[key].source)
              if (newarr.length>0) {
                  node_matched.push(I.links[key].target)
                  new_key.push(key)
              }
          }; 
          // remove if bound
          for (j=0; j<node_matched.length; j++) {
              // console.log(node_matched)
              if (I.nodes[node_matched[j]]['inBound']){
                  node_matched.splice(j,1)
              };
          };
          dkeys = dkeys.concat(new_key) 
          console.log(node_matched)
          // console.log(data_cp.nodes)
          trg = node_matched
      } 
      while (!new_key.length==0)
 
      console.log(ukeys) 
      console.log(dkeys) 
      allkeys = ukeys.concat(dkeys)
    
     // determine node in  
     var nodes_in = [] 
     for (i=0; i<allkeys.length; i++){
         nodes_in = nodes_in.concat([data.links[allkeys[i]].source,data.links[allkeys[i]].target])  
         // console.log(data.links.i)
     };
     
     // console.log(nodes_in)

     // remove edge
     for (const key of Object.keys(data.links)) {     
         if (!allkeys.includes(key)) {
             delete data.links[key]
         };
     };
     // remove node
     for (const key of Object.keys(data.nodes)) {     
         if (!nodes_in.includes(parseInt(key))) {
             delete data.nodes[key]
         };
     };
      
     //
     return data
     }
     // new_graph = return_new_graph(data, trg_i)
     // dotSrc = source_to_dot(new_graph)
     // console.log(dotSrc)
 
    // animation loop 
    var graphviz = d3.select("#graph").graphviz();
 
    function render() {
         
         dotSrc = source_to_dot(data)
         console.log('DOT source =', dotSrc);
         
         graphviz
             .transition(function() {
                 return d3.transition()
                     .delay(100)
                     .duration(1000);
             })
             .renderDot(dotSrc)
             .on("end", interactive);
 
         // console.log(graphviz.data())    
     }
 
     function interactive() {
 
         nodes = d3.selectAll('.node,.edge');
         nodes
             .on("click", function () {
                 var title = d3.select(this).selectAll('title').text().trim();
                 var text = d3.select(this).selectAll('text').text();
                 var id = d3.select(this).attr('id');
                 var class1 = d3.select(this).attr('class');
             
                 // var color = d3.select(this).style("background-color", "yellow");
 
                 dotElement = title.replace('->',' -> ');
                 console.log('Element id="%s" class="%s" title="%s" text="%s" dotElement="%s"', id, class1, title, text, dotElement);
                 console.log('Finding and deleting references to %s "%s" from the DOT source', class1, dotElement);
                 // console.log('%s',color)
 
                 console.log(dotElement)
                 data = return_new_graph(data, parseInt(dotElement))
                 // console.log(new_graph_)
                 // dotSrc = new_graph_.join('\n');
                 render();
             });
     }
      
     render(data);
 });
 
 