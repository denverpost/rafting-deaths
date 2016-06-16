var pathRoot = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':'+window.location.port : '') + window.location.pathname;
var href = location.href.split('/');
href.pop();
var adPathRoot = href.join('/') + '/';
var titleRoot = document.title;
var body = document.body, html = document.documentElement;
var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
var current = '';
var swapped = false;
var galleriesLoaded = [];
var adsloaded = [];
/* THIS IS CONFIG DATA SPECIFIC TO SITE */
var showAds = true; //show slide-up leaderboards at bottom
var slideAds = 1; //number of times to slide up a leaderboard
var titleFade = true; //whether to fade the Denver Post logo in the top-bar to show the "DP" and a text title
//var pages = ['#titlepage','#part1','#photos','#part2']; //div/section IDs that should trigger a page view and title change
var pages = [];
$('.omnitrig').each(function(i,e) { pages.push('#'+$(e).attr('id')) });
var galleries = [];
var playedVideos = [];
$('.centergallery').each(function(i,e) { galleries.push('#'+$(e).attr('id')) }); //div/section IDs of galleries to instantiate (must be a div like #photos and have a child, the gallery itself, with the same ID plus 'gallery' -- i.e. #photosgallery)

function revealSocial(type,link,title,image,desc,twvia,twrel) {
    title = typeof title !== 'undefined' ? title : false;
    image = typeof image !== 'undefined' ? image : false;
    desc = typeof desc !== 'undefined' ? desc : false;
    twvia = typeof twvia !== 'undefined' ? twvia.toString().replace('@','') : false;
    twrel = typeof twrel !== 'undefined' ? twrel.toString().replace('@','') : false;
    //type can be twitter, facebook or gplus
    var srcurl = '';
    if (type == 'twitter') {
        srcurl = 'http://twitter.com/intent/tweet?text=' + encodeURIComponent(title).replace('|','%7c') + '&url=' + link + '&via=' + twvia + '&related=' + twrel;
    } else if (type == 'facebook') {
        srcurl = 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + link + '&p[images][0]=' + image + '&p[title]=' + encodeURIComponent(title).replace('|','%7c') + '&p[summary]=' + encodeURIComponent(desc).replace('|','%7c');
    } else if (type == 'gplus') {
        srcurl = 'https://plus.google.com/share?url=' + link;
    }
    console.log(srcurl);
    if (srcurl.length > 1) {
        window.open(srcurl, type, 'left=60,top=60,width=500,height=500,toolbar=1,resizable=1').focus();
    }
    return false;
}

function load_omniture() {
        var omni = $('#omniture').html();
        $('#omniture').after('<div id="new_omni">' + omni + '</div>');
}
function build_url(path) {
        var url = pathRoot + path;
        return url;
}
function rewrite_url(path, new_title) {
        var url = build_url(path);
        current = path;
        document.title = (typeof new_title == 'undefined' || new_title.length < 1 ) ? titleRoot : new_title + ' - ' + titleRoot;
        window.history.replaceState('', new_title, url);
}

$(document).foundation('reveal', {
    animation: 'fade',
    animationspeed: 200
});
function revealCredits() {
    $('#credits').foundation('reveal', 'open');
}
function revealSlides(galleries) {
    for (key in galleries) {
        if (galleriesLoaded.indexOf(galleries[key]) == -1) {
            $(galleries[key]).find('img').unveil();
            $(galleries[key]).slick({
                centerMode: true,
                centerPadding: '0',
                slidesToShow: 1,
                prevArrow: '<button type="button" class="slick-prev"><span>&lt;</span></button>',
                nextArrow: '<button type="button" class="slick-next"><span>&gt;</span></button>',
                responsive: [{
                    breakpoint: 800,
                    settings: {
                        arrows: true,
                        centerMode: true,
                        centerPadding: '5%',
                        slidesToShow: 1
                    }
                }]
            });
            galleriesLoaded.push(galleries[key]);
        }
    }
}
function checkHash() {
    if (window.location.hash) {
        revealSlides(galleries);
        var hash = window.location.hash;
        if ($(hash).hasClass('hide')) {
            toggleSidebar(hash,hash + 'link');
        } else {
            scrollDownTo(hash);
        }
    }
}

function scrollDownTo(whereToScroll, scrollOffset) {
    scrollOffset = typeof scrollOffset !== 'undefined' ? scrollOffset : 60;
    if ($(whereToScroll).length) {
        $('html,body').animate({
            scrollTop: ($(whereToScroll).offset().top - scrollOffset)
        }, 300);
    } else {
        var new_url = window.location.href.split('#')[0];
        window.history.replaceState('', document.title, new_url);
    }
}

