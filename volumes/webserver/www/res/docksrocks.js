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
  $('#mainbox').html($(elementID).html());
  $('#mainbox').css('margin-top','0px');
  $('#mainbox').css('opacity', '1');
};

function displayRemoteElement(uri) {

};

function showUpdate() {
  location.hash = 'update';
  slideDownWipe(function() {displayElement('#updatebox')});
};

function showImages() {
  location.hash = 'images';
  slideDownWipe(function() {displayElement('#aboutbox')});
};

function showHome() {
  location.hash = '';
  slideDownWipe(function() {displayElement('#indexbox')});
};

function showAlias() {
  location.hash = 'alias';
  slideDownWipe(function() {displayElement('#aliasbox')});
};

$(function() {
  displayElement('#indexbox');
});
