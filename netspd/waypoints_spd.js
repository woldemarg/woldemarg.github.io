function text_color(id, color){
                            d3.select("#"+id)
                            .transition().duration(250)
                            .style('color', color);   
      }

function switch_colors(dir, id1, id2){

        if(dir === "down"){
            text_color(id1, '#ddd')
            text_color(id2, "#444")                              
       } else {
            text_color(id1, "#444")
            text_color(id2, "#ddd") 
       }

    } 

var wp_filterNet = new Waypoint({
        element: document.getElementById('filterNet'),
        handler: function(dir){
             switch_colors(dir, 'filterNet', 'keepScrolling');
                     if(dir === "down"){ graph.filterNet();}
            
                  },
        offset: 60
    });

var wp_keepScrolling = new Waypoint({
        element: document.getElementById('keepScrolling'),
        handler: function(dir){
             switch_colors(dir, 'keepScrolling', 'lastMonth');
                       if(dir === "down"){graph.changeClass("lm");}            
                  },
        offset: 60
    });

var wp_lastMonth = new Waypoint({
        element: document.getElementById('lastMonth'),
        handler: function(dir){          
                   switch_colors(dir, 'lastMonth', 'tenderAvoid');
                if(dir === "down"){graph.changeClass("ta");}
                  },
        offset: 60
    });

var wp_tenderAvoid = new Waypoint({
        element: document.getElementById('tenderAvoid'),
        handler: function(dir){          
                   switch_colors(dir, 'tenderAvoid', 'familyContract');
                if(dir === "down"){graph.changeClass("fc");}
                  },
        offset: 60
    });
var wp_familyContract = new Waypoint({
        element: document.getElementById('familyContract'),
        handler: function(dir){          
                   switch_colors(dir, 'familyContract', 'strongCollaboration');
            if(dir === "down"){graph.changeClass("sc");}
                  },
        offset: 60
    });
var wp_strongCollaboration = new Waypoint({
        element: document.getElementById('strongCollaboration'),
        handler: function(dir){          
                   switch_colors(dir, 'strongCollaboration', 'strangeTransactions');
            if(dir === "down"){graph.changeClass("st");}
                  },
        offset: 60
    });
var wp_strangetransactions = new Waypoint({
        element: document.getElementById('strangeTransactions'),
        handler: function(dir){          
                   switch_colors(dir, 'strangeTransaction', 'restoreNet');
               if(dir === "down"){graph.restoreNet(); }
                  },
        offset: 60
    });