function toggleSidebar(toShow,toHide) {
    $(toShow).removeClass('hide');
    $(toHide).addClass('hide');
    rewrite_url(toShow);
    scrollDownTo(toShow);
}

function playerCreator(embedId, playerId, divId) {
    divId = typeof divId !== 'undefined' ? divId : false;
    if (divId) {
        $(divId).animate({backgroundColor:'rgba(0,70,70,0.3)',paddingLeft:'.5em',paddingRight:'.5em'}, 350).delay(2000).animate({backgroundColor:'transparent',paddingLeft:'0',paddingRight:'0'},1000);
    }
    if (playedVideos.indexOf(playerId) != 0) {
        playedVideos.push(playerId);
        $('#' + embedId).html('<video id="'+embedId+'player" preload controls autoplay> \n\
            <source src="./video/'+playerId+'.mp4" /> \n\
            <source src="./video/'+playerId+'.webm" /> \n\
        </video>');
        $('#' + embedId).css('cursor','default');
    }
}

function playerScroller(embedId, playerId, divId) {
    scrollDownTo(('#' + embedId),100);
    playerCreator(embedId, playerId, divId);
}
function getNodePosition(node) {
    var eTop = $(node).offset().top;
    return Math.abs(eTop - $(window).scrollTop());
}
function isVisible(element) {
    var vidTop = $(element).offset().top;
    var vidBot = $(element).offset().top + $(element).height();
    var fromTop = $(window).scrollTop() + $(element).height() / 2;
    if ( fromTop > vidTop && fromTop < vidBot ) {
        return true;
    } else {
        return false;
    }
}

function isElementInViewport(el) {
    el = el.toString().replace('#','');
    if (document.getElementById(el) != null) {
        var rect = document.getElementById(el).getBoundingClientRect();
        var half = window.innerHeight / 2;
        var whole = window.innerHeight;
        return ( (rect.top > 0 && rect.top < half) || (rect.bottom < whole && rect.bottom > half) || (rect.top < 0 && rect.bottom > whole) );
    } else {
        return;
    }
}

$('.top-top').click(function(evt) {
    $('.toggle-topbar').click();
});

$('.vid-embed').on("mouseenter", function() {
    $(this).find('.playicon').fadeTo(300, 0);
    $(this).find('.playtext').fadeTo(300, 1);
});
$('.vid-embed').on("mouseleave", function() {
    $(this).find('.playicon').fadeTo(300, 1);
    $(this).find('.playtext').fadeTo(300, 0);
});

function fadeNavBar(reverse) {
    if (reverse) {
        $('#name1').animate({opacity:1},500);
        $('#name2').animate({opacity:0},500);
        titleFade = true;
    } else {
        $('#name1').animate({opacity:0},500);
        $('#name2').animate({opacity:1},500);
        titleFade = false;
    }
}

function checkFade() {
    if ( !($(window).scrollTop() < window.innerHeight) && titleFade ) {
        fadeNavBar(false);
    } else if ( ($(window).scrollTop() < window.innerHeight) && !titleFade) {
        fadeNavBar(true);
    }
}

function hideAdManual() {
    $('#adwrapper').fadeOut(300);
    $('#adwrapper a.boxclose').css('display', 'none');
    $('#footer-bar').delay(150).animate({marginBottom:'0'},300);
    $('#adframewrapper').html('');
    swapped = false;
}

$(document).keyup(function(e) {
    if (swapped && e.keyCode == 27) {
        hideAdManual();
    }    
});

function getAdSize() {
    if ( $(window).width() >= 740 ) {
        var adSizes = ['ad=medium','728','90'];
        return adSizes;
    } else {
        return false;
    }
    /* else if ( $(window).width() >= 300 && $(window).width() < 740 ) {
        var adSizes = ['ad=small','300','50'];
        return adSizes;
    }*/
}

function showAd() {
    var adSize = getAdSize();
    if (adSize) {
        $('#adframewrapper').html('<iframe src="' + adPathRoot + 'ad.html?' + adSize[0] + '" seamless height="' + adSize[2] + '" width="' + adSize[1] + '" frameborder="0"></iframe>');
        $('#adwrapper').fadeIn(400);
        $('a.boxclose').fadeIn(400);
        var adH = $('#adwrapper').height();
        $('#footer-bar').css('margin-bottom',adH);
        swapped = true;
    }
}

function swapAd() {
    if (swapped) {
        hideAdManual();
    }
    if (!swapped) {
        showAd();
    }
}

