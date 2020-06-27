var data = [];
var countries;
var progress = 0;
var lonks = 0;
var tcase;
var ncase;
var tdeath;
var ndeath;
var recov;
var page = 'overview';
var overviewCountry = 'USA';
var historyCountry = 'USA';
var dateChanged = true;
var countryChanged = true;



//get list of countries for the dropdown menu
fetch("https://covid-193.p.rapidapi.com/countries", {
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
    }
})
    .then(response => response.json()).then(json => {
    countries = Object.values(json.response)
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
    getCurrent();
})

//raw function to get historical results
function getHistory(country, date)
{
    fetch("https://covid-193.p.rapidapi.com/history?day=" + date + "&country=" + country, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "covid-193.p.rapidapi.com",
                "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
            }
        }).then(response => response.json()).then(json => {

        if (json.response[0] != null)
        {
            data.push(json.response[0])
        }

        progress += 1;
        console.clear()
        console.log(progress + "/" + lonks);
        document.getElementById('loadingprogress').innerHTML = progress + "/" + lonks;
        if (progress == lonks)
        {
            console.clear()
            document.getElementById('loadingbackground').style.visibility = "hidden";
            data.sort(function(a, b) {
                return new Date(a.day) - new Date(b.day);
            });
            console.clear();
            console.log('Data from dates selected:')
            console.log(data)
            fillTable();
            createCharts();
        }
    })
}

//raw function to get current results, uses history api call but just read index 0 of the results for the latest stats
function getCurrent()
{
    fetch("https://covid-193.p.rapidapi.com/history?day=" + getCurrentDate() + "&country=" + document.getElementById('country').value, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "covid-193.p.rapidapi.com",
            "x-rapidapi-key": "6c9f272afdmsh12c0f638d9d580dp172cbbjsn64f858938aa0"
        }
    }).then(response => response.json()).then(json => {
        console.clear();
        console.log('Current data for entire day, latest entry 0:');
        console.log(json);
        document.getElementById('overviewCases').innerHTML = json.response[0].cases.total;
        document.getElementById('overviewNew').innerHTML = json.response[0].cases.new;
        document.getElementById('overviewActive').innerHTML = json.response[0].cases.active;
        document.getElementById('overviewP1M').innerHTML = json.response[0].cases['1M_pop'];
        document.getElementById('overviewRecover').innerHTML = json.response[0].cases.recovered;
        document.getElementById('overviewTitle').innerHTML = 'Current Statistics of ' + overviewCountry
    })
}

//returns the current date in yyy-mm-dd format
function getCurrentDate()
{
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    return today
}

//interface function for getHistory, calling and recording each individual function call
function totalResults(date1, date2, country)
{
    data.length = 0;
    if (country != '' && (countryChanged || !tcase || dateChanged))
    {
        countryChanged = false;
        dateChanged = false;
        document.getElementById('loadingbackground').style.visibility = "visible";
        var dates = getDates(date1, date2);
        lonks = dates.length;
        progress = 0;
        document.getElementById('loadingprogress').innerHTML = "0/" + lonks;
        for (var i = 0; i < dates.length; i++)
        {
            getHistory(country, dates[i])
        }
    }
    else
    {
        alert("No fields have been changed, to reduce network use your request has been blocked")
    }
}

