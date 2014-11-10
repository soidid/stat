var q = require('q'),
    http = require('http'),
    fs = require('fs');

function getData(path){
    var deferred = q.defer();
    var url = 'data/'+path+'.json';
    fs.readFile(url, 'utf8', function (err, data) {
       if (err) throw err;
       obj = JSON.parse(data);
       deferred.resolve(obj);
    });

    return deferred.promise;
};
function timeConverter(UNIX_timestamp){
     var a = new Date(UNIX_timestamp);
     //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     //var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
     //var time = year+'-'+month+'-'+(date<10?'0':'')+date;
     var time = year+'-'+month+'-'+(date<10?'0':'')+date+', '+hour+':'+(min<10?'0':'')+min+':'+(sec<10?'0':'')+sec ;
     return time;
};
function timeConverterToDate(UNIX_timestamp){
     var a = new Date(UNIX_timestamp);
     //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     //var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
     //var time = year+'-'+month+'-'+(date<10?'0':'')+date;
     var time = month+'-'+(date<10?'0':'')+date;
     return time;
};
var data = {};
getData('signatures').then(function(signatures){
    var count = 0;
    for(var qkey in signatures){
        for(var uid in signatures[qkey]){
            var obj = {};

            obj.timestamp = signatures[qkey][uid].timestamp;
            obj.qid = qkey;
            obj.uid = uid;

            if(!data[uid])
               data[uid] = [];

            data[uid].push(obj);

            //console.log(signatures[qkey][uid].timestamp);
            count++;
        }
    }

    /* Push into a smaller/statistic dataset */

    var stat = [];

    for(var key in data){
      data[key].sort(function(a,b){
          return a.timestamp - b.timestamp;
      });
      var statObj = {};

      var count = data[key].length;
      //statObj.uid = key;
      statObj.count = data[key].length;
      statObj.timestamp = data[key][count-1].timestamp;

      if(statObj.timestamp >= 1404144000000)//only draw after 7/1
         stat.push(statObj);

    }

    stat.sort(function(a,b){
          return a.timestamp - b.timestamp;
    });

    //console.log(data);
    //console.log(stat);


    /* check how many users qualified to have the coupon */

    var checkpoint = 1415268000000;//timestamp of 11.06 18:00 GMT+8 in milliseconds

    var c_count = 0;
    for(var key in stat){
        if(parseInt(stat[key].timestamp) >= checkpoint)
           c_count++;
    }

    console.log("We have "+c_count+" users have signed since "+timeConverter(checkpoint));

    //Save to json
    fs.writeFile("data/data.json", JSON.stringify(data), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(" - File saved : data.");

        }
    });

    //Save to json
    fs.writeFile("stat.json", JSON.stringify(stat), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(" - File saved : stat.");

        }
    });


});


