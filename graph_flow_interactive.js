


// string format function
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i += 1) {
        var reg = new RegExp('\\{' + i + '\\}', 'gm');
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
 };

// convert jobj data to DOT language graph
function source_to_dot(data) {
    
    var node_default = String.format(`    node [ shape="{0}", style="{1}", fontname="{2}", margin="{3}", color="{4}"]`,"box","rounded","Lato","0.2","black")
    collected_node = []
    paresed_node = []
    for (const key of Object.keys(data.nodes)) {     
        if ((typeof unode !== 'undefined') && (unode.includes(parseInt(key)))) {
            var node_i = String.format(`    {0} [ label="{1}", id="{2}", frontcolor="black", color="blue" ]`,key,data.nodes[key].id,"node_"+data.nodes[key].id)
        } else if ((typeof dnode !== 'undefined') && (dnode.includes(parseInt(key))))  {
        
        var node_i = String.format(`    {0} [ label="{1}", id="{2}", frontcolor="black", color="green" ]`,key,data.nodes[key].id,"node_"+data.nodes[key].id)
    
        } else {
        var node_i = String.format(`    {0} [ label="{1}", id="{2}", frontcolor="black", color="black" ]`,key,data.nodes[key].id,"node_"+data.nodes[key].id)
        }   
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

// recursively finding upstream and downstream node
function return_new_graph(data, trg_i){

    var trg = [trg_i]
    console.log(trg)
    var I = data 
    console.log(I)
    var ukeys = []
    var unode = []
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
        unode = unode.concat(node_matched)
        // console.log(node_matched)
        // remove if bound
        for (j=0; j<node_matched.length; j++) {
            //  console.log(node_matched[j])
            if (I.nodes[node_matched[j]]['inBound']){
                node_matched.splice(j,1)
            };
        };
        console.log(node_matched)
        // unode = unode.concat(node_matched)
        ukeys = ukeys.concat(new_key) 
        // console.log(node_matched)
        // console.log(data_cp.nodes)
        trg = node_matched
    } 
    while (!new_key.length==0)

    console.log(unode)
    // console.log(allkeys)
    var trg = [trg_i]
    var dkeys = []
    var dnode = []
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
        dnode = dnode.concat(node_matched)
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
    console.log(node_matched)
    console.log(ukeys) 
    console.log(dkeys) 
    allkeys = ukeys.concat(dkeys)


    var nodes_in = [] 

    for (i=0; i<allkeys.length; i++){
        nodes_in = nodes_in.concat([data.links[allkeys[i]].source,data.links[allkeys[i]].target])  
    };
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
    
    return [data, unode, dnode]
}

const width = window.innerWidth;
const height = window.innerHeight;
console.log(width)
console.log(height)
document.getElementById('graph').style.width = width-100+'px'
document.getElementById('graph').style.height = height-100+'px'
// console.log(document.getElementById('graph').style.width)

const scale = 0.9;

function attributer(datum, index, nodes) {
    var selection = d3.select(this);
    if (datum.tag == "svg") {
        datum.attributes = {
            ...datum.attributes,
            width: '100%',
            height: '100%',
        };
        // svg is constructed by hpcc-js/wasm, which uses pt instead of px, so need to convert
        const px2pt = 3 / 4;

        // get graph dimensions in px. These can be grabbed from the viewBox of the svg
        // that hpcc-js/wasm generates
        const graphWidth = datum.attributes.viewBox.split(' ')[2] / px2pt;
        const graphHeight = datum.attributes.viewBox.split(' ')[3] / px2pt;

        // new viewBox width and height
        const w = graphWidth / scale;
        const h = graphHeight / scale;

        // new viewBox origin to keep the graph centered
        const x = -(w - graphWidth) / 2;
        const y = -(h - graphHeight) / 2;

        const viewBox = `${x * px2pt} ${y * px2pt} ${w * px2pt} ${h * px2pt}`;
        selection.attr('viewBox', viewBox);
        datum.attributes.viewBox = viewBox;
    }
}





// main loop
document.getElementById('contentFile').onchange = function(evt) {
    try {
        let files = evt.target.files;
        if (!files.length) {
            alert('No file selected!');
            return;
        }
        let file = files[0];
        let reader = new FileReader();
        // const self = this;
        reader.onload = (event) => {
            // console.log('FILE CONTENT', event.target.result);
            // text = event.target.result
            var data = JSON.parse(event.target.result);
            console.log(data);
   
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
            //    target_cnt_table.push(cnt)
            //    console.log(cnt)
            //    console.log(cnt2)
            //    console.log(data.nodes[key])
            //    newData = Object.assign(data.nodes, {key: { inBound: (cnt==0)||(cnt2==0) }} )
                data.nodes[key]['inBound'] = (cnt==0)||(cnt2==0)
            }; 

            var margin = 20; // to avoid scrollbars
            var width = window.innerWidth - margin;
            var height = window.innerHeight - margin;

            // graphviz with d3
            var graphviz = d3.select("#graph").graphviz();

            function render() {           
                dotSrc = source_to_dot(data)
                console.log('DOT source =', dotSrc);
                // dotSrcLines = dotSrc.split('\n');

                graphviz
                    .transition(function() {
                        return d3.transition()
                            .delay(10)
                            .duration(100);
                    })
                    // .width(width)
                    // .height(height)
                    // .fit(true)
                    // .scale(.8)
                    .attributer(attributer)
                    .renderDot(dotSrc)
                    .on("end", interactive);

                // console.log(graphviz.data())    
            }

            function interactive() {


                const searchInput = document.getElementById("searchbar");
                const searchButton = document.getElementById("searchButton");
    
                // Next, we need to listen for the click event on the search button:
                searchButton.addEventListener("click", handleSearch);
    
                // In the event handler function, we can get the value of the search input and log it to the console:
                function handleSearch() {

                    const searchTerm = searchInput.value;
                    console.log(searchTerm);
                    unode = []
                    dnode = []
                    
                    var current_nodes = []
                    for (const key of Object.keys(data.nodes)) { 
                        current_nodes.push(data.nodes[key].id)
                    } 
                    console.log(current_nodes)

                    if (!searchTerm) {
                        data = JSON.parse(event.target.result);
                        console.log(searchTerm)
                        render();
                    } else if (!current_nodes.includes(parseInt(searchTerm))) {
                      
                        render();
                        
                    } else  {
                        out = return_new_graph(data, parseInt(searchTerm))
                        data = out[0]
                        unode = out[1]
                        dnode = out[2]
                        render();  
                    
                    }
              
                    // });
            };
        };
            
        // const initial_data = data
        render(data);

        }; // reader.onload
        reader.readAsText(file);
    } catch (err) {
        console.error(err);
    }
}




