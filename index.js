//overall data to be filled by history call
var data = [];

//future use as a cache for values to reduce number of downloads
//var cache = {};

//list ouf countries for the dropdown menu
var countries;

//graphs store location for clearancea after each use
var tcase;
var ncase;
var tdeath;
var ndeath;
var recov;
var multipass;

//for use when determining what page is open
var page = 'overview';

//get list of countries for the dropdown menu
fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/affected.php", {
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
    }
}).then(response => response.json()).then(json =>
{
    countries = json.affected_countries
    countries.sort()
    for (var i = 0; i < countries.length; i++)
    {
        var x = document.getElementById("country");
        var option = document.createElement("option");
        option.text = countries[i];
        option.id = 'dropdown';
        option.style.fontFamily = "'Montserrat', sans-serif";
        x.add(option, x[x.length]);
    }
    document.getElementById('country').value = 'USA';
    getData()
})

//raw function to get current results, gets latest stats and fills relevant headers with data
function getCurrent()
{
    fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=" + document.getElementById('country').value, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
            "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
        }
    }).then(response => response.json()).then(json => {
        console.log('current data for country');
        console.log(json);
        document.getElementById('overviewCases').innerHTML = json.latest_stat_by_country[0].total_cases;
        if (json.latest_stat_by_country[0].new_cases == "")
        {
            document.getElementById('overviewNew').innerHTML = '0';
        }
        else
        {
            document.getElementById('overviewNew').innerHTML = json.latest_stat_by_country[0].new_cases;
        }
        document.getElementById('overviewActive').innerHTML = json.latest_stat_by_country[0].active_cases;
        document.getElementById('overviewP1M').innerHTML = json.latest_stat_by_country[0].total_cases_per1m;
        document.getElementById('overviewRecover').innerHTML = json.latest_stat_by_country[0].total_recovered;
        document.getElementById('overviewTitle').innerHTML = 'Current Statistics of ' + document.getElementById('country').value
    })
}

//get all past history on the country currently selected excluding current date, fills the data array, then calls charts and tables on completion
function getHistory()
{
    data.length = 0;
    fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_particular_country.php?country=" + document.getElementById('country').value, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
            "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
        }
    }).then(response => response.json()).then(json => {

        for (var i = (json.stat_by_country.length - 1); i > 0; i--)
        {
           if (json.stat_by_country[i].record_date.substr(0, 10) !== json.stat_by_country[i - 1].record_date.substr(0, 10))
           {
               data.push(json.stat_by_country[i])
           }
        }
        console.log('all historical data for country');
        console.log(data)
        fillTable();
        createCharts();
        Multigraph(document.getElementById('tccheck').checked, document.getElementById('nccheck').checked, document.getElementById('tdcheck').checked, document.getElementById('ndcheck').checked, document.getElementById('trcheck').checked);
    })
}

//clears table then populates with contents of data array
function fillTable()
{
    document.getElementById("rawvals").innerHTML = "";
    for (var i = 0; i < data.length; i++)
    {
        var table = document.getElementById('rawvals')
        var row = table.insertRow(0);

        var cell0 = row.insertCell(0);
        cell0.innerHTML = data[i].record_date.substr(0, 10);
        cell0.style.fontFamily = 'Roboto Mono';
        cell0.style.textAlign = 'center';
        cell0.style.fontSize = '.85vw';

        var cell1 = row.insertCell(1);
        cell1.innerHTML = data[i].total_cases;
        cell1.style.fontFamily = 'Roboto Mono';
        cell1.style.textAlign = 'center';
        cell1.style.fontSize = '1vw';

        var cell2 = row.insertCell(2);

        if (data[i].new_cases != "")
        {
            cell2.innerHTML = data[i].new_cases;
            cell2.style.fontFamily = 'Roboto Mono';
            cell2.style.textAlign = 'center';

        }
        else
        {
            cell2.innerHTML = '0';
            cell2.style.fontFamily = 'Roboto Mono';
            cell2.style.textAlign = 'center';
        }
        cell2.style.fontSize = '1vw';

        if (i !== 0 && (parseInt(data[i].new_cases.replace(/,/g,"")) || 0) < (parseInt(data[i - 1].new_cases.replace(/,/g,"")) || 0))
        {
            cell2.style.background = 'rgb(145,194,151)'
        }
        else if (i !== 0 && (parseInt(data[i].new_cases.replace(/,/g,"")) || 0) > (parseInt(data[i - 1].new_cases.replace(/,/g,"")) || 0))
        {
            cell2.style.background = 'rgb(255,147,154)'
        }

        var cell3 = row.insertCell(3);
        cell3.innerHTML = data[i].total_deaths;
        cell3.style.fontFamily = 'Roboto Mono';
        cell3.style.textAlign = 'center';
        cell3.style.fontSize = '1vw';

        var cell4 = row.insertCell(4);
        if (data[i].new_deaths != "")
        {
            cell4.innerHTML = data[i].new_deaths;
            cell4.style.fontFamily = 'Roboto Mono';
            cell4.style.textAlign = 'center';
        }
        else
        {
            cell4.innerHTML = '0';
            cell4.style.fontFamily = 'Roboto Mono';
            cell4.style.textAlign = 'center';
        }
        if (i !== 0 && (parseInt(data[i].new_deaths.replace(/,/g,"")) || 0) < (parseInt(data[i - 1].new_deaths.replace(/,/g,"")) || 0))
        {
            cell4.style.background = 'rgb(145,194,151)'
        }
        else if (i !== 0 && (parseInt(data[i].new_deaths.replace(/,/g,"")) || 0) > (parseInt(data[i - 1].new_deaths.replace(/,/g,"")) || 0))
        {
            cell4.style.background = 'rgb(255,147,154)'
        }
        cell4.style.fontSize = '1vw';

        var cell5 = row.insertCell(5);
        cell5.innerHTML = data[i].total_recovered;
        cell5.style.fontFamily = 'Roboto Mono';
        cell5.style.textAlign = 'center';
        cell5.style.fontSize = '1vw';
    }
}

