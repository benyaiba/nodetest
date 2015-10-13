var l = ['e', 'j', 'c', 'f']
var p = ['j','y','b','d']


function exhaustive(){
    var map = {
        "j" : random2Arr(),
        "y": random2Arr(),
        "b": random2Arr(),
        "d": random(4)

    }

    var count = 0;
    var flag = false;
    for(var i =0;i<4;i++){
        count = 0;
        if(map.j.indexOf(i) != -1){
            count++;
        }
        if(map.y.indexOf(i) != -1){
            count++;
        }
        if(map.b.indexOf(i) != -1){
            count++;
        }
        if(map.d == i){
            count++;
        }
        if(count >= 3){
            flag = true;
            break;
        }
    }
    if(flag === false){
        console.log("condition 1 NG");
        return;
    }


    if(map.j.indexOf(1) == -1){
        console.log("condition 2 NG");
        return;
    }
    if(map.d == 1){
        console.log("condition 2 NG");
        return;
    }
    if(map.y.indexOf(0) != -1){
        console.log("condition 2 NG");
        return;
    }

    if(map.b.indexOf(map.j[0]) != -1 || map.b.indexOf(map.j[1]) != -1){
        console.log("condition 3 aaaaa NG");
        return;
    }
    if(map.y.indexOf(map.b[0]) == -1 && map.y.indexOf(map.b[1]) == -1){
        console.log("condition 3 bbbbb  NG");
        return;
    }
    if(map.b.indexOf(map.d) != -1){
        console.log("condition 3 cccccc NG");
        return;
    }

    if(map.j.indexOf(1) !=-1 && map.j.indexOf(3) !=-1){
//        console.log(map);
        console.log("condition 4 aaaa NG");
        return;
    }
    if(map.y.indexOf(1) !=-1 && map.y.indexOf(3) !=-1){
//        console.log(map);
        console.log("condition 4 bbbb NG");
        return ;
    }
    if(map.b.indexOf(1) !=-1 && map.b.indexOf(3) !=-1){
//        console.log(map);
        console.log("condition 4 ccccc NG");
        return ;
    }

    console.log(map)
    return true;
}


function random2Arr(){
    var i = random(4);
    var j = null;
    while((j = random(4)) == i){
    }
    return [i,j];
}

function random(max){
    return parseInt(Math.random(max) * 4,10);
}

function main(){
    while(exhaustive() !== true){
    }
}

main();