function fillTable()
{
    document.getElementById("rawvals").innerHTML = "";
    for (var i = 0; i < data.length; i++)
    {
        var table = document.getElementById('rawvals')
        var row = table.insertRow(0);

        var cell0 = row.insertCell(0);
        cell0.innerHTML = data[i].day.substr(2, 9);
        cell0.style.fontFamily = 'Montserrat';
        cell0.style.textAlign = 'center';

        var cell1 = row.insertCell(1);
        cell1.innerHTML = data[i].cases.total;
        cell1.style.fontFamily = 'Montserrat';
        cell1.style.textAlign = 'center';

        var cell2 = row.insertCell(2);

        if (data[i].cases.new != null)
        {
            cell2.innerHTML = data[i].cases.new;
            cell2.style.fontFamily = 'Montserrat';
            cell2.style.textAlign = 'center';
        }
        else
        {
            cell2.innerHTML = '0';
            cell2.style.fontFamily = 'Montserrat';
            cell2.style.textAlign = 'center';
        }


        var cell3 = row.insertCell(3);
        cell3.innerHTML = data[i].deaths.total;
        cell3.style.fontFamily = 'Montserrat';
        cell3.style.textAlign = 'center';

        var cell4 = row.insertCell(4);
        if (data[i].deaths.new != null)
        {
            cell4.innerHTML = data[i].deaths.new;
            cell4.style.fontFamily = 'Montserrat';
            cell4.style.textAlign = 'center';
        }
        else
        {
            cell4.innerHTML = '0';
            cell4.style.fontFamily = 'Montserrat';
            cell4.style.textAlign = 'center';
        }

        var cell5 = row.insertCell(5);
        cell5.innerHTML = data[i].cases.recovered;
        cell5.style.fontFamily = 'Montserrat';
        cell5.style.textAlign = 'center';
    }
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        var toPush = currentDate.getFullYear();
        if (currentDate.getMonth() < 10)
        {
            toPush = toPush + "-0" + (currentDate.getMonth() + 1);
        }
        else
        {
            toPush = toPush + "-" + (currentDate.getMonth() + 1);
        }

        if (currentDate.getDate() < 10)
        {
            toPush = toPush + "-0" + currentDate.getDate();
        }
        else
        {
            toPush = toPush + "-" + currentDate.getDate();
        }
        dateArray.push(toPush)
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
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
        if (data[i].cases.total != null)
        {
            tcasesy.push(data[i].cases.total);
        }
        else
        {
            tcasesy.push(0)
        }

        if (data[i].deaths.total != null)
        {
            tdeathy.push(data[i].deaths.total);
        }
        else
        {
            tdeathy.push(0)
        }

        if (data[i].deaths.new != null)
        {
            ndeathy.push(data[i].deaths.new);
        }
        else
        {
            ndeathy.push(0)
        }

        if (data[i].cases.new != null)
        {
            ncasesy.push(data[i].cases.new);
        }
        else
        {
            ncasesy.push(0)
        }

        if (data[i].cases.recovered != null)
        {
            recovery.push(data[i].cases.recovered);
        }
        else
        {
            recovery.push(0)
        }

        x.push(data[i].day);
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
                borderColor: 'rgb(239,114,21)',
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
                borderColor: 'rgb(255,33,32)',
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
                borderColor: 'rgb(0,155,255)',
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
                borderColor: 'rgb(69,69,69)',
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

function overview()
{
    document.getElementById('country').value = overviewCountry;
    page = 'overview';
    document.getElementById('date1').style.visibility = 'hidden';
    document.getElementById('date2').style.visibility = 'hidden';
    document.getElementById('dash').style.visibility = 'hidden';
    document.getElementById('overviewcontainer').style.visibility = 'visible';
    document.getElementById('tablecontainer').style.visibility = 'hidden';
    document.getElementById('chartcontainer').style.visibility = 'hidden';
    document.getElementById('overview').style.color = 'white';
    document.getElementById('overview').style.backgroundColor = 'dodgerblue';
    document.getElementById('history').style.color = 'black';
    document.getElementById('history').style.backgroundColor = 'lightgrey';
}

function history()
{
    document.getElementById('country').value = historyCountry;
    page = 'history';
    document.getElementById('date1').style.visibility = 'visible';
    document.getElementById('date2').style.visibility = 'visible';
    document.getElementById('dash').style.visibility = 'visible';
    document.getElementById('overviewcontainer').style.visibility = 'hidden';
    document.getElementById('tablecontainer').style.visibility = 'visible'
    document.getElementById('chartcontainer').style.visibility = 'visible'
    document.getElementById('overview').style.color = 'black';
    document.getElementById('overview').style.backgroundColor = 'lightgrey';
    document.getElementById('history').style.color = 'white';
    document.getElementById('history').style.backgroundColor = 'dodgerblue';
}

function getData()
{
    if (page == 'history')
    {
        totalResults(new Date(document.getElementById('date1').value), new Date(document.getElementById('date2').value), document.getElementById('country').value);
    }
    else if (page == 'overview')
    {
        getCurrent();
    }
}

function changeCountry()
{
    if (page == 'history')
    {
        countryChanged = true;
        historyCountry = document.getElementById('country').value;
    }
    else if (page == 'overview')
    {
        overviewCountry = document.getElementById('country').value;
    }
}