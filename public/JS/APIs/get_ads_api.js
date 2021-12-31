// URL ENDPOINTS - BASE URL
const BASE_URL = "https://www.snplnk.link";
const API_URL = `${BASE_URL}${atob('L2FkbWluL2FwaS92MS9hZHM=')}`;

//GET DOM ELEMENTS 
const ads_body_row = document.getElementById('ads_body_row');
// GET REQUEST FUNCTION
(async function () {
    await fetch(API_URL).then(res => res.json())
        .then(payload_data => {
            if (payload_data.confirmation) {
                //console.log(payload_data) - TESTED 100%
                payload_data.ads_banners.map(ad => {

                    // CREATE NEW DOM ELEMENTS
                    const ads_row = document.createElement('tr');
                    const ad_col1 = document.createElement('td');
                    const ad_col2 = document.createElement('td');
                    const ad_col3 = document.createElement('td');
                    const ad_col4 = document.createElement('td');
                    const ad_col5 = document.createElement('td');
                    const ad_col6 = document.createElement('td');
                    const ad_col7 = document.createElement('td');
                    const ad_col8 = document.createElement('td');
                    const banner_img = document.createElement('img');
                    const link = document.createElement('a');
                    link.href = ad.url;
                    banner_img.setAttribute('width', '55px');
                    banner_img.setAttribute('height', '55px');
                    banner_img.setAttribute('class', 'bnr-rounded');
                    link.setAttribute('target', '_blank');
                    banner_img.src = ad.banner;
                    link.append(banner_img);
                    console.log(link)
                    // APPEND CONTENT TO  NEW DOM ELEMENTS 
                    ad_col1.innerHTML = ad.title;
                    ad_col2.innerHTML = `$${ad.budget}`;
                    ad_col3.innerHTML = ad.period;
                    ad_col4.innerHTML = ad.clicks;
                    ad_col5.innerHTML = ad.owner;
                    ad_col6.append(link);
                    ad_col6.setAttribute('class', 'ad_banner');
                    ad_col7.innerHTML = "<span class='badge badge-rounded'>Active</span>";
                    ad_col8.innerHTML = "<div class='actions-wrapper'><span class='reject-icon-wrapper' ad-id='12345'><i class='bx bx-x'></i></span>  <span class='approve-icon-wrapper' ad-id='12345'><i class='bx bx-check-double' ></i></span></div>"
                    // APPEND COLUMNS ELEMENTS TO THE ADS_ROW
                    ads_row.append(ad_col1);
                    ads_row.append(ad_col2);
                    ads_row.append(ad_col3);
                    ads_row.append(ad_col4);
                    ads_row.append(ad_col5);
                    ads_row.append(ad_col6);
                    ads_row.append(ad_col7);
                    ads_row.append(ad_col8);
                    // APPEND THE ADS ROW TO ROOT TABLE
                    ads_body_row.append(ads_row);
                })
            } else if (payload_data.status === 400) {
                alert(payload_data.msgError);
            } else {
                alert('Something Went Wrong :(');
            }
        })
})();

// GET ALL PENDING SUBSCRIPTIONS PLANS 
// GET DOM TARGETS ELEMENTS
const pending_ads_row = document.getElementById('pending_ads_body_row');

// GET REQUEST TO: /api/v1/pending_plans
const API_ENDPOINT = `${BASE_URL}${atob('L2FkbWluL2FwaS92MS9wZW5kaW5nX3BsYW5z')}`;
(async function () {
    // TRANSMIT GET REQUEST
    await fetch(API_ENDPOINT).then(res => res.json())
        .then(data => {
            if (data.status === 200) {
                // LOOP THROUGH EVERY OBJECT 
                // CHECK IF NOT PENDING COMPAIGN FOUND 
                if (!data.pending_compaigns || data.pending_compaigns === undefined || data.pending_compaigns === null) {
                    pending_ads_row.innerText = "No Pending Compaign Found!";
                    alert('No Pending Compaign Found!');
                    return;
                }
                data.pending_compaigns.map(pen_compaign => {
                    console.log(pen_compaign);
                    // CREATE NEW DOM ELEMENTS
                    // CREATE ROWS DOM ELEMENTS
                    const pending_plans_row = document.createElement('tr');
                    const ad_col1 = document.createElement('td');
                    const ad_col2 = document.createElement('td');
                    const ad_col3 = document.createElement('td');
                    const ad_col4 = document.createElement('td');
                    const ad_col5 = document.createElement('td');
                    const ad_col6 = document.createElement('td');
                    const ad_col7 = document.createElement('td');
                    const ad_col8 = document.createElement('td');
                    //CREATE SPANS DOM ELEMENTS
                    const span1 = document.createElement('span');
                    const span2 = document.createElement('span');
                    const span3 = document.createElement('span');
                    const span4 = document.createElement('span');
                    const span5 = document.createElement('span');
                    const span6 = document.createElement('span');
                    const span7 = document.createElement('span');
                    // SET ATTRIBUTES TO SPECIFIC SPAN ELEMENT
                    span1.setAttribute('class', 'compaign-title');
                    span2.setAttribute('class', 'compaign-budget');
                    span3.setAttribute('class', 'compaign-period');
                    span4.setAttribute('class', 'compaign-owner');
                    span5.setAttribute('class', 'compaign-email');
                    span6.setAttribute('class', 'compaign-status');
                    span7.setAttribute('class', 'compaign-banner');
                    // APPEND NEW DYNAMIC CONTENT
                    span1.innerHTML = pen_compaign['title'];
                    span2.innerHTML = `$${pen_compaign['budget']}`;
                    span3.innerHTML = pen_compaign['period'];
                    span4.innerHTML = pen_compaign['owner']
                    span5.innerHTML = pen_compaign['e_mail'];
                    span6.innerHTML = !pen_compaign['ad_status'] ? '<span class="badge badge-rounded pending-badge">Pending</span>' : "Active";
                    span7.innerHTML = `<a href="${pen_compaign['banner']}" style="text-decoration: none;" download="${new Date().getMilliseconds()}" class="download_banner_btn"><i class='bx bx-cloud-download'></i></a>`;
                    span7.setAttribute('class', 'd-flex justify-content-center align-items-center');
                    // APPEND EVERY SPAN TO ITS OWN COLUMN ELEMENT
                    ad_col1.append(span1);
                    ad_col2.append(span2);
                    ad_col3.append(span3);
                    ad_col4.append(span4);
                    ad_col5.append(span5);
                    ad_col6.append(span6);
                    ad_col7.append(span7);
                    // CREATE A DIV DOM ELEMENT
                    const compaign_actions = document.createElement('div');
                    compaign_actions.setAttribute('class', 'compaign-actions');
                    compaign_actions.innerHTML = "<a href='' data-id='' class='action_btn'><i class='bx bx-x'></i></a><a href='' data-id='' class='action_btn'><i class='bx bx-check-double'></i></a>";
                    ad_col8.append(compaign_actions);
                    // APPPEND AD COLUMNS TO TR ELEMET
                    pending_plans_row.append(ad_col1);
                    pending_plans_row.append(ad_col2);
                    pending_plans_row.append(ad_col3);
                    pending_plans_row.append(ad_col4);
                    pending_plans_row.append(ad_col5);
                    pending_plans_row.append(ad_col6);
                    pending_plans_row.append(ad_col7);
                    pending_plans_row.append(ad_col8);
                    // APPEND THE TR ELEMENT TO THE ROOT OF tbody TABLE ELEMENT
                    pending_ads_body_row.append(pending_plans_row);
                })
            } else {
                alert('SOMETHING WENT WRONG');
                console.log(data);
            }
        })
})();