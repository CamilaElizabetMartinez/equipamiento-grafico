
// get current url
var pathname = window.location.pathname;

// remove active class from all
$(".navbar > li").removeClass('active');

// add active class to div that matches active url
if ($(".navbar > li > a").attr("href") == pathname) {
    $("li > a[href='" + pathname + "']").addClass('active');
}
console.log($(".navbar-nav > a[href='" + pathname + "']"));
console.log($(".navbar > li > a").attr("href"));