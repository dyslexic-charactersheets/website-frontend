$(function () {

    // all pages



    // layouts

    $(".track-scroll").each(function () {

    });


    $(".btn-slide-in").click(function (evt) {
        var $btn = $(this);
        var rel = $btn.attr('rel');
        $("#"+rel).addClass('slide-in--active');
    });

    $(".slide-in__close").click(function (evt) {
        var $btn = $(this);
        $btn.closest(".slide-in").removeClass('slide-in--active');
    });


    // home




    // character build form

    $(".options-pane .option").click(function (evt) {
        var $btn = $(this);
        
        var key = $btn.data('key');
        var value = $btn.data('value');
        var text = $btn.text();
        var next = $btn.data('next');
        var reveal = $btn.data('reveal');

        var $field = $("#field-"+key);
        if ($field.is(".field--multi")) {

        } else {
            $field.find("input").val(value);
            $field.find(".field__readout").text(text);
            $field.find(".field__default").hide();
        }

        $btn.closest(".slide-in").removeClass('slide-in--active');

        $(".reveal-"+reveal).hide();
        if (next !== undefined && next != "") {
            $("#options-pane-"+next).addClass('slide-in--active');
            $("#reveal-"+next).show();
        }
    });

    $(".options-pane__other").click(function (evt) {
        var $btn = $(this);

        var key = $btn.data('key');
        // var next = $btn.data('next');
        var reveal = $btn.data('reveal');

        var $field = $("#field-"+key);
        
        if ($field.is(".field--multi")) {

        } else {
            $field.find("input").val('');
            $field.find(".field__readout").text('');
            $field.find(".field__default").show();
        }

        $btn.closest(".slide-in").removeClass('slide-in--active');
        
        $(".reveal-"+reveal).hide();
    });

    $("button.scroll-to").click(function () {
        var $btn = $(this);
        var target = $btn.attr('rel');
        var $target = $("#"+target);
        $target[0].scrollIntoView();
    });

});