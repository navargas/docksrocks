function nextCall(call) {
  call();
};

function slideDownWipe(callback) {
  var iter = 0;
  var limit = 70.0;
  var action = setInterval(function() {
    $('#mainbox').css('margin-top',iter + 'px');
    $('#mainbox').css('opacity', 1-(3*iter/limit));
    iter += 2;
    if (iter > limit) {
      clearInterval(action);
      if (callback) callback();
    }
  }, .1);
};

function displayElement(elementID) {
  if (elementID.indexOf('#') != 0) elementID = '#' + elementID;
  $('#mainbox').html($(elementID).html());
  $('#mainbox').css('margin-top','0px');
  $('#mainbox').css('opacity', '1');
};

function displayRemoteElement(uri) {

};

function show(element) {
  if (location.pathname != '/') {
    location.replace('/#' + element);
    return;
  }
  location.hash = element;
  slideDownWipe(function() {displayElement(element)});
};

$(function() {
  displayElement(location.hash || 'index');
});
