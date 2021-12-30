// MINI BLOG API - 31/05/2021
// MINI BLOG REST API CREATED BY  ** MOUNIR EL BERTOULI **

/*----- START -----*/
const BASE_URL3 = 'https://www.snplnk.link';

// INITIATE THE HELPER FUNCTION (GetBlogData)
const GET_BLOG_DATA = async (url = '', data = {}, method = '') => {
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "Application/json"
        },

        body: JSON.stringify(data)
    })

    return response.json()
}

// VALIDATOR HELPER FOR VALIDATE INPUTS
const validator1 = {
    //IS EMPTY METHOD
    isEmpty(str) {
        if (str.trim() === '') {
            return true
        } else {
            return false
        }
    },

    // IS EMAIL METHOD
    isEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,4}$/;
        // CHECK IF EMAIL PROVIDED IS VALIDATE
        if (email.match(emailPattern)) {
            return true
        } else {
            return false;
        }
    },

    // IS LENGTH METHOD
    isLength(str, lng) {
        if (str.length < lng) {
            return true
        } else {
            return false
        }
    },

    // SET THE LENGTH MAX 
    isMax(str, max) {
        if (str.length > max) {
            return true;
        } else {
            return false;
        }
    }
}

// INITIATE THE HELPER FUNCTION (POST_DATA)
const POST_DATA = async (url = '', data = {}, method = '') => {
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "Application/json"
        },

        body: JSON.stringify(data)
    })

    return response.json()
}

// Truncate Blogs Body (Description)
const blogs_desc = document.getElementsByClassName('blog_desc');
const blogs_desc_arr = [...blogs_desc];

blogs_desc_arr.map(blog_desc => {
    let desc_str = blog_desc.innerText;
    function trunc_blog_desc(str, n) {
        blog_desc.innerHTML = str.length > n ? str.substr(0, n) + '***' : str;
    }; trunc_blog_desc(desc_str, 100);
})


// SINGLR BLOG ARTICLE BY ID
/*--- GET BTNS ELES (BLOGS) ---*/
const BLOGS_BTNS = document.getElementsByClassName('read-btn');
const BLOGS_BTNS_ARR = [...BLOGS_BTNS]; // ARRAY OF BTNS CLASS ELEMENTS

// LOOP THROUGH BTNS ARRAY TO GIVE TO EACH BTN AN EVENT (CLICK)
BLOGS_BTNS_ARR.map(async blog_btn => {
    // EVENT LISTENER (CLICK)
    blog_btn.addEventListener('click', () => {
        // GET BTN ID 
        const blog_id = blog_btn.getAttribute('data-id');
        /*await fetch(`http://localhost:4041/articles/${blog_id}`)
            .then(res => res.json()).then(data => {
                alert(data);
            })*/
        // CHECK IF THE BLOG ID NOT INCLUDED
        if (!blog_id) {
            alert('Article ID Not Included!')
            return window.location = '/'
        }
        window.location = `/blogs/blog?pid=${blog_id}`;
    })
})

/*------ BLOGS API / REMOVE BLOG ------*/
const BLOGS_RMV_BTNS = document.getElementsByClassName('remove_blog');
const RMV_BTNS_ARR = [...BLOGS_RMV_BTNS];

RMV_BTNS_ARR.map(rmv_btn => {
    const REMOVE_BLOG = async () => {
        // BTN DATA ID
        const BLOG_ID = rmv_btn.getAttribute('data-id');
        // URL ENDPOINT RESOURCE (DELETE)
        const API_URL_REMOVE = `${BASE_URL3}/blogs/delete`;
        // CONFIRM ALERT
        const isGranted = confirm('Are You Sure Wanna Remove?');
        if (isGranted) {
            await fetch(API_URL_REMOVE, {
                method: "DELETE",
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ pid: BLOG_ID })
            }).then(res => res.json())
                .then(data => {
                    if (data.confirmation) {
                        alert(data.message);
                        const TB_ROW = rmv_btn.parentElement.parentElement.parentElement;
                        TB_ROW.parentNode.removeChild(TB_ROW);
                    } else {
                        alert('Something Went Wrong!');
                        console.log('Something Went Wrong!');
                    }
                })
        } else {
            return;
        }
    };

    rmv_btn.addEventListener('click', REMOVE_BLOG);
})


/*--------  NEWS LETTER API / ADDING SUBSCRIBERS  ---------*/
const newsLetter_form = document.getElementById('newsletter-form');
newsLetter_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email_val = document.getElementById('newsLetter').value;
    // CHECK IF E-MAIL VALID
    if (!validator1.isEmail(email_val)) {
        //alert(`${email_val} Not Valid !`);
        swal({
            title: "Error: OOps!",
            text: `Error: ${email_val} Not Valid! Tru another one!`,
            icon: "warning",
            button: "I got it",
        });
        return;
    }

    POST_DATA(`${BASE_URL3}/api/newsletter/add`, { email: email_val }, 'POST').then(data => {
        if (data.status === 201) {
            swal({
                title: "Thank You !!",
                text: data.msg,
                icon: "success",
                button: "I got it",
            });
        } else if (data.status === 400) {
            swal({
                title: "Ops!",
                text: data.msg,
                icon: "warning",
                button: "I got it",
            });
        } else {
            swal({
                title: "Ops!",
                text: data.msg,
                icon: "warning",
                button: "I got it",
            });
        }
    })
})