function getAdTimes(numAds) {
    var adReturns = [];
    var chunkHeight = docHeight / numAds;
    var chunkHalf = chunkHeight / 2;
    for (i=0;i<numAds;i++) {
        adReturns.push( Math.round( chunkHalf + (chunkHeight * i) ) );
    }
    return adReturns;
}

function checkAdPos() {
    if (showAds) {
        var topNow = $(window).scrollTop();
        if (!swapped) {
            var adTimes = getAdTimes(slideAds);
            for (var i = 0; i < adTimes.length; i++) {
                if (!adsloaded[i] && topNow > adTimes[i] && topNow < (typeof adTimes[(i+1)] !== 'undefined' ? adTimes[(i+1)] : docHeight)) {
                    swapAd();
                    adsloaded[i] = true;
                    break;
                }
            }
        }
    }
}

function checkPageState(pages) {
    for (key in pages) {
        if ($(window).scrollTop() < 100) {
            rewrite_url('','');
            break;
        }
        var currentpage = pages[key];
        var next = (pages[parseInt(key) + 1]) ? pages[parseInt(key) + 1] : currentpage;
        var prev = (pages[parseInt(key) - 1]) ? pages[parseInt(key) - 1] : currentpage;
        if (isElementInViewport(currentpage) && currentpage != current) {
            var triggerDiv = $(currentpage);
            rewrite_url(currentpage.toString(),$(triggerDiv).data('omniTitle'));
            if ($(triggerDiv).hasClass('omnitrig')) {
                load_omniture();
                $(triggerDiv).removeClass('omnitrig');
            }
        }
    }
	if (isElementInViewport('#next-page')) {
            hideAdManual();   
        }
}

$('.chart-late').find('img').unveil(300);

$(document).ready(function() {
    checkHash();
    checkAdPos();
});

var didScroll = false;
$(window).scroll(function() {
    didScroll = true;    
});
setInterval(function() {
    if (didScroll) {
        checkFade();
        checkPageState(pages);
        revealSlides(galleries);
        checkAdPos();
    }
},250);

var map = L.map('rafting-death-map');

L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

map.setView([39.1, -105.5], 7);