function createCharts()
{
    x = [];
    var tcasesy = [];
    var ncasesy = [];
    var tdeathy = [];
    var ndeathy = [];
    var recovery = [];
    for (var i = 0; i < data.length; i++)
    {
        x.push(data[i].record_date.substr(0, 10));

        if (data[i].total_cases != "")
        {
            tcasesy.push(data[i].total_cases.replace(/,/g,""));
        }
        else
        {
            tcasesy.push(0)
        }

        if (data[i].total_deaths != "")
        {
            tdeathy.push(data[i].total_deaths.replace(/,/g,""));
        }
        else
        {
            tdeathy.push(0)
        }

        if (data[i].new_deaths != "")
        {
            ndeathy.push(data[i].new_deaths.replace(/,/g,""));
        }
        else
        {
            ndeathy.push(0)
        }

        if (data[i].new_cases != "")
        {
            ncasesy.push(data[i].new_cases.replace(/,/g,""));
        }
        else
        {
            ncasesy.push(0)
        }

        if (data[i].total_recovered != "")
        {
            recovery.push(data[i].total_recovered.replace(/,/g,""));
        }
        else
        {
            recovery.push(0)
        }
    }

    if (tcase)
    {
        tcase.destroy();
        ncase.destroy();
        tdeath.destroy();
        ndeath.destroy();
        recov.destroy();
    }

    var totalCases = document.getElementById('totalCases').getContext('2d');
    tcase = new Chart(totalCases, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: [{
                label: 'Total Cases',
                borderColor: 'rgb(239,85,0)',
                data: tcasesy
            }]
        },

        // Configuration options go here
        options: {}
    });


    var newCases = document.getElementById('newCases').getContext('2d');
    ncase = new Chart(newCases, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: [{
                label: 'New Cases per Day',
                borderColor: 'rgb(255,6,0)',
                data: ncasesy
            }]
        },

        // Configuration options go here
        options: {}
    });

    var totalDeaths = document.getElementById('totalDeaths').getContext('2d');
    tdeath = new Chart(totalDeaths, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: [{
                label: 'Total Deaths',
                borderColor: 'rgb(95,93,93)',
                data: tdeathy
            }]
        },

        // Configuration options go here
        options: {}
    });

    var newDeaths = document.getElementById('newDeaths').getContext('2d');
    ndeath = new Chart(newDeaths, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: [{
                label: 'New Deaths per Day',
                borderColor: 'rgb(47,47,47)',
                data: ndeathy
            }]
        },

        // Configuration options go here
        options: {}
    });

    var recovered = document.getElementById('recovered').getContext('2d');
    recov = new Chart(recovered, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: [{
                label: 'Recovered Cases',
                borderColor: 'rgb(1,162,99)',
                data: recovery
            }]
        },

        // Configuration options go here
        options: {}
    });
}

