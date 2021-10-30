/*-------- START SLICK SLIDER  --------*/
$(".flags_slider").slick({
    infinite: true,
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
    autoplay: true,
    autoplaySpeed: 1500
})

$(".articles_slider").slick({
    infinite: true,
    centerMode: true,
    focusOnSelect: true,
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 2200
})

// PLANS PRICES CARDSX SLIDER
$(".plans-cards-slider").slick({
    infinite: true,
    centerMode: true,
    focusOnSelect: true,
    dots: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 2200,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
    ]
})

/*-------- END SLICK SLIDER  --------*/

/*-------- START SROLLREVEAL ANIMATION  --------*/
// Hero Section
ScrollReveal().reveal(".H_S", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "top",
    interval: 200
})

ScrollReveal().reveal(".hero__buttons", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "right",
    interval: 280
})
// Dash Statics
ScrollReveal().reveal(".bx_1", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "left",
    interval: 250
})
ScrollReveal().reveal(".bx_2", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "top",
    interval: 330
})

ScrollReveal().reveal(".bx_3", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "right",
    interval: 420
})

// About Section 
ScrollReveal().reveal(".Abt_left", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "left",
    interval: 350
})

ScrollReveal().reveal(".Abt_right", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "right",
    interval: 350
})

// Features Section 
ScrollReveal().reveal(".Ft_1", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "right",
    interval: 250
})

ScrollReveal().reveal(".Ft_2", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "top",
    interval: 350
})

ScrollReveal().reveal(".Ft_3", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "bottom",
    interval: 450
})

ScrollReveal().reveal(".Ft_4", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "left",
    interval: 550
})

// Banner Content Section
ScrollReveal().reveal(".banner__content", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "top",
    interval: 300
})

// Countires Flags Section
ScrollReveal().reveal(".countries_flags", {
    reset: true,
    distance: '120px',
    duration: 1000,
    origin: "left",
    interval: 300
})

/*-------- END SROLLREVEAL ANIMATION  --------*/