var johnsonMarker = L.marker([38.98329, -106.21427]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Pine Creek Rapid' + '</h3>' + 'Arkansas River' + '<br>' + 'Class IV-V rapids' + '<br>' + 'Guide: Timberline Tours' + '<hr class="popup">' + '<strong>' + 'Mary Johnson' + '</strong>' + ', 57' + '<br>' + 'July 24, 2014' + '<br>' + '<a href="#johnson-profile">Read narrative</a>');
document.getElementById("johnson").addEventListener("click", function() {
    map.flyTo([38.98329, -106.21427], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var barkleyMarker = L.marker([39.74501, -105.43424]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Lower Beaver Falls' + '</h3>' + 'Clear Creek' + '<br>' + 'Class III-IV rapids' + '<br>' + 'Guide: Highside Adventures' + '<hr class="popup">' + '<strong>' + 'Kenneth Barkley' + '</strong>' + ', 43' + '<br>' + 'June 7, 2014' + '<br>' + '<a href="#barkley-profile">Read narrative</a>');
document.getElementById("barkley").addEventListener("click", function() {
    map.flyTo([39.74501, -105.43424], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var durkeeMarker = L.marker([38.6839, -106.04364]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Big Drop' + '</h3>' + 'Arkansas River' + '<br>' + 'Class III rapids' + '<br>' + '<hr class="popup">' + '<strong>' + 'Drake Durkee' + '</strong>' + ', 11' + '<br>' + 'June 10, 2015' + '<br>' + 'See main story');
document.getElementById("durkee").addEventListener("click", function() {
    map.flyTo([38.6839, -106.04364], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var hernandezMarker = L.marker([38.4517, -105.51921]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Three Rocks Rapid' + '</h3>' + 'Arkansas River' + '<br>' + 'Class IV-V rapids' + '<br>' + 'Guide: Whitewater Adventure Outfitters' + '<hr class="popup">' + '<strong>' + 'Eduardo Hernandez' + '</strong>' + ', 52' + '<br>' + 'June 13, 2015' + '<br>' + '<a href="#hernandez-profile">Read narrative</a>');
document.getElementById("hernandez").addEventListener("click", function() {
    map.flyTo([38.4517, -105.51921], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var hodgesMarker = L.marker([38.45654, -105.50857]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Three Rocks Rapid' + '</h3>' + 'Arkansas River' + '<br>' + 'Class IV rapids' + '<br>' + 'Guide: Royal Gorge Rafting' + '<hr class="popup">' + '<strong>' + 'Van Hodges' + '</strong>' + ', 48' + '<br>' + 'June 10, 2014' + '<br>' + '<a href="#hodges-profile">Read narrative</a>');
document.getElementById("hodges").addEventListener("click", function() {
    map.flyTo([38.45654, -105.50857], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var sevillaMarker = L.marker([38.46716, -105.33245]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Squeeze Box in the Royal Gorge' + '</h3>' + 'Arkansas River' + '<br>' + 'Class IV-V rapids' + '<br>' + 'Guide: Raft Masters' + '<hr class="popup">' + '<strong>' + 'Chris Sevilla' + '</strong>' + ', 45' + '<br>' + 'June 14, 2014' + '<br>' + '<a href="#sevilla-profile">Read narrative</a>');
document.getElementById("sevilla").addEventListener("click", function() {
    map.flyTo([38.46716, -105.33245], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var sizemoreMarker = L.marker([39.22989, -106.86465]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Hell\'s Half Mile' + '</h3>' + 'Slaughterhouse section of' + '<br>' + 'the Roaring Fork River' + '<br>' + 'Class IV rapids' + '<br>' + 'Guide: Blazing Adventures' + '<hr class="popup">' + '<strong>' + 'Paul Sizemore' + '</strong>' + ', 45' + '<br>' + 'June 16, 2014' + '<br>' + '<a href="#sizemore-profile">Read narrative</a>');
document.getElementById("sizemore").addEventListener("click", function() {
    map.flyTo([39.22989, -106.86465], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var sotoMarker = L.marker([37.25898, -107.87744]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Smelter Rapid' + '</h3>' + 'Lower Animas River' + '<br>' + 'Class IV rapids' + '<br>' + 'Guide: Mild to Wild' + '<hr class="popup">' + '<strong>' + 'Jose Soto' + '</strong>' + ', 57' + '<br>' + 'June 16, 2015' + '<br>' + '<a href="#soto-profile">Read narrative</a>');
document.getElementById("soto").addEventListener("click", function() {
    map.flyTo([37.25898, -107.87744], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var palmerMarker = L.marker([40.68714, -105.30069]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Horseshoe Rapid' + '</h3>' + 'Cache le Poudre River' + '<br>' + 'Class III rapids' + '<br>' + 'Guide: A1 Wildwater' + '<hr class="popup">' + '<strong>' + 'Ronald Palmer' + '</strong>' + ', 77' + '<br>' + 'July 7, 2015' + '<br>' + '<a href="#palmer-profile">Read narrative</a>');
document.getElementById("palmer").addEventListener("click", function() {
    map.flyTo([40.68714, -105.30069], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var lunaMarker = L.marker([39.74494, -105.48909]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Dizzy Lizzy Rapid' + '</h3>' + 'Clear Creek' + '<br>' + 'Class III rapids' + '<br>' + 'Guide: Mile Hi Rafting' + '<hr class="popup">' + '<strong>' + 'Erik Luna' + '</strong>' + ', 36' + '<br>' + 'July 18, 2015' + '<br>' + '<a href="#luna-profile">Read narrative</a>');
document.getElementById("luna").addEventListener("click", function() {
    map.flyTo([39.74494, -105.48909], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var cheongMarker = L.marker([39.73742, -105.4172]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Double Knife Rapid' + '</h3>' + 'Clear Creek' + '<br>' + 'Class IV rapids' + '<br>' + 'Guide: Mile Hi Rafting' + '<hr class="popup">' + '<strong>' + 'Chun Yip \"Daniel\" Cheong' + '</strong>' + ', 21' + '<br>' + 'July 4, 2015' + '<br>' + '<a href="#cheong-profile">Read narrative</a>');
document.getElementById("cheong").addEventListener("click", function() {
    map.flyTo([39.73742, -105.4172], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});
var mathMarker = L.marker([39.73936, -105.4148]).addTo(map)
    .bindPopup('<h3 class="popup">' + 'Double Knife Rapid' + '</h3>' + 'Clear Creek' + '<br>' + 'Class IV rapids' + '<br>' + 'Guide: All American Adventures' + '<hr class="popup">' + '<strong>' + 'Michelle Math' + '</strong>' + ', 48' + '<br>' + 'May 22, 2015' + '<br>' + '<a href="#math-profile">Read narrative</a>');
document.getElementById("math").addEventListener("click", function() {
    map.flyTo([39.73936, -105.4148], 15, {
        animate: true,
        duration: 4 // in seconds
    });
});