//overview and history control page switching niceties
function overview()
{
    page = 'overview';

    document.getElementById('overviewcontainer').style.visibility = 'visible';
    document.getElementById('tablecontainer').style.visibility = 'hidden';
    document.getElementById('chartcontainer').style.visibility = 'hidden';
    document.getElementById('graphcontainer').style.visibility = 'hidden'
    document.getElementById('overview').style.color = 'white';
    document.getElementById('overview').style.backgroundColor = '#23395d';
    document.getElementById('history').style.color = 'black';
    document.getElementById('history').style.backgroundColor = 'lightgrey';
    document.getElementById('graphing').style.color = 'black';
    document.getElementById('graphing').style.backgroundColor = 'lightgrey';
}
function history()
{
    page = 'history';

    document.getElementById('overviewcontainer').style.visibility = 'hidden';
    document.getElementById('tablecontainer').style.visibility = 'visible'
    document.getElementById('chartcontainer').style.visibility = 'visible'
    document.getElementById('graphcontainer').style.visibility = 'hidden'
    document.getElementById('overview').style.color = 'black';
    document.getElementById('overview').style.backgroundColor = 'lightgrey';
    document.getElementById('history').style.color = 'white';
    document.getElementById('history').style.backgroundColor = '#23395d';
    document.getElementById('graphing').style.color = 'black';
    document.getElementById('graphing').style.backgroundColor = 'lightgrey';
}
function graphing()
{
    page = 'graphing';

    document.getElementById('overviewcontainer').style.visibility = 'hidden';
    document.getElementById('tablecontainer').style.visibility = 'hidden'
    document.getElementById('chartcontainer').style.visibility = 'hidden'
    document.getElementById('graphcontainer').style.visibility = 'visible'
    document.getElementById('overview').style.color = 'black';
    document.getElementById('overview').style.backgroundColor = 'lightgrey';
    document.getElementById('history').style.color = 'black';
    document.getElementById('history').style.backgroundColor = 'lightgrey';
    document.getElementById('graphing').style.color = 'white';
    document.getElementById('graphing').style.backgroundColor = '#23395d';

}

//here as futureproofing for caching value so it can check if data is already stored or not.
function getData()
{
    getCurrent();
    getHistory();

    //possibly used for cacheing values in the future to reduce network traffic
    /*if (cache.hasOwnProperty(document.getElementById('country').value))
    {
        console.log(cache[document.getElementById('country').value])
        data = cache[document.getElementById('country').value]
        fillTable();
        createCharts();
    }
    else
    {
        getHistory();
    }*/
}

function Multigraph(tcase, ncase, tdeath, ndeath, recover, activec)
{
    if (multipass)
    {
        multipass.destroy();
    }

    x = [];
    var tcasesy = [];
    var ncasesy = [];
    var tdeathy = [];
    var ndeathy = [];
    var recovery = [];
    var active = [];

    //fills the arrays of values
    for (var i = 0; i < data.length; i++)
    {
        x.push(data[i].record_date.substr(0, 10));

        if (data[i].total_cases != "")
        {
            tcasesy.push(data[i].total_cases.replace(/,/g,""));
        }
        else
        {
            tcasesy.push(0)
        }

        if (data[i].total_deaths != "")
        {
            tdeathy.push(data[i].total_deaths.replace(/,/g,""));
        }
        else
        {
            tdeathy.push(0)
        }

        if (data[i].new_deaths != "")
        {
            ndeathy.push(data[i].new_deaths.replace(/,/g,""));
        }
        else
        {
            ndeathy.push(0)
        }

        if (data[i].new_cases != "")
        {
            ncasesy.push(data[i].new_cases.replace(/,/g,""));
        }
        else
        {
            ncasesy.push(0)
        }

        if (data[i].total_recovered != "")
        {
            recovery.push(data[i].total_recovered.replace(/,/g,""));
        }
        else
        {
            recovery.push(0)
        }

        if (data[i].active_cases != "")
        {
            active.push(data[i].active_cases.replace(/,/g,""));
        }
        else
        {
            active.push(0)
        }
    }

    //sets which elements are to be graphed based on the arguments passed in
    var tochart = [];
    if (tcase)
    {
        tochart.push({
                label: 'Total Cases',
                borderColor: 'rgb(239,154,1)',
                data: tcasesy
            });
    }
    if (ncase)
    {
        tochart.push({
                label: 'New Cases',
                borderColor: 'rgb(239,0,1)',
                data: ncasesy
            });
    }
    if (tdeath)
    {
        tochart.push({
                label: 'Total Deaths',
                borderColor: 'rgb(128,128,129)',
                data: tdeathy
            });
    }
    if (ndeath)
    {
        tochart.push({
                label: 'New Deaths',
                borderColor: 'rgb(0,0,0)',
                data: ndeathy
            });
    }
    if (recover)
    {
        tochart.push({
                label: 'Total Recovered',
                borderColor: 'rgb(91,239,91)',
                data: recovery
            });
    }
    if (activec)
    {
        tochart.push({
            label: 'Active Cases',
            borderColor: 'rgb(53,121,223)',
            data: active
        });
    }

    var multigraph = document.getElementById('multigraph').getContext('2d');
    multipass = new Chart(multigraph, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x,
            datasets: tochart
        },

        // Configuration options go here
        options: {
            maintainAspectRatio: false,
        }
    });
}