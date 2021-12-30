/*---- GRAPHICING DATA --> CHART.JS LIBRARY ----*/
// API FOR GRAPHCING DATA USAGE
// BASE URL: https://short-url-snaplink.herokuapp.com (ORIGINAL)
const BASE_URL1 = 'http://www.snplnk.link';

(async function () {
    // FETCH DATA FROM API 
    const URLS_DATA_API = `${BASE_URL1}/v1/api/all`;
    await fetch(URLS_DATA_API)
        .then(response => response.json())
        .then(payload => {
            //let arr_block = [];
            const BLOCKED_LIST = payload.data['totalUsers'].map(user => user.isBlocked)
            const BLOCKED_COUNT = BLOCKED_LIST.filter(user => user === true);
            console.log(BLOCKED_COUNT.length)
            if (payload.status === 200) {
                // DATA GRAPCING LOGIC
                var ctx = document.getElementById('myChart');
                var myChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Total Urls', 'Total Clicks', 'Total Users', 'Total Blocked'],
                        datasets: [{
                            label: 'SnapLink Analytics',
                            data: [payload.data['urls'].length, payload.data['totalClick'], payload.data['totalUsers'].length, BLOCKED_COUNT.length],
                            backgroundColor: [
                                'hsl(210, 85%, 48%)',
                                'hsl(163, 83%, 54%)',
                                'hsl(223, 83%, 54%)',
                                'hsl( 0, 70%, 62%  )'
                            ],
                            fill: true,
                            /*borderColor: [
                                'rgb(75, 192, 192)'
                            ],*/
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else if (payload.status === 400) {
                alert(payload.data.msg)
            } else {
                alert('Something Went Wrong!')
                return;
            }
        });

})();

(async function () {
    // BASE URL
    //const BASE_URL2 = 'https://short-url-snaplink.herokuapp.com';
    // FETCH DATA FROM API 
    await fetch(`${BASE_URL1}/admin/api/urls-sources`)
        .then(response => response.json())
        .then(data => {
            // CHECK IF THE RESPONSE OK 200
            if (data.status === 200) {
                console.log(data.sources);
                const sources_body = document.getElementById('sources-body');
                data.sources.map((source, index) => {
                    const row = document.createElement('tr');
                    const td1 = document.createElement('td');
                    const td2 = document.createElement('td');
                    const td3 = document.createElement('td');
                    // URL HOSTNAME
                    const domain = new URL(source);
                    const host = domain.hostname.replace('www.', '');
                    const url_tag = host.replace('.com', '');
                    // ATTACH THE ICON SNAPLINK IF THE SOURCE IS www.snaplink.com (example)

                    td1.innerHTML = index++;
                    td2.innerHTML = `<span class="url_source"><a href="${source}" target="_blank" style="text-decoration: none;">${source}</span>`;
                    td3.innerHTML = `<span class="url_tag">${url_tag} <i class="bx bxl-${url_tag === 'snaplink' ? 'react' : url_tag === 'l.facebook' ? 'facebook' : url_tag}"></i></span>`;
                    row.append(td1);
                    row.append(td2);
                    row.append(td3);
                    sources_body.append(row);
                });

            } else if (data.status === 400) {
                alert(data.response);
            } else {
                return;
            }
        })
})();


var ctx = document.getElementById('ads-chart-pie');
var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Total Urls', 'Total Clicks', 'Total Users', 'Total Blocked'],
        datasets: [{
            label: 'SnapLink Analytics',
            data: [13, 329, 34, 2],
            backgroundColor: [
                'hsl(210, 85%, 48%)',
                'hsl(163, 83%, 54%)',
                'hsl(223, 83%, 54%)',
                'hsl( 0, 70%, 62%  )'
            ],
            fill: true,
            /*borderColor: [
                'rgb(75, 192, 192)'
            ],*/
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            },
            x: {
                beginAtZero: true
            }
        }
    }
});