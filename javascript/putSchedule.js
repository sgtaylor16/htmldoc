

function sched_access({Name,Start,Finish}){
    //Function to convert string values from json into the proper type for D3
    return ({Name:Name , Start: new Date(Start) , Finish:new Date(Finish)});
}

function checkforMilestones(object){
    if(object.Account == 'Milestones'){
        return true;
    }else{
        return false;
    }
}

function checkforZeroDuration(object){
    if(object.Start.toDateString() == object.Finish.toDateString()){
        return true;
    }else{
        return false;
    }
}

function checkforTasks(object){
    ///If the start date is not equal to the end date assume return True
    if(object.Start.toDateString() != object.Finish.toDateString()){
        return true;
    }else{
        return false;
    }
}

function findAccounts(object){
    /* Find the unique values in an array of objects for the Account member
    Returns a list of the unique accounts */
    let flags = [], l = object.length, i,uniqueAccounts = [];

    for(i=0; i<l; i++){
        if( flags[object[i].Account]){
            continue;
        }else{
        flags[object[i].Account] = true;
        uniqueAccounts.push(object[i].Account);
        }
    }
    return uniqueAccounts
}

function filterOnOneAccount(Account,task){

    if(Account == task.Account){
        return true
    }else{
        return false
    }

}

function accountsFilter(data,AccountFilter){

    let outputarray = [];

    AccountFilter.forEach((Account) => {
        let temp = data.filter((task) => {
            return filterOnOneAccount(Account,task);
        })
        outputarray = outputarray.concat(temp);
    })
    return outputarray;
}

function makeSchedule(dataarray,{
                                divid='',
                                width = 1000,
                                height = 500,
                                schedStart = new Date('1/1/2023'),
                                schedEnd = new Date('1/1/26')
                                }){
    ///Function to make a generic schedule

    let svg = d3.select("div" + divid).append("svg")
                                    .attr("width",width)
                                    .attr("height",height)  //Select the svg element that all plotting will happen on.

    //Find the tasks with zero duration, they will be marked as diamond milestones
    let zerodur = dataarray.filter(checkforZeroDuration);

    //Find the tasks with > 0 duration, they will be marked as bars.
    let tasks = dataarray.filter(checkforTasks);

    //Calculate Rectangle heights

    //Get the height of the svg element

    let margin = {left:40,right:10,top:10,bottom:100}

    let fontsize = 14;

   
//#region Scales

    let schedScale = d3.scaleTime()
                    .domain([schedStart,schedEnd])
                    .range([margin.left,width - margin.right]);

    let timeAxis = d3.axisBottom()
                    .scale(schedScale)
                    .tickFormat(d3.timeFormat("%b %Y"))
                    .ticks(d3.timeMonth.every(1));

    let yScale = d3.scaleBand()
                    .domain(dataarray.map(d => d.Name))
                    .range([margin.top, height - margin.bottom]);

    const barheight = yScale.bandwidth();




//#endregion Scales

//#region Milestone Circles

    //Put in the Milestone Circles

    svg.selectAll("circle")
        .data(zerodur)
        .join("circle")
        .attr("cx",function(d,_i){
            return schedScale(d.Start);
        })
        .attr("cy",function(d,_i){
        return (yScale(d.Name) + barheight * 0.5)
        })
        .attr("r",5)
        

    svg.selectAll("text")
    .data(zerodur)
    .join("text")
    .text(function(d,_i){
        return d.Name
    })
    .attr("x",function(d,_i){
        return schedScale(d.Start) + 10;
    })
    .attr("y",function(d,_i){
        return (yScale(d.Name) + barheight * 0.5);
    })
    .attr("transform",function(d,_i){
        let cx = schedScale(d.Start);
        let cy = yScale(d.Name) + barheight * 0.5;
        return ('rotate(-25,'+ cx + ',' + cy + ')')
    })
    .style("text-anchor", "start")
    .attr("font-size",fontsize)



//#endregion

//#region Put in Rectangles
    svg.selectAll("rect")
        .data(tasks)
        .join("rect")
        .attr("x",function(d){
            return schedScale(d.Start);
        })
        .attr("y",function(d){
            return yScale(d.Name)
        })
        .attr("rx",barheight/4)
        .attr("width",function(d){
            return schedScale(d.Finish) - schedScale(d.Start);
        })
        .attr("height",barheight)
        .attr("fill",'lightblue')
        .attr("fill-opacity",0.7)


     svg.selectAll("text.tasks")
        .data(tasks)
        .join("text")
        .attr("class","tasks")
        .text(function(d,_i){
            return d.Name
        })
        .attr("x",function(d,_i){
            return (schedScale(d.Start)+5)
        })
        .attr("y",function(d,_i){
            return (yScale(d.Name) + 0.5 * barheight + 0.4 * fontsize)
        })
        .attr("font-size",fontsize)
        .attr("transform",function(d,_i){
            let duration= schedScale(d.Finish) - schedScale(d.Start);
            let cx = schedScale(d.Start);
            let cy = yScale(d.Name) + barheight * 0.5;
            if(duration< 95){
                return ('rotate(-15,'+ cx + ',' + cy + ')')
            }else{
                return ('rotate(0,0,0)')
            }
        });

//#endregion

//#region Put in date Axis

    let temp1 = height - margin.bottom;

    svg.append("g").call(timeAxis).attr("class","axis")
                    .attr("transform","translate(0," + temp1 + ")" )
                    .selectAll("text")
                    .attr("transform", "translate(-10,10)rotate(-45)")
                    .style("text-anchor", "end");

//#endregion

}


function makeHours(dataarray,{
    divid='',
    width=1000,
    height=500,
    ydata= d=>d.hours,
    schedStart = new Date('1/1/2023'),
    schedEnd = new Date('1/1/26'),
    datekey = '',
    maxhours=200,

}){
    //Function to make hours plot

    let keylist = Object.keys(dataarray[0]);
    const index = keylist.indexOf(datekey);
        if (index > -1) { // only splice array when item is found
        keylist.splice(index, 1); // 2nd parameter means remove one item only
        }
    let margin = {left:40,right:10,top:10,bottom:100};


                                    
    const stack = d3.stack()
                .keys(keylist);


    let areainput = stack(dataarray)

    let schedScale = d3.scaleTime()
                        .domain([schedStart,schedEnd])
                        .range([margin.left,width - margin.right]);

    let yScale = d3.scaleLinear()
                    .domain([0,maxhours])
                    .range([ height - margin.bottom,margin.top]);

    let colorScale = d3.scaleOrdinal()
                        .domain(keylist)
                        .range(d3.schemePastel1);                

    let areafunc = d3.area()
                    .x((d)=>schedScale(new Date(d.data['index'])))
                    .y0((d)=>yScale(d[0]))
                    .y1((d)=>yScale(d[1]))

    let timeAxis = d3.axisBottom()
                    .scale(schedScale)
                    .tickFormat(d3.timeFormat("%b %Y"))
                    .ticks(d3.timeMonth.every(1));

    let yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickValues([0,maxhours/2,maxhours]);

    makeLegend(colorScale,divid,1000)

    let svg = d3.select(divid).append("svg")
        .attr("width",width)
        .attr("height",height)

    svg.selectAll("path")
        .data(areainput)
        .join("path")
        .attr("d",areafunc)
        .attr("fill",d => colorScale(d.key))
        .attr("stroke",'white')

    //#region Put in date Axis

    let temp1 = height - margin.bottom;

    svg.append("g").call(timeAxis).attr("class","axis")
                    .attr("transform","translate(0," + temp1 + ")" )
                    .selectAll("text")
                    .attr("transform", "translate(-10,10)rotate(-45)")
                    .style("text-anchor", "end");

    svg.append("g").call(yAxis).attr("class","axis")
                    .attr("transform",`translate(30,0)`)        

    //#endregion

}

function makeLegend(colorscale,htmlelement,width,hstep=100){
    let svg = d3.select(htmlelement).append('svg').attr("width",width)
                .attr("height",40)

    
    const vstep = 20;
    const fontsize= 12;
    const rectwidth = 15
    

    let inds = colorscale.domain()

    svg.selectAll('rect')
        .data(inds)
        .join('rect')
        .attr('x',(d,i) => 10 + (i%6)*hstep)
        .attr('y',(d,i) => Math.floor(i/6) * vstep)
        .attr("height",10)
        .attr("width",rectwidth)
        .attr("fill",d=>{
            return colorscale(d)
        })

    svg.selectAll("text")
        .data(inds)
        .join('text')
        .attr('x',(d,i) => 10+ rectwidth+ (i%6)*hstep)
        .attr('y',(d,i) => Math.floor(i/6) * vstep)
        .attr('font-size',fontsize)
        .attr('fill','black')
        .attr('dominant-baseline','hanging')
        .text(d=>d)
}