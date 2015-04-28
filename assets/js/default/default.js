$(function(){
    $("#qrcode").hide();
    $("#social").hover(function(){
        $("#qrcode").show();
    }, function(){
        $("#qrcode").hide();
